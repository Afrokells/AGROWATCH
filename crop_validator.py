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

# ── Vocabulary (Exact ImageNet-1K classes per crop) ───────────────────────────
CROP_SEMANTIC_KEYWORDS: Dict[str, set] = {
    "maize": {
        "corn", "ear", "hay",
    },
    "tomato": {
        "bell_pepper", "cucumber", "zucchini", "hip",
        "acorn_squash", "butternut_squash", "spaghetti_squash",
    },
    "pineapple": {
        "pineapple", "artichoke", "cardoon",
    },
}


FARM_CONTEXT_ALLOWED: set = {
    # ── MAIZE (exact ImageNet-1K classes that MobileNetV2 predicts for maize) ──
    "corn",       # ImageNet 987
    "ear",        # ImageNet 998 — maize ear / corn cob
    "hay",        # ImageNet 958 — dried maize stalk texture

    # ── TOMATO (ImageNet classes predicted for tomato plants and fruit) ────────
    "bell_pepper",       # 945 — red/green coloration similar to tomato
    "cucumber",          # 943 — elongated green fruit on vine
    "zucchini",          # 939 — green leafy vegetable
    "hip",               # 989 — fruit hip/berry shape
    "acorn_squash",      # 941 — round fruiting body
    "butternut_squash",  # 942 — gourd-like fruit
    "spaghetti_squash",  # 940 — yellow fruiting body

    # ── PINEAPPLE (ImageNet classes predicted for pineapple plants) ───────────
    "pineapple",  # 953 — direct match
    "artichoke",  # 944 — thistle-like crown similar to pineapple
    "cardoon",    # 946 — spiky leaf rosette similar to pineapple crown

    # ── Disease markers visible ON the leaf surface of all three crops ─────────
    # MobileNetV2 sometimes sees fungal texture rather than the crop itself.
    "mushroom",       # 947 — mold/fungal mass on diseased tissue
    "agaric",         # 992 — fungal cap on rotting tissue
    "gyromitra",      # 993 — brain-like mold texture
    "coral_fungus",   # 991 — coral-shaped fungal growth on stems
    "hen-of-the-woods",  # 996 — leafy fungal cluster
    "bolete",         # 997 — fleshy fungal body
}

# ── Non-Target Plants & Crops (for informative rejection prompts) ─────────────
# When an image containing one of these is uploaded, the validator identifies
# the exact plant and informs the user that only Tomato, Maize, and Pineapple are supported.
KNOWN_PLANT_LABELS: Dict[str, str] = {
    # Vegetables & root crops
    "head_cabbage":          "Cabbage",
    "broccoli":              "Broccoli",
    "cauliflower":           "Cauliflower",
    "mashed_potato":         "Potato",
    # Fruits & tree crops
    "banana":                "Banana",
    "granny_smith":          "Apple",
    "strawberry":            "Strawberry",
    "orange":                "Orange / Citrus",
    "lemon":                 "Lemon / Citrus",
    "fig":                   "Fig",
    "jackfruit":             "Jackfruit",
    "custard_apple":         "Custard Apple",
    "pomegranate":           "Pomegranate",
    "acorn":                 "Oak Acorn",
    "buckeye":               "Chestnut / Buckeye",
    # Flowers & wild plants
    "rapeseed":              "Rapeseed / Canola",
    "daisy":                 "Daisy",
    "yellow_lady's_slipper": "Wild Orchid",
    "pot":                   "Potted Plant / Flowerpot",
    # Non-crop fungi
    "stinkhorn":             "Wild Stinkhorn Fungus",
    "earthstar":             "Wild Earthstar Fungus",
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
    Each prediction contributes to at most one bucket via exact class match.
    """
    scores: Dict[str, float] = {c: 0.0 for c in CROP_SEMANTIC_KEYWORDS}
    scores["other"] = 0.0

    for label, prob in top_preds:
        matched = False

        for crop, keywords in CROP_SEMANTIC_KEYWORDS.items():
            if label in keywords:
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

    # 1a. Skin-dominant rejection (people taking selfies / face photos)
    # Fires when skin is clearly present AND no significant crop foliage exists
    if skin_ratio > 0.30 and green_ratio < 0.08 and exg_positive_ratio < 0.08:
        return (
            False,
            "The uploaded image appears to contain a human face or skin rather than "
            "agricultural crops. Please upload clear field photos of your plants.",
            metrics,
        )
    # Also reject if skin is moderately high but NO crop green is found
    if skin_ratio > 0.15 and green_ratio < 0.02 and exg_positive_ratio < 0.02:
        return (
            False,
            "The uploaded image appears to show a person rather than crop plants. "
            "Please upload clear field photos of your plants.",
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

        # -- Non-agricultural image detection (whitelist-based) --
        # FARM_CONTEXT_ALLOWED contains ~20 labels for the 3 target crops + disease markers.
        # Anything outside that set with sufficient confidence → reject with a helpful message.

        top_label, top_prob = top_preds[0] if top_preds else ("", 0.0)

        # Tier 1: high-confidence non-allowed top prediction (≥ 35%)
        if top_prob >= 0.35 and top_label not in FARM_CONTEXT_ALLOWED:
            if top_label in KNOWN_PLANT_LABELS:
                plant_name = KNOWN_PLANT_LABELS[top_label]
                return (
                    False,
                    f"Unsupported Plant Detected: We identified '{plant_name}' in your photo. "
                    f"AgroWatch Ghana is calibrated specifically for Tomato, Maize, and Pineapple. "
                    f"Please switch to a supported plot or upload clear photos of your {crop_display} crop.",
                    metrics,
                )
            friendly = top_label.replace("_", " ").title()
            return (
                False,
                f"Non-agricultural image detected: The photo appears to show "
                f"'{friendly}' instead of crop plants. "
                f"Please upload clear field photos of your {crop_display} plants.",
                metrics,
            )

        # Tier 2: ≥ 3 of the top-5 predictions are non-allowed and no crop signal at all
        non_farm_in_top5 = sum(
            1 for lbl, prob in top_preds[:5]
            if prob >= 0.05 and lbl not in FARM_CONTEXT_ALLOWED
        )
        if non_farm_in_top5 >= 3 and total_supported < 0.05:
            if top_label in KNOWN_PLANT_LABELS:
                plant_name = KNOWN_PLANT_LABELS[top_label]
                return (
                    False,
                    f"Unsupported Plant Detected: We identified '{plant_name}' in your photo. "
                    f"AgroWatch Ghana is calibrated specifically for Tomato, Maize, and Pineapple. "
                    f"Please switch to a supported plot or upload clear photos of your {crop_display} crop.",
                    metrics,
                )
            friendly = top_label.replace("_", " ").title()
            return (
                False,
                f"Non-agricultural image: The photo appears to contain "
                f"'{friendly}' rather than a crop field. "
                f"Please upload photos of your {crop_display} crop.",
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

    else:
        # ── Stage 2b: Morphology-only fallback (ONNX unavailable) ───────────
        ok, reason = _morphology_species_check(crop_type, venation)
        if not ok:
            return False, reason, metrics

    return True, f"Valid {crop_display} crop image.", metrics

