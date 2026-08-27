"""
Scratch script to verify the YOLOv8 model weights load and run correctly.
Run with: python scratch/test_yolo.py
"""
import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import numpy as np
from pathlib import Path

WEIGHTS_DIR = Path(__file__).resolve().parent.parent / "mlweights"

def test_crop(crop_type: str):
    print(f"\n{'='*50}")
    print(f"  Testing: {crop_type}.pt")
    print(f"{'='*50}")
    weight_path = WEIGHTS_DIR / f"{crop_type}.pt"
    if not weight_path.exists():
        print(f"  [SKIP] Weight not found: {weight_path}")
        return

    from ultralytics import YOLO
    model = YOLO(str(weight_path))
    print(f"  Model loaded. Task: {model.task}  Classes: {list(model.names.values())[:10]}")

    # Create a synthetic black image (640x640x3)
    dummy_img = np.zeros((640, 640, 3), dtype=np.uint8)
    results = model.predict(source=dummy_img, conf=0.1, verbose=False, save=False)

    for r in results:
        print(f"  Detections on dummy image: {len(r.boxes)}")
        for box in r.boxes:
            cls_id = int(box.cls[0])
            name = model.names.get(cls_id, str(cls_id))
            conf = float(box.conf[0])
            print(f"    -> {name} ({conf:.2%})")

    print(f"  [OK] {crop_type} model verified.\n")


if __name__ == "__main__":
    print("AgroWatch - YOLOv8 Model Verification")
    for crop in ["tomato", "maize", "pineapple"]:
        test_crop(crop)
    print("\nAll done!")
