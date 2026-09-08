"""
AgroWatch Crop Image & Species Validator  (v2 — Production-Fixed)
================================================================
Multi-stage pre-inference verification before YOLOv8/ONNX execution.

Fixes over v1
-------------
1. ONNX Runtime semantic classifier  — replaces PyTorch dependency so the full
   species check runs on Render (onnxruntime is already in requirements.txt).
2. Confidence-score accumulation     — sums ImageNet probability mass per crop
   category instead of the broken any()-in-top-3 logic that rejected real Maize
   as Pineapple whenever 'pineapple' appeared at < 11 % confidence.
3. Sobel venation morphology fallback — enforces monocot / dicot distinction
   using only OpenCV when no semantic model is available at all.

Stages
------
  Stage 0  — File sanity (exists, decodable, >= 64x64)
  Stage 1  — Domain rejection (skin, blank / blurry / featureless images)
  Stage 2a — Semantic species check via MobileNetV3-Small ONNX (cloud-safe)
  Stage 2b — Morphology-only fallback when Stage 2a model is unavailable
"""

import os
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import cv2
import numpy as np
from PIL import Image

# ── Paths ─────────────────────────────────────────────────────────────────────
WEIGHTS_DIR = Path(__file__).resolve().parent / "mlweights"
MOBILENET_ONNX_PATH = WEIGHTS_DIR / "mobilenet_v3_small.onnx"
IMAGENET_LABELS_PATH = WEIGHTS_DIR / "imagenet_labels.txt"

# ── Globals (lazy-loaded once) ────────────────────────────────────────────────
_ORT_SESSION = None
_ORT_LABELS: Optional[List[str]] = None
_ORT_READY: Optional[bool] = None   # None = not attempted yet

# ── Vocabulary ────────────────────────────────────────────────────────────────
CROP_SEMANTIC_KEYWORDS: Dict[str, set] = {
    "maize":     {"corn", "ear", "corncob", "hay", "maize", "grain", "cereal", "sorghum"},
    "tomato":    {"tomato", "nightshade", "bell_pepper", "cucumber", "zucchini", "vegetable"},
    "pineapple": {"pineapple", "ananas", "artichoke", "bromeliad"},
}

UNSUPPORTED_SPECIES_KEYWORDS = {
    # Non-target crops & fruits
    "banana", "plantain", "cassava", "yam", "cocoa", "cacao", "coffee",
    "cabbage", "head_cabbage", "broccoli", "cauliflower", "potato", "sweet_potato",
    "apple", "orange", "lemon", "citrus", "lime", "grape", "strawberry", "fig",
    "pomegranate", "mushroom", "fungus", "agaric", "bolete", "earthstar",
    # Ornamental / non-crop plants
    "rose", "daisy", "tulip", "sunflower", "orchid", "dahlia", "marigold",
    "flowerpot", "pot", "houseplant", "fern", "cactus",
    # Woody / non-agricultural vegetation
    "palm", "palm_tree", "tree", "forest", "wood", "log", "oak", "pine", "bamboo",
    # Non-agricultural / indoor objects & animals
    "dog", "cat", "bird", "insect", "spider", "beetle", "person",
    "chair", "table", "couch", "bed", "vehicle", "car", "building", "wall",
    # UI / digital content (catches app screenshots)
    "web_site", "screen", "monitor", "television", "laptop", "phone",
}


# ─────────────────────────────────────────────────────────────────────────────
# ONNX Runtime classifier — no PyTorch needed at runtime
# ─────────────────────────────────────────────────────────────────────────────

def _load_ort_classifier() -> bool:
    """
    Lazy-loads MobileNetV3-Small ONNX model via onnxruntime.
    Returns True if model + labels are ready, False otherwise.
    """
    global _ORT_SESSION, _ORT_LABELS, _ORT_READY
    if _ORT_READY is not None:
        return _ORT_READY
    try:
        import onnxruntime as ort  # already in requirements.txt

        if not MOBILENET_ONNX_PATH.exists():
            print(
                f"[CropValidator] mobilenet_v3_small.onnx not found at {MOBILENET_ONNX_PATH}. "
                "Run: python scratch/export_mobilenet_onnx.py  to generate it."
            )
            _ORT_READY = False
            return False

        _ORT_SESSION = ort.InferenceSession(
            str(MOBILENET_ONNX_PATH),
            providers=["CPUExecutionProvider"],
        )

        if not IMAGENET_LABELS_PATH.exists():
            print("[CropValidator] imagenet_labels.txt missing — semantic stage disabled.")
            _ORT_READY = False
            return False

        _ORT_LABELS = IMAGENET_LABELS_PATH.read_text(encoding="utf-8").strip().splitlines()
        _ORT_READY = True
        return True

    except Exception as exc:
        print(f"[CropValidator] ORT load notice: {exc}")
        _ORT_READY = False
        return False


def _preprocess_for_mobilenet(pil_img: Image.Image) -> "np.ndarray":
    """
    Standard ImageNet pre-processing for MobileNetV3 — pure NumPy, no torchvision.
    resize -> 224x224 -> /255 -> normalize(mean, std) -> CHW -> add batch dim
    """
    img = pil_img.resize((224, 224), Image.BILINEAR).convert("RGB")
    arr = np.array(img, dtype=np.float32) / 255.0
    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std  = np.array([0.229, 0.224, 0.225], dtype=np.float32)
    arr  = (arr - mean) / std
    arr  = arr.transpose(2, 0, 1)   # HWC -> CHW
    return arr[np.newaxis, ...]      # (1, 3, 224, 224)


def _classify_image_ort(image_path: str) -> Optional[List[Tuple[str, float]]]:
    """
    Run MobileNetV3-Small ONNX inference. Returns top-10 (label, prob) pairs
    or None if model unavailable.
    """
    if not _load_ort_classifier():
        return None
    try:
        pil_img = Image.open(image_path).convert("RGB")
        tensor  = _preprocess_for_mobilenet(pil_img)
        input_name = _ORT_SESSION.get_inputs()[0].name
        raw = _ORT_SESSION.run(None, {input_name: tensor})[0][0]

        # Numerically stable softmax
        shifted = raw - np.max(raw)
        e = np.exp(shifted)
        probs = e / e.sum()

        top_idx = np.argsort(probs)[::-1][:10]
        return [
            (_ORT_LABELS[i].lower().replace(" ", "_"), float(probs[i]))
            for i in top_idx
        ]
    except Exception as exc:
        print(f"[CropValidator] ORT inference notice: {exc}")
        return None


# ─────────────────────────────────────────────────────────────────────────────
# Probability-mass crop scoring  (replaces broken any()-in-top-3 logic)
# ─────────────────────────────────────────────────────────────────────────────

def _score_crops(top_preds: List[Tuple[str, float]]) -> Dict[str, float]:
    """
    Accumulates probability mass for each supported crop category.
    Each prediction contributes to at most one bucket.
    """
    scores: Dict[str, float] = {c: 0.0 for c in CROP_SEMANTIC_KEYWORDS}
    scores["other"] = 0.0
    for label, prob in top_preds:
        matched = False
        for crop, keywords in CROP_SEMANTIC_KEYWORDS.items():
            if any(k in label for k in keywords):
                scores[crop] += prob
                matched = True
                break
        if not matched:
            scores["other"] += prob
    return scores


def _dominant_crop(scores: Dict[str, float]) -> Tuple[str, float]:
    """Returns (name, score) of the supported crop with highest accumulated probability."""
    supported = {c: scores[c] for c in CROP_SEMANTIC_KEYWORDS}
    best = max(supported, key=lambda c: supported[c])
    return best, supported[best]


# ─────────────────────────────────────────────────────────────────────────────
# Leaf venation morphology
# ─────────────────────────────────────────────────────────────────────────────

def analyze_leaf_morphology(img_bgr: "np.ndarray") -> Dict[str, Any]:
    """
    Estimates venation pattern via Sobel gradient angle histogram:
      Monocots (Maize, Pineapple): dominant peak -> high parallelism ratio
      Dicots   (Tomato):           dispersed bins -> low parallelism ratio
    """
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    gx = cv2.Sobel(gray, cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(gray, cv2.CV_32F, 0, 1, ksize=3)
    mag, ang = cv2.cartToPolar(gx, gy, angleInDegrees=True)
    thresh = np.percentile(mag, 75)
    sig_angles = ang[mag > thresh]
    if len(sig_angles) > 50:
        angles_180 = np.mod(sig_angles, 180)
        hist, _ = np.histogram(angles_180, bins=18, range=(0, 180))
        max_bin_ratio = float(np.max(hist) / (np.sum(hist) + 1e-6))
    else:
        max_bin_ratio = 0.0
    return {"venation_parallelism": round(max_bin_ratio, 3)}


def _morphology_species_check(crop_type: str, venation: float) -> Tuple[bool, str]:
    """
    OpenCV-only fallback species check (conservative — only catches extreme conflicts).

    Thresholds:
      Maize     (monocot): reject if venation < 0.09  (clearly dicot / reticulate)
      Tomato    (dicot):   reject if venation > 0.25  (clearly monocot / parallel)
      Pineapple (monocot): reject if venation < 0.07  (extremely non-plant or broad dicot)
    """
    if crop_type == "maize" and venation < 0.09:
        return (
            False,
            "Crop Mismatch: The leaf structure shows reticulate (branched) venation "
            "inconsistent with Maize. Please upload clear Maize foliage photos.",
        )
    if crop_type == "tomato" and venation > 0.25:
        return (
            False,
            "Crop Mismatch: The leaf structure shows strongly parallel venation "
            "inconsistent with a Tomato plant. Please upload Tomato foliage.",
        )
    if crop_type == "pineapple" and venation < 0.07:
        return (
            False,
            "Crop Mismatch: The uploaded image does not appear to contain Pineapple plants. "
            "Please upload clear Pineapple field or rosette photos.",
        )
    return True, ""


# ─────────────────────────────────────────────────────────────────────────────
# Main entry point
# ─────────────────────────────────────────────────────────────────────────────

def validate_crop_image(
    image_path: str, crop_type: str = "tomato"
) -> Tuple[bool, str, Dict[str, Any]]:
    """
    Validates that the uploaded image is:
      1. A decodable, sufficiently large image file.
      2. Agricultural plant foliage (rejects skin, blank walls, blurry shots).
      3. Consistent with the selected crop value chain.
      4. Not an unsupported / out-of-scope species.

    Args:
        image_path: Path to the uploaded image on disk.
        crop_type:  Expected crop ('tomato', 'maize', 'pineapple').

    Returns:
        (is_valid: bool, reason: str, metrics: dict)
    """
    crop_type    = (crop_type or "tomato").lower().strip()
    crop_display = crop_type.capitalize()

    # ── Stage 0: File sanity ─────────────────────────────────────────────────
    if not os.path.exists(image_path):
        return False, "Image file not found on server.", {}

    img = cv2.imread(str(image_path))
    if img is None:
        return (
            False,
            "Could not decode uploaded image file. Please provide a standard JPG or PNG.",
            {},
        )

    h, w, _ = img.shape
    if h < 64 or w < 64:
        return (
            False,
            "Image resolution is too low for agricultural diagnostic analysis.",
            {"height": h, "width": w},
        )

    # Resize to fixed 320px long-side for fast consistent analysis
    scale = 320 / max(h, w)
    img_r = cv2.resize(img, (int(w * scale), int(h * scale)))
    total_px = img_r.shape[0] * img_r.shape[1]

    # ── Stage 1: Domain Rejection ────────────────────────────────────────────
    hsv   = cv2.cvtColor(img_r, cv2.COLOR_BGR2HSV)
    ycrcb = cv2.cvtColor(img_r, cv2.COLOR_BGR2YCrCb)
    rgb   = cv2.cvtColor(img_r, cv2.COLOR_BGR2RGB).astype(np.float32)

    # 1a. Skin detection (dual YCrCb + HSV filter)
    skin_ycrcb = (
        (ycrcb[:, :, 1] >= 133) & (ycrcb[:, :, 1] <= 175) &
        (ycrcb[:, :, 2] >= 77)  & (ycrcb[:, :, 2] <= 127)
    )
    skin_hsv = (
        (hsv[:, :, 0] <= 25) &
        (hsv[:, :, 1] >= 20) & (hsv[:, :, 1] <= 200) &
        (hsv[:, :, 2] >= 40)
    )
    skin_ratio = float(np.sum(skin_ycrcb & skin_hsv) / total_px)

    # 1b. Vegetation coverage
    green_mask = (
        (hsv[:, :, 0] >= 28) & (hsv[:, :, 0] <= 90) &
        (hsv[:, :, 1] >= 30) & (hsv[:, :, 2] >= 25)
    )
    green_ratio = float(np.sum(green_mask) / total_px)

    r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    denom = r + g + b + 1e-6
    exg   = 2 * (g / denom) - (r / denom) - (b / denom)
    exg_positive_ratio = float(np.sum(exg > 0.04) / total_px)

    amber_mask = (
        (hsv[:, :, 0] >= 12) & (hsv[:, :, 0] <= 32) &
        (hsv[:, :, 1] >= 40) & (hsv[:, :, 2] >= 35)
    )
    amber_ratio = float(np.sum(amber_mask) / total_px)
    botanical_coverage = green_ratio + (amber_ratio * 0.6) + (exg_positive_ratio * 0.5)

    # 1c. Blur / texture
    gray = cv2.cvtColor(img_r, cv2.COLOR_BGR2GRAY)
    laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())

    morphology = analyze_leaf_morphology(img_r)
    venation   = morphology["venation_parallelism"]

    metrics: Dict[str, Any] = {
        "skin_ratio":            round(skin_ratio, 4),
        "green_ratio":           round(green_ratio, 4),
        "exg_positive_ratio":    round(exg_positive_ratio, 4),
        "amber_ratio":           round(amber_ratio, 4),
        "botanical_coverage":    round(botanical_coverage, 4),
        "texture_laplacian_var": round(laplacian_var, 2),
        "morphology":            morphology,
    }

    if skin_ratio > 0.30 and green_ratio < 0.08 and exg_positive_ratio < 0.08:
        return (
            False,
            "The uploaded image appears to contain a human face or skin rather than "
            "agricultural crops. Please upload clear field photos of your plants.",
            metrics,
        )

    if (
        botanical_coverage < 0.06 and
        green_ratio        < 0.04 and
        exg_positive_ratio < 0.04 and
        amber_ratio        < 0.08
    ):
        return (
            False,
            f"No recognizable crop foliage detected in this photo. "
            f"Please ensure the image clearly shows {crop_display} plants.",
            metrics,
        )

    if laplacian_var < 10.0:
        return (
            False,
            "The image is too blurry, dark, or featureless for agricultural diagnostic analysis.",
            metrics,
        )

    # ── Stage 2a: Semantic Species Validation (ONNX — cloud-safe) ───────────
    top_preds = _classify_image_ort(image_path)

    if top_preds is not None:
        metrics["semantic_top_predictions"] = top_preds[:3]

        scores = _score_crops(top_preds)
        metrics["crop_scores"] = {k: round(scores[k], 4) for k in CROP_SEMANTIC_KEYWORDS}

        dominant, dominant_score = _dominant_crop(scores)
        selected_score           = scores.get(crop_type, 0.0)
        total_supported          = sum(scores[c] for c in CROP_SEMANTIC_KEYWORDS)

        # -- Unsupported species check --
        # Only reject when a blacklisted label appears with >= 5 % confidence
        # AND no supported crop accumulates >= 10 % probability.
        unsupported_found = None
        for label, prob in top_preds[:5]:
            if prob < 0.05:
                break
            for kw in UNSUPPORTED_SPECIES_KEYWORDS:
                if kw in label and not any(
                    k in label
                    for c_kws in CROP_SEMANTIC_KEYWORDS.values()
                    for k in c_kws
                ):
                    unsupported_found = label.replace("_", " ").title()
                    break
            if unsupported_found:
                break

        if unsupported_found and total_supported < 0.10:
            return (
                False,
                f"Unsupported Crop Species: The image appears to contain '{unsupported_found}', "
                f"which AgroWatch does not support. AgroWatch is calibrated specifically for "
                f"Tomato, Maize, and Pineapple. Please upload photos of your {crop_display} crop.",
                metrics,
            )

        # -- Cross-crop mismatch check --
        # Trigger ONLY when a DIFFERENT crop is clearly dominant:
        #   (a) dominant_score >= 0.20  (meaningful confidence)
        #   (b) dominant_score >= 2x selected crop's score  (not borderline)
        MISMATCH_ABS   = 0.20
        MISMATCH_RATIO = 2.0

        if (
            dominant != crop_type and
            dominant_score >= MISMATCH_ABS and
            (selected_score == 0.0 or
             dominant_score / (selected_score + 1e-6) >= MISMATCH_RATIO)
        ):
            return (
                False,
                f"Crop Mismatch: The uploaded image appears to contain a "
                f"{dominant.capitalize()} plant "
                f"(confidence {dominant_score * 100:.0f}%), but you selected a {crop_display} farm. "
                f"Please upload {crop_display} foliage or select the correct farm plot.",
                metrics,
            )

        # -- Supplemental morphology check when semantic model is uncertain --
        # When total supported-crop probability < 15 %, MobileNet can't clearly
        # identify any of the three crops.  Apply venation morphology as a
        # secondary signal to catch obvious monocot/dicot mismatches.
        if total_supported < 0.15:
            ok, reason = _morphology_species_check(crop_type, venation)
            if not ok:
                return False, reason, metrics

    else:
        # ── Stage 2b: Morphology-only fallback (ONNX unavailable) ───────────
        ok, reason = _morphology_species_check(crop_type, venation)
        if not ok:
            return False, reason, metrics

    return True, f"Valid {crop_display} crop image.", metrics

