"""
AgroWatch ML Tracker — ONNX Runtime Edition
Runs YOLOv8 inference using onnxruntime (CPU) and assigns stable track IDs
via a lightweight IoU-based SORT tracker. No PyTorch required at runtime.
"""

import os
import cv2
import numpy as np
from pathlib import Path
from typing import List, Dict, Any

# ── Model paths ───────────────────────────────────────────────────────────────
WEIGHTS_DIR = Path(__file__).resolve().parent / "mlweights"

MODEL_PATHS = {
    "tomato":    WEIGHTS_DIR / "tomato.onnx",
    "maize":     WEIGHTS_DIR / "maize.onnx",
    "pineapple": WEIGHTS_DIR / "pineapple.onnx",
}

# Class names per crop — matches YOLOv8 / ONNX trained classes in exact order
CLASS_NAMES = {
    "tomato":    ["tomato_healthy", "tomato_late_blight", "tomato_leaf_curl", "tomato_septoria", "tomato_bacterial_spot"],
    "maize":     ["maize_healthy", "maize_northern_blight", "maize_common_rust", "maize_gray_leaf_spot"],
    "pineapple": ["pineapple_healthy", "pineapple_mealybug_wilt", "pineapple_heart_rot"],
}

def _get_class_names(crop_type: str, session: Any) -> List[str]:
    """Extract and normalize class names directly from ONNX model metadata if present."""
    try:
        meta = session.get_modelmeta().custom_metadata_map
        if "names" in meta:
            import ast
            raw_names = ast.literal_eval(meta["names"])
            sorted_keys = sorted(raw_names.keys())
            names = []
            for k in sorted_keys:
                raw_label = str(raw_names[k]).lower().strip().replace(" ", "_")
                # Normalize specific naming conventions
                if raw_label == "northern_leaf_blight":
                    norm_label = "northern_blight"
                elif raw_label == "leaf_curl_virus":
                    norm_label = "leaf_curl"
                elif raw_label == "septoria_leaf_spot":
                    norm_label = "septoria"
                elif raw_label in ("gray_leaf_spot", "grey_leaf_spot"):
                    norm_label = "gray_leaf_spot"
                else:
                    norm_label = raw_label

                if not norm_label.startswith(f"{crop_type}_"):
                    norm_label = f"{crop_type}_{norm_label}"
                names.append(norm_label)
            if names:
                return names
    except Exception:
        pass
    return CLASS_NAMES.get(crop_type, [])

# ── Session cache (loaded once per worker) ────────────────────────────────────
_session_cache: Dict[str, Any] = {}

INPUT_SIZE = 640  # YOLOv8 standard input
CONF_THRESHOLD = 0.25
IOU_THRESHOLD  = 0.45


# ── Image preprocessing ───────────────────────────────────────────────────────

def _letterbox(image: np.ndarray, target: int = INPUT_SIZE):
    """Resize with padding to keep aspect ratio, return image + scale info."""
    h, w = image.shape[:2]
    scale = target / max(h, w)
    new_w, new_h = int(round(w * scale)), int(round(h * scale))
    resized = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_LINEAR)

    pad_top  = (target - new_h) // 2
    pad_left = (target - new_w) // 2
    padded = np.full((target, target, 3), 114, dtype=np.uint8)
    padded[pad_top:pad_top + new_h, pad_left:pad_left + new_w] = resized

    return padded, scale, pad_left, pad_top


def _preprocess(img_path: str):
    """Load BGR image, letterbox, normalize to float32 CHW tensor."""
    image = cv2.imread(img_path)
    if image is None:
        raise FileNotFoundError(f"Cannot read image: {img_path}")
    padded, scale, pad_left, pad_top = _letterbox(image)
    tensor = padded[:, :, ::-1].astype(np.float32) / 255.0   # BGR→RGB, normalize
    tensor = np.ascontiguousarray(tensor.transpose(2, 0, 1))[np.newaxis]  # HWC→NCHW
    return tensor, scale, pad_left, pad_top, image.shape[:2]  # (h, w)


# ── Postprocessing: NMS ───────────────────────────────────────────────────────

def _postprocess(output: np.ndarray, num_classes: int,
                 scale: float, pad_left: int, pad_top: int,
                 orig_shape, conf_threshold: float = CONF_THRESHOLD):
    """
    Parse raw ONNX output (1, 4+num_classes, 8400) → list of dicts.
    Returns [{'x', 'y', 'w', 'h', 'confidence', 'class_id', 'class_name'}]
    with coordinates in original image pixel space.
    """
    preds = output[0]                         # (4+num_classes, 8400)
    boxes_cx = preds[0]                       # centre-x (640 space)
    boxes_cy = preds[1]                       # centre-y (640 space)
    boxes_w  = preds[2]
    boxes_h  = preds[3]
    class_scores = preds[4:]                  # (num_classes, 8400)

    class_ids   = class_scores.argmax(axis=0)
    confidences = class_scores.max(axis=0)

    mask = confidences >= conf_threshold
    if not mask.any():
        return []

    boxes_cx = boxes_cx[mask]
    boxes_cy = boxes_cy[mask]
    boxes_w  = boxes_w[mask]
    boxes_h  = boxes_h[mask]
    class_ids   = class_ids[mask]
    confidences = confidences[mask]

    # Convert cx,cy,w,h → x1,y1,x2,y2 in letterbox space
    x1 = boxes_cx - boxes_w / 2
    y1 = boxes_cy - boxes_h / 2
    x2 = boxes_cx + boxes_w / 2
    y2 = boxes_cy + boxes_h / 2

    # NMS per class
    cv_boxes  = np.stack([x1, y1, x2 - x1, y2 - y1], axis=1).tolist()
    cv_scores = confidences.tolist()

    indices = cv2.dnn.NMSBoxes(cv_boxes, cv_scores, conf_threshold, IOU_THRESHOLD)
    if len(indices) == 0:
        return []
    indices = indices.flatten()

    orig_h, orig_w = orig_shape
    detections = []
    for i in indices:
        # Map back from letterbox to original image coordinates
        bx = (float(x1[i]) - pad_left) / scale
        by = (float(y1[i]) - pad_top)  / scale
        bw = float(boxes_w[i]) / scale
        bh = float(boxes_h[i]) / scale

        # Clamp
        bx = max(0.0, min(bx, orig_w))
        by = max(0.0, min(by, orig_h))
        bw = max(0.0, min(bw, orig_w - bx))
        bh = max(0.0, min(bh, orig_h - by))

        detections.append({
            "x":          round(bx + bw / 2, 2),  # store as centre-x
            "y":          round(by + bh / 2, 2),
            "w":          round(bw, 2),
            "h":          round(bh, 2),
            "confidence": round(float(confidences[i]), 4),
            "class_id":   int(class_ids[i]),
        })
    return detections


# ── Lightweight IoU-based tracker ─────────────────────────────────────────────

def _iou(b1, b2):
    """IoU of two boxes given as (cx, cy, w, h)."""
    x1 = max(b1[0] - b1[2]/2, b2[0] - b2[2]/2)
    y1 = max(b1[1] - b1[3]/2, b2[1] - b2[3]/2)
    x2 = min(b1[0] + b1[2]/2, b2[0] + b2[2]/2)
    y2 = min(b1[1] + b1[3]/2, b2[1] + b2[3]/2)
    inter = max(0, x2 - x1) * max(0, y2 - y1)
    area1 = b1[2] * b1[3]
    area2 = b2[2] * b2[3]
    union = area1 + area2 - inter
    return inter / union if union > 0 else 0.0


class _SimpleTracker:
    """
    Assigns stable integer track IDs to detections across frames via IoU matching.
    Tracks that were not matched in a frame are kept for up to `max_age` frames.
    """
    IOU_MATCH = 0.3

    def __init__(self):
        self._next_id = 1
        self._tracks: Dict[int, dict] = {}  # id → {box, age, class_id}

    def update(self, detections: List[dict]) -> List[dict]:
        if not detections:
            # Age out stale tracks
            self._tracks = {k: v for k, v in self._tracks.items()
                            if v["age"] <= 1}
            return []

        det_boxes = [(d["x"], d["y"], d["w"], d["h"]) for d in detections]
        track_ids = list(self._tracks.keys())
        track_boxes = [(self._tracks[t]["box"]) for t in track_ids]

        matched_dets  = set()
        matched_tracks = set()
        assigned = {}  # det_idx → track_id

        # Greedy IoU matching
        if track_boxes:
            iou_matrix = np.array([[_iou(db, tb) for tb in track_boxes]
                                   for db in det_boxes])
            for _ in range(min(len(det_boxes), len(track_boxes))):
                idx = np.unravel_index(iou_matrix.argmax(), iou_matrix.shape)
                di, ti = int(idx[0]), int(idx[1])
                if iou_matrix[di, ti] < self.IOU_MATCH:
                    break
                if di not in matched_dets and ti not in matched_tracks:
                    assigned[di] = track_ids[ti]
                    matched_dets.add(di)
                    matched_tracks.add(ti)
                iou_matrix[di, :] = -1
                iou_matrix[:, ti] = -1

        # Update matched tracks; create new ones for unmatched dets
        result = []
        for di, det in enumerate(detections):
            box = det_boxes[di]
            if di in assigned:
                tid = assigned[di]
                self._tracks[tid]["box"] = box
                self._tracks[tid]["age"] = 0
            else:
                tid = self._next_id
                self._next_id += 1
                self._tracks[tid] = {"box": box, "age": 0, "class_id": det["class_id"]}
            result.append({**det, "track_id": tid})

        # Age out unmatched tracks
        for tid in list(self._tracks.keys()):
            if tid not in assigned.values() and tid not in [r["track_id"] for r in result]:
                self._tracks[tid]["age"] += 1
                if self._tracks[tid]["age"] > 3:
                    del self._tracks[tid]

        return result


# ── Public API ────────────────────────────────────────────────────────────────

def _load_session(crop_type: str):
    if crop_type not in _session_cache:
        try:
            import onnxruntime as ort
        except ImportError:
            raise RuntimeError("onnxruntime is not installed. Run: pip install onnxruntime")
        weight_path = MODEL_PATHS.get(crop_type)
        if not weight_path or not weight_path.exists():
            raise FileNotFoundError(f"ONNX weights not found: {weight_path}")
        sess_options = ort.SessionOptions()
        sess_options.intra_op_num_threads = 1   # keep CPU usage low
        _session_cache[crop_type] = ort.InferenceSession(
            str(weight_path),
            sess_options=sess_options,
            providers=["CPUExecutionProvider"],
        )
    return _session_cache[crop_type]


def run_tracking(image_paths: List[str], crop_type: str,
                 conf_threshold: float = CONF_THRESHOLD) -> Dict:
    """
    Run ONNX YOLOv8 detection + lightweight IoU tracking over a list of images.

    Args:
        image_paths:    Ordered list of image file paths.
        crop_type:      One of "tomato", "maize", "pineapple".
        conf_threshold: Minimum detection confidence.

    Returns:
        {
            "tracked_detections": [...],
            "unique_track_ids":   set[int],
            "total_plants":       int,
            "disease_flags":      int,
            "id_switches":        int,
            "mota_approx":        float,
        }
    """
    session     = _load_session(crop_type)
    names       = _get_class_names(crop_type, session)
    num_classes = len(names)
    input_name  = session.get_inputs()[0].name
    tracker     = _SimpleTracker()

    all_detections = []
    id_switches    = 0
    gt_count       = 0
    seen_track_ids: set = set()

    for frame_idx, img_path in enumerate(image_paths):
        tensor, scale, pad_left, pad_top, orig_shape = _preprocess(img_path)
        outputs = session.run(None, {input_name: tensor})
        raw_dets = _postprocess(
            outputs[0], num_classes, scale, pad_left, pad_top, orig_shape, conf_threshold
        )

        tracked = tracker.update(raw_dets)
        gt_count += len(tracked)

        for det in tracked:
            tid = det["track_id"]
            cls_name = names[det["class_id"]] if det["class_id"] < len(names) else str(det["class_id"])
            is_disease = "healthy" not in cls_name

            if tid in seen_track_ids:
                id_switches += 1
            seen_track_ids.add(tid)

            all_detections.append({
                "track_id":   tid,
                "frame_idx":  frame_idx,
                "x":          det["x"],
                "y":          det["y"],
                "w":          det["w"],
                "h":          det["h"],
                "confidence": det["confidence"],
                "class_name": cls_name,
                "is_disease": is_disease,
            })

    unique_ids    = {d["track_id"] for d in all_detections}
    disease_flags = sum(1 for d in all_detections if d["is_disease"])
    fn_approx     = max(0, gt_count - len(unique_ids))
    mota = round(1.0 - (fn_approx + id_switches) / max(gt_count, 1), 4)

    return {
        "tracked_detections": all_detections,
        "unique_track_ids":   unique_ids,
        "total_plants":       len(unique_ids),
        "disease_flags":      disease_flags,
        "id_switches":        id_switches,
        "mota_approx":        mota,
    }
