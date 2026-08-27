"""
AgroWatch ML Detector
Wraps YOLOv8 inference for crop-specific disease detection.
"""

import os
from pathlib import Path
from typing import List, Dict, Any

# Absolute path to the model weights directory
WEIGHTS_DIR = Path(__file__).resolve().parent / "mlweights"

MODEL_PATHS = {
    "tomato": WEIGHTS_DIR / "tomato.pt",
    "maize": WEIGHTS_DIR / "maize.pt",
    "pineapple": WEIGHTS_DIR / "pineapple.pt",
}

# Lazy-loaded YOLO model cache so we don't re-load on every request
_model_cache: Dict[str, Any] = {}


def _load_model(crop_type: str):
    """Load and cache the YOLO model for a given crop type."""
    if crop_type not in _model_cache:
        try:
            from ultralytics import YOLO
        except ImportError:
            raise RuntimeError(
                "ultralytics is not installed. Run: pip install ultralytics"
            )
        weight_path = MODEL_PATHS.get(crop_type)
        if not weight_path or not weight_path.exists():
            raise FileNotFoundError(
                f"Model weights not found for crop '{crop_type}' at {weight_path}"
            )
        _model_cache[crop_type] = YOLO(str(weight_path))
    return _model_cache[crop_type]


def run_detection(image_path: str, crop_type: str, conf_threshold: float = 0.25) -> List[Dict]:
    """
    Run YOLOv8 object detection on a single image.

    Args:
        image_path:     Absolute path to the image file.
        crop_type:      One of "tomato", "maize", "pineapple".
        conf_threshold: Minimum confidence score to keep a detection.

    Returns:
        List of dicts, each containing:
            {
                "x": float,              # Bounding box centre X (pixels)
                "y": float,              # Bounding box centre Y (pixels)
                "w": float,              # Bounding box width  (pixels)
                "h": float,              # Bounding box height (pixels)
                "confidence": float,     # Model confidence 0-1
                "class_id": int,         # YOLO class index
                "class_name": str,       # YOLO class label
                "is_disease": bool,      # True if the class is not "healthy"
            }
    """
    model = _load_model(crop_type)
    results = model.predict(
        source=image_path,
        conf=conf_threshold,
        verbose=False,
        save=False,
    )

    detections = []
    for result in results:
        boxes = result.boxes
        names = result.names  # {class_id: "label"}
        for box in boxes:
            cls_id = int(box.cls[0])
            raw_name = names.get(cls_id, str(cls_id)).lower().strip().replace(" ", "_")
            if raw_name == "northern_leaf_blight":
                norm_name = "northern_blight"
            elif raw_name == "leaf_curl_virus":
                norm_name = "leaf_curl"
            elif raw_name == "septoria_leaf_spot":
                norm_name = "septoria"
            elif raw_name in ("gray_leaf_spot", "grey_leaf_spot"):
                norm_name = "gray_leaf_spot"
            else:
                norm_name = raw_name

            cls_name = f"{crop_type}_{norm_name}" if not norm_name.startswith(f"{crop_type}_") else norm_name
            x_c, y_c, w, h = box.xywh[0].tolist()
            conf = float(box.conf[0])

            # Treat any class that does not contain "healthy" as a disease flag
            is_disease = "healthy" not in cls_name

            detections.append({
                "x": round(x_c, 2),
                "y": round(y_c, 2),
                "w": round(w, 2),
                "h": round(h, 2),
                "confidence": round(conf, 4),
                "class_id": cls_id,
                "class_name": cls_name,
                "is_disease": is_disease,
            })

    return detections


def summarise_detections(detections: List[Dict]) -> Dict:
    """
    Compute aggregate statistics from a list of detection dicts.

    Returns:
        {
            "total_plants": int,
            "disease_flags": int,
            "healthy_count": int,
        }
    """
    total = len(detections)
    disease = sum(1 for d in detections if d["is_disease"])
    return {
        "total_plants": total,
        "disease_flags": disease,
        "healthy_count": total - disease,
    }
