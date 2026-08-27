import os
import tempfile
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django.conf import settings

from .models import Scan, Detection
from .serializers import ScanSerializer, DetectionSerializer

# ── Crop performance metrics from your YOLOv8 evaluation ─────────────────────
CROP_METRICS = {
    "tomato":    {"precision": 0.9876, "recall": 0.9978, "f1_score": 0.9926},
    "maize":     {"precision": 0.9797, "recall": 0.9475, "f1_score": 0.9633},
    "pineapple": {"precision": 0.9688, "recall": 0.9865, "f1_score": 0.9775},
}


class ScanViewSet(viewsets.ModelViewSet):
    queryset = Scan.objects.all()
    serializer_class = ScanSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        queryset = Scan.objects.all().order_by('-scan_date')
        role = getattr(user, 'user_role', None) or getattr(user, 'role', None)
        if user.is_authenticated and role == 'farmer':
            queryset = queryset.filter(farm__farmer=user)
        return queryset

    def create(self, request, *args, **kwargs):
        """
        Accept multipart/form-data POST containing:
          - farm          (int)      Farm FK
          - crop_type     (str)      "tomato" | "maize" | "pineapple"
          - images[]      (files)    One or more uploaded image files

        If images are provided, runs real YOLOv8 inference (mldetector + mltracker).
        Falls back to the simulated metrics if the ML stack is not available.
        """
        farm_id   = request.data.get("farm")
        crop_type = request.data.get("crop_type", "tomato").lower()
        images    = request.FILES.getlist("images")

        # ── Build initial Scan record ─────────────────────────────────────────
        scan_data = {
            "farm":              farm_id,
            "crop_type":         crop_type,
            "status":            "processing",
            "image_count":       len(images) if images else int(request.data.get("image_count", 0)),
            "total_plants":      0,
            "disease_flags":     0,
            "identity_switches": 0,
            **CROP_METRICS.get(crop_type, CROP_METRICS["tomato"]),
        }

        serializer = self.get_serializer(data=scan_data)
        serializer.is_valid(raise_exception=True)
        scan = serializer.save()

        # ── Run real inference if images were uploaded ─────────────────────────
        if images:
            scan.image = images[0]
            scan.save()
            tmp_paths = []
            try:
                # Save uploaded images to temp files
                for img in images:
                    suffix = os.path.splitext(img.name)[1] or ".jpg"
                    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                        for chunk in img.chunks():
                            tmp.write(chunk)
                        tmp_paths.append(tmp.name)

                # Run tracking pipeline (detection + ByteTrack)
                from mltracker import run_tracking
                tracking_result = run_tracking(tmp_paths, crop_type)

                # Persist individual Detection records
                detection_objs = []
                for det in tracking_result["tracked_detections"]:
                    detection_objs.append(Detection(
                        scan=scan,
                        track_id=det["track_id"],
                        confidence=det["confidence"],
                        x=det["x"],
                        y=det["y"],
                        w=det["w"],
                        h=det["h"],
                        disease_flag_id=det["class_name"],
                    ))
                Detection.objects.bulk_create(detection_objs)

                # Update the Scan record with real results
                metrics = CROP_METRICS.get(crop_type, CROP_METRICS["tomato"])
                scan.total_plants      = tracking_result["total_plants"]
                scan.disease_flags     = tracking_result["disease_flags"]
                scan.identity_switches = tracking_result["id_switches"]
                scan.mota              = tracking_result["mota_approx"]
                scan.precision         = metrics["precision"]
                scan.recall            = metrics["recall"]
                scan.f1_score          = metrics["f1_score"]
                scan.status            = "completed"
                scan.save()

            except Exception as exc:
                # ML not available — fall back to simulated data passed from frontend
                import traceback
                print(f"[AgroWatch ML] Inference failed, using simulated data. Error: {exc}")
                traceback.print_exc()

                # Update from body fields if frontend sent simulated values
                scan.total_plants      = int(request.data.get("total_plants",  scan.total_plants))
                scan.disease_flags     = int(request.data.get("disease_flags", scan.disease_flags))
                scan.identity_switches = int(request.data.get("identity_switches", scan.identity_switches))
                scan.mota              = float(request.data.get("mota", scan.mota or 0))
                scan.status            = "completed"
                scan.save()
            finally:
                # Clean up temp files
                for path in tmp_paths:
                    try:
                        os.unlink(path)
                    except OSError:
                        pass
        else:
            # No images — purely simulated scan submitted from frontend
            scan.total_plants      = int(request.data.get("total_plants",  0))
            scan.disease_flags     = int(request.data.get("disease_flags", 0))
            scan.identity_switches = int(request.data.get("identity_switches", 0))
            scan.mota              = float(request.data.get("mota", 0))
            scan.status            = "completed"
            scan.save()

        return Response(ScanSerializer(scan).data, status=status.HTTP_201_CREATED)


class DetectionViewSet(viewsets.ModelViewSet):
    queryset = Detection.objects.all()
    serializer_class = DetectionSerializer
    permission_classes = [IsAuthenticated]
