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
          - batch_mode    (bool/str) If true or multiple images, processes each as an individual scan

        If images are provided, runs real YOLOv8 inference (crop_validator + mltracker).
        """
        farm_id    = request.data.get("farm")
        crop_type  = request.data.get("crop_type", "tomato").lower()
        crop_type  = request.data.get("crop_type", "").lower().strip()
        images     = request.FILES.getlist("images")
        batch_mode = str(request.data.get("batch_mode", "true")).lower() in ("true", "1", "yes")

        # ── Validate Farm FK ──────────────────────────────────────────────────
        if not farm_id:
            return Response(
                {"detail": "Please select a valid farm plot to scan."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        from farms.models import Farm
        try:
            farm_obj = Farm.objects.get(pk=farm_id)
            if not crop_type:
                crop_type = farm_obj.crop_type.lower()
        except Farm.DoesNotExist:
            return Response(
                {"detail": f"Farm with ID {farm_id} does not exist."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not crop_type:
            crop_type = "tomato"

        if not images:
            # Simulated / Manual single scan fallback
            scan_data = {
                "farm":              farm_id,
                "crop_type":         crop_type,
                "status":            "completed",
                "image_count":       int(request.data.get("image_count", 0)),
                "total_plants":      int(request.data.get("total_plants", 0)),
                "disease_flags":     int(request.data.get("disease_flags", 0)),
                "identity_switches": int(request.data.get("identity_switches", 0)),
                "mota":              float(request.data.get("mota", 0)),
                **CROP_METRICS.get(crop_type, CROP_METRICS["tomato"]),
            }
            serializer = self.get_serializer(data=scan_data)
            serializer.is_valid(raise_exception=True)
            scan = serializer.save()
            return Response(ScanSerializer(scan).data, status=status.HTTP_201_CREATED)

        from crop_validator import validate_crop_image
        from mltracker import run_tracking

        created_scans = []
        metrics = CROP_METRICS.get(crop_type, CROP_METRICS["tomato"])

        # ── Handle Batch Mode (Two or more scans at a go) ──────────────────────
        if len(images) > 1 and batch_mode:
            for idx, img in enumerate(images):
                suffix = os.path.splitext(img.name)[1] or ".jpg"
                tmp_path = None
                try:
                    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                        for chunk in img.chunks():
                            tmp.write(chunk)
                        tmp_path = tmp.name

                    # Validate domain for each image
                    is_valid, reason, val_metrics = validate_crop_image(tmp_path, crop_type)
                    if not is_valid:
                        # Skip or return error if all fail
                        continue

                    # Create Scan record
                    scan = Scan.objects.create(
                        farm_id=farm_id,
                        crop_type=crop_type,
                        status="processing",
                        image_count=1,
                        image=img,
                        precision=metrics["precision"],
                        recall=metrics["recall"],
                        f1_score=metrics["f1_score"],
                    )

                    # Run tracking for this individual image
                    tracking_result = run_tracking([tmp_path], crop_type)

                    # Create detections
                    detection_objs = [
                        Detection(
                            scan=scan,
                            track_id=det["track_id"],
                            confidence=det["confidence"],
                            x=det["x"],
                            y=det["y"],
                            w=det["w"],
                            h=det["h"],
                            disease_flag_id=det["class_name"],
                        )
                        for det in tracking_result["tracked_detections"]
                    ]
                    Detection.objects.bulk_create(detection_objs)

                    scan.total_plants      = tracking_result["total_plants"]
                    scan.disease_flags     = tracking_result["disease_flags"]
                    scan.identity_switches = tracking_result["id_switches"]
                    scan.mota              = tracking_result["mota_approx"]
                    scan.status            = "completed"
                    scan.save()
                    created_scans.append(scan)

                except Exception as exc:
                    print(f"[AgroWatch Batch ML] Error processing image {idx}: {exc}")
                finally:
                    if tmp_path and os.path.exists(tmp_path):
                        try:
                            os.unlink(tmp_path)
                        except OSError:
                            pass

            if not created_scans:
                return Response(
                    {"detail": "None of the uploaded images passed crop validation or could be analyzed. Please check your photos."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            return Response(
                {
                    "batch": True,
                    "created_count": len(created_scans),
                    "id": created_scans[0].id,
                    "scans": ScanSerializer(created_scans, many=True).data,
                },
                status=status.HTTP_201_CREATED,
            )

        # ── Single Scan / Multi-frame Sequence Mode ───────────────────────────
        tmp_paths = []
        try:
            for img in images:
                suffix = os.path.splitext(img.name)[1] or ".jpg"
                with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                    for chunk in img.chunks():
                        tmp.write(chunk)
                    tmp_paths.append(tmp.name)

            # Validate Image Domain
            is_valid, reason, val_metrics = validate_crop_image(tmp_paths[0], crop_type)
            if not is_valid:
                return Response(
                    {"detail": reason, "validation_error": True, "metrics": val_metrics},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            scan = Scan.objects.create(
                farm_id=farm_id,
                crop_type=crop_type,
                status="processing",
                image_count=len(images),
                image=images[0],
                precision=metrics["precision"],
                recall=metrics["recall"],
                f1_score=metrics["f1_score"],
            )

            # Run tracking pipeline
            tracking_result = run_tracking(tmp_paths, crop_type)

            detection_objs = [
                Detection(
                    scan=scan,
                    track_id=det["track_id"],
                    confidence=det["confidence"],
                    x=det["x"],
                    y=det["y"],
                    w=det["w"],
                    h=det["h"],
                    disease_flag_id=det["class_name"],
                )
                for det in tracking_result["tracked_detections"]
            ]
            Detection.objects.bulk_create(detection_objs)

            scan.total_plants      = tracking_result["total_plants"]
            scan.disease_flags     = tracking_result["disease_flags"]
            scan.identity_switches = tracking_result["id_switches"]
            scan.mota              = tracking_result["mota_approx"]
            scan.status            = "completed"
            scan.save()

            return Response(ScanSerializer(scan).data, status=status.HTTP_201_CREATED)

        except Exception as exc:
            import traceback
            print(f"[AgroWatch ML] Inference failed. Error: {exc}")
            traceback.print_exc()
            return Response(
                {"detail": "Image analysis failed. Check the server logs for the inference error."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        finally:
            for path in tmp_paths:
                try:
                    os.unlink(path)
                except OSError:
                    pass


class DetectionViewSet(viewsets.ModelViewSet):
    queryset = Detection.objects.all()
    serializer_class = DetectionSerializer
    permission_classes = [IsAuthenticated]
