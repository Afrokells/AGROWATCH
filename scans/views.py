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
        if user.is_authenticated:
            role = getattr(user, 'user_role', None) or getattr(user, 'role', None)
            if role == 'farmer':
                queryset = queryset.filter(farm__farmer=user)
        return queryset

    def create(self, request, *args, **kwargs):
        """
        Accept multipart/form-data POST containing:
          - farm          (int/str)  Farm FK
          - crop_type     (str)      "tomato" | "maize" | "pineapple"
          - images[]      (files)    One or more uploaded image files
          - batch_mode    (bool/str) If true or multiple images, processes each as an individual scan
        """
        try:
            raw_farm_id = request.data.get("farm")
            crop_type = request.data.get("crop_type", "").lower().strip()
            images = request.FILES.getlist("images")
            batch_mode = str(request.data.get("batch_mode", "true")).lower() in ("true", "1", "yes")

            # ── Safe Farm FK Resolution ──────────────────────────────────────────
            from farms.models import Farm
            from users.models import User

            farm_obj = None
            if raw_farm_id and str(raw_farm_id).isdigit():
                farm_obj = Farm.objects.filter(pk=int(raw_farm_id)).first()

            if not farm_obj:
                if request.user.is_authenticated:
                    farm_obj = Farm.objects.filter(farmer=request.user).first()
                if not farm_obj:
                    farm_obj = Farm.objects.first()

            if not farm_obj:
                default_user = request.user if request.user.is_authenticated else User.objects.first()
                if not default_user:
                    default_user = User.objects.create_user(
                        username="farmer_default",
                        phone_number="+233000000000",
                        full_name="Farm Plot Owner",
                        user_role="farmer"
                    )
                farm_obj = Farm.objects.create(
                    farm_name="Main Farm Plot",
                    farmer=default_user,
                    crop_type=crop_type or "tomato",
                    region="Volta Region",
                    area_ha=1.0
                )

            if not crop_type:
                crop_type = (farm_obj.crop_type or "tomato").lower()

            metrics = CROP_METRICS.get(crop_type, CROP_METRICS["tomato"])

            # ── Fallback for Simulated / Zero-Image Scan ─────────────────────────
            if not images:
                scan = Scan.objects.create(
                    farm=farm_obj,
                    crop_type=crop_type,
                    status="completed",
                    image_count=int(request.data.get("image_count", 0)),
                    total_plants=int(request.data.get("total_plants", 0)),
                    disease_flags=int(request.data.get("disease_flags", 0)),
                    identity_switches=int(request.data.get("identity_switches", 0)),
                    mota=float(request.data.get("mota", 0)),
                    precision=metrics["precision"],
                    recall=metrics["recall"],
                    f1_score=metrics["f1_score"],
                )
                return Response(ScanSerializer(scan).data, status=status.HTTP_201_CREATED)

            from crop_validator import validate_crop_image
            from mltracker import run_tracking

            created_scans = []

            # ── Batch Mode (Multiple images processed individually at a go) ──────
            if len(images) > 1 and batch_mode:
                for idx, img in enumerate(images):
                    suffix = os.path.splitext(img.name)[1] or ".jpg"
                    tmp_path = None
                    try:
                        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                            for chunk in img.chunks():
                                tmp.write(chunk)
                            tmp_path = tmp.name

                        # Domain & species validation
                        is_valid, reason, val_metrics = validate_crop_image(tmp_path, crop_type)
                        if not is_valid:
                            continue

                        scan = Scan.objects.create(
                            farm=farm_obj,
                            crop_type=crop_type,
                            status="processing",
                            image_count=1,
                            image=img,
                            precision=metrics["precision"],
                            recall=metrics["recall"],
                            f1_score=metrics["f1_score"],
                        )

                        tracking_result = run_tracking([tmp_path], crop_type)

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
                            for det in tracking_result.get("tracked_detections", [])
                        ]
                        Detection.objects.bulk_create(detection_objs)

                        scan.total_plants      = tracking_result.get("total_plants", 0)
                        scan.disease_flags     = tracking_result.get("disease_flags", 0)
                        scan.identity_switches = tracking_result.get("id_switches", 0)
                        scan.mota              = tracking_result.get("mota_approx", 0.0)
                        scan.status            = "completed"
                        scan.save()
                        created_scans.append(scan)

                    except Exception as exc:
                        print(f"[AgroWatch Batch ML] Image {idx} processing notice: {exc}")
                    finally:
                        if tmp_path and os.path.exists(tmp_path):
                            try:
                                os.unlink(tmp_path)
                            except OSError:
                                pass

                if not created_scans:
                    return Response(
                        {"detail": "None of the uploaded images passed crop validation. Please ensure photos clearly show your selected crop."},
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

            # ── Single Scan Mode ─────────────────────────────────────────────────
            tmp_paths = []
            try:
                for img in images:
                    suffix = os.path.splitext(img.name)[1] or ".jpg"
                    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                        for chunk in img.chunks():
                            tmp.write(chunk)
                        tmp_paths.append(tmp.name)

                # Validate Image Domain & Species
                is_valid, reason, val_metrics = validate_crop_image(tmp_paths[0], crop_type)
                if not is_valid:
                    return Response(
                        {"detail": reason, "validation_error": True, "metrics": val_metrics},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                scan = Scan.objects.create(
                    farm=farm_obj,
                    crop_type=crop_type,
                    status="processing",
                    image_count=len(images),
                    image=images[0],
                    precision=metrics["precision"],
                    recall=metrics["recall"],
                    f1_score=metrics["f1_score"],
                )

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
                    for det in tracking_result.get("tracked_detections", [])
                ]
                Detection.objects.bulk_create(detection_objs)

                scan.total_plants      = tracking_result.get("total_plants", 0)
                scan.disease_flags     = tracking_result.get("disease_flags", 0)
                scan.identity_switches = tracking_result.get("id_switches", 0)
                scan.mota              = tracking_result.get("mota_approx", 0.0)
                scan.status            = "completed"
                scan.save()

                return Response(ScanSerializer(scan).data, status=status.HTTP_201_CREATED)

            except Exception as exc:
                import traceback
                print(f"[AgroWatch ML] Inference failed. Error: {exc}")
                traceback.print_exc()
                return Response(
                    {"detail": f"Image analysis failed: {str(exc)}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            finally:
                for path in tmp_paths:
                    try:
                        os.unlink(path)
                    except OSError:
                        pass

        except Exception as top_exc:
            import traceback
            print(f"[AgroWatch Top Error]: {top_exc}")
            traceback.print_exc()
            return Response(
                {"detail": f"Scan processing error: {str(top_exc)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class DetectionViewSet(viewsets.ModelViewSet):
    queryset = Detection.objects.all()
    serializer_class = DetectionSerializer
    permission_classes = [IsAuthenticated]
