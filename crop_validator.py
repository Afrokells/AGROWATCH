"""
AgroWatch Crop Image & Species Validator
Performs multi-stage pre-inference verification:
1. Rejects non-agricultural imagery (human faces, skin, animals, vehicles, indoor objects, blank images).
2. Performs Crop Species & Morphology Cross-Validation (prevents Tomato leaves on Maize plots, etc.).
Lightweight & Cloud-Safe: Operates via pure OpenCV + NumPy with optional PyTorch enhancement.
"""

import os
from pathlib import Path
from typing import Tuple, Dict, Any
import cv2
import numpy as np
from PIL import Image

# Global lazy-loaded semantic classifier
_CLASSIFIER = None
_TRANSFORM = None
_CATEGORIES = None


def _get_classifier():
    """Safely lazy-loads PyTorch semantic classifier if torch/torchvision are installed."""
    global _CLASSIFIER, _TRANSFORM, _CATEGORIES
    if _CLASSIFIER is None:
        try:
            import torch
            import torchvision.models as models
            weights = models.MobileNet_V3_Small_Weights.DEFAULT
            model = models.mobilenet_v3_small(weights=weights)
            model.eval()
            _CLASSIFIER = model
            _CATEGORIES = weights.meta["categories"]
            _TRANSFORM = weights.transforms()
        except Exception:
            # Running on lightweight cloud tier (e.g. Render) without heavy PyTorch
            _CLASSIFIER = False
    return _CLASSIFIER, _TRANSFORM, _CATEGORIES


CROP_SEMANTIC_KEYWORDS = {
    "maize": {"corn", "ear", "corncob", "hay", "maize", "grain", "cereal"},
    "tomato": {"tomato", "nightshade", "bell_pepper", "cucumber", "zucchini", "vegetable", "leaf"},
    "pineapple": {"pineapple", "ananas", "artichoke", "bromeliad"},
}


def analyze_leaf_morphology(img_bgr: np.ndarray) -> Dict[str, Any]:
    """
    Analyzes leaf venation and geometry via OpenCV Sobel operators:
    - Monocots (Maize): Strong parallel venation (sharp peak in dominant edge gradient angle).
    - Dicots (Tomato): Reticulate / branched venation (multi-directional gradient distribution).
    """
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    
    # Compute Sobel gradients
    gx = cv2.Sobel(gray, cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(gray, cv2.CV_32F, 0, 1, ksize=3)
    
    mag, ang = cv2.cartToPolar(gx, gy, angleInDegrees=True)
    
    # Filter for significant edge pixels
    thresh = np.percentile(mag, 75)
    sig_angles = ang[mag > thresh]
    
    if len(sig_angles) > 50:
        # Wrap angles to 0-180 (axis orientation)
        angles_180 = np.mod(sig_angles, 180)
        hist, _ = np.histogram(angles_180, bins=18, range=(0, 180))
        # Parallel venation has a dominant peak
        max_bin_ratio = float(np.max(hist) / (np.sum(hist) + 1e-6))
    else:
        max_bin_ratio = 0.0

    return {
        "venation_parallelism": round(max_bin_ratio, 3),
    }


def validate_crop_image(image_path: str, crop_type: str = "tomato") -> Tuple[bool, str, Dict[str, Any]]:
    """
    Validates that:
    1. The image is a legitimate plant/crop photo (not human face, car, wall, animal).
    2. The image matches the selected crop value chain (Tomato, Maize, Pineapple).

    Args:
        image_path: Path to the image file.
        crop_type: Expected crop ('tomato', 'maize', 'pineapple').

    Returns:
        (is_valid: bool, reason: str, metrics: dict)
    """
    crop_type = (crop_type or "tomato").lower().strip()
    crop_display = crop_type.capitalize()

    if not os.path.exists(image_path):
        return False, "Image file not found on server.", {}

    img = cv2.imread(str(image_path))
    if img is None:
        return False, "Could not decode uploaded image file. Please provide a standard JPG or PNG.", {}

    h, w, c = img.shape
    if h < 64 or w < 64:
        return False, "Image resolution is too low for agricultural diagnostic analysis.", {"height": h, "width": w}

    # Resize for fast, consistent statistical analysis
    target_dim = 320
    scale = target_dim / max(h, w)
    img_resized = cv2.resize(img, (int(w * scale), int(h * scale)))
    total_pixels = img_resized.shape[0] * img_resized.shape[1]

    # Convert color spaces
    hsv = cv2.cvtColor(img_resized, cv2.COLOR_BGR2HSV)
    ycrcb = cv2.cvtColor(img_resized, cv2.COLOR_BGR2YCrCb)
    rgb = cv2.cvtColor(img_resized, cv2.COLOR_BGR2RGB).astype(np.float32)

    # ── 1. Check for Human Skin / Face Dominance ──────────────────────────────
    skin_mask_ycrcb = (ycrcb[:, :, 1] >= 133) & (ycrcb[:, :, 1] <= 175) & \
                      (ycrcb[:, :, 2] >= 77) & (ycrcb[:, :, 2] <= 127)
    skin_mask_hsv = (hsv[:, :, 0] <= 25) & (hsv[:, :, 1] >= 20) & (hsv[:, :, 1] <= 200) & (hsv[:, :, 2] >= 40)
    combined_skin = skin_mask_ycrcb & skin_mask_hsv
    skin_ratio = np.sum(combined_skin) / total_pixels

    # ── 2. Vegetation & Botanical Color Analysis ──────────────────────────────
    green_mask = (hsv[:, :, 0] >= 28) & (hsv[:, :, 0] <= 90) & (hsv[:, :, 1] >= 30) & (hsv[:, :, 2] >= 25)
    green_ratio = np.sum(green_mask) / total_pixels

    r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    denominator = r + g + b + 1e-6
    norm_r, norm_g, norm_b = r / denominator, g / denominator, b / denominator
    exg = 2 * norm_g - norm_r - norm_b
    exg_positive_ratio = np.sum(exg > 0.04) / total_pixels

    amber_crop_mask = (hsv[:, :, 0] >= 12) & (hsv[:, :, 0] <= 32) & (hsv[:, :, 1] >= 40) & (hsv[:, :, 2] >= 35)
    amber_ratio = np.sum(amber_crop_mask) / total_pixels

    botanical_coverage = green_ratio + (amber_ratio * 0.6) + (exg_positive_ratio * 0.5)

    # ── 3. Texture & Foliar Edge Complexity ───────────────────────────────────
    gray = cv2.cvtColor(img_resized, cv2.COLOR_BGR2GRAY)
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()

    morphology = analyze_leaf_morphology(img_resized)

    metrics = {
        "skin_ratio": round(float(skin_ratio), 4),
        "green_ratio": round(float(green_ratio), 4),
        "exg_positive_ratio": round(float(exg_positive_ratio), 4),
        "amber_ratio": round(float(amber_ratio), 4),
        "botanical_coverage": round(float(botanical_coverage), 4),
        "texture_laplacian_var": round(float(laplacian_var), 2),
        "morphology": morphology,
    }

    # ── Stage 1: Domain Rejection Rules (Faces, Non-Crops, Blank Walls) ───────
    if skin_ratio > 0.30 and green_ratio < 0.08 and exg_positive_ratio < 0.08:
        return (
            False,
            "The uploaded image appears to contain a human face or skin rather than agricultural crops. "
            "Please upload clear aerial drone or field photos of your plants.",
            metrics,
        )

    if botanical_coverage < 0.06 and green_ratio < 0.04 and exg_positive_ratio < 0.04 and amber_ratio < 0.08:
        return (
            False,
            f"No recognizable crop foliage detected in this photo. Please ensure the image clearly shows {crop_display} plants.",
            metrics,
        )

    if laplacian_var < 10.0:
        return (
            False,
            "The image is too blurry, dark, or featureless for agricultural diagnostic analysis.",
            metrics,
        )

    # ── Stage 2: Crop Species Cross-Validation ────────────────────────────────
    classifier, transform, categories = _get_classifier()
    if classifier and transform:
        try:
            import torch
            pil_img = Image.open(image_path).convert("RGB")
            tensor = transform(pil_img).unsqueeze(0)
            with torch.no_grad():
                output = classifier(tensor)
                probs = torch.nn.functional.softmax(output[0], dim=0)

            top_probs, top_indices = torch.topk(probs, 5)
            predicted_labels = [categories[idx].lower().replace(" ", "_") for idx in top_indices]
            top_scores = [float(p) for p in top_probs]

            metrics["semantic_top_predictions"] = list(zip(predicted_labels[:3], top_scores[:3]))

            # Check if clearly detected as another specific crop value chain
            is_predicted_maize = any(any(k in lbl for k in CROP_SEMANTIC_KEYWORDS["maize"]) for lbl in predicted_labels[:3])
            is_predicted_pineapple = any(any(k in lbl for k in CROP_SEMANTIC_KEYWORDS["pineapple"]) for lbl in predicted_labels[:3])
            is_predicted_tomato = any(any(k in lbl for k in CROP_SEMANTIC_KEYWORDS["tomato"]) for lbl in predicted_labels[:3])

            venation = morphology["venation_parallelism"]

            # If user selected MAIZE, but image is Tomato / Pineapple
            if crop_type == "maize":
                if is_predicted_pineapple:
                    return (
                        False,
                        f"Crop Mismatch: The uploaded image appears to be a Pineapple plant, but you selected a Maize farm. "
                        f"Please upload Maize foliage or select your Pineapple farm plot.",
                        metrics,
                    )
                if is_predicted_tomato and not is_predicted_maize and venation < 0.18:
                    return (
                        False,
                        f"Crop Mismatch: The uploaded image appears to be a Tomato leaf, but you selected a Maize farm. "
                        f"Please upload Maize crops or select your Tomato farm plot.",
                        metrics,
                    )

            # If user selected TOMATO, but image is Maize / Pineapple
            elif crop_type == "tomato":
                if is_predicted_maize:
                    return (
                        False,
                        f"Crop Mismatch: The uploaded image appears to be a Maize (corn) plant, but you selected a Tomato farm. "
                        f"Please upload Tomato plants or select your Maize farm plot.",
                        metrics,
                    )
                if is_predicted_pineapple:
                    return (
                        False,
                        f"Crop Mismatch: The uploaded image appears to be a Pineapple plant, but you selected a Tomato farm. "
                        f"Please upload Tomato foliage or select your Pineapple farm plot.",
                        metrics,
                    )

            # If user selected PINEAPPLE, but image is Maize or Tomato
            elif crop_type == "pineapple":
                if is_predicted_maize:
                    return (
                        False,
                        f"Crop Mismatch: The uploaded image appears to be a Maize plant, but you selected a Pineapple farm. "
                        f"Please upload Pineapple plants or select your Maize farm plot.",
                        metrics,
                    )
                if is_predicted_tomato:
                    return (
                        False,
                        f"Crop Mismatch: The uploaded image appears to be a Tomato plant/leaf, but you selected a Pineapple farm. "
                        f"Please upload Pineapple plants or select your Pineapple farm plot.",
                        metrics,
                    )

        except Exception as exc:
            print(f"[CropValidator] Semantic check notice: {exc}")

    return True, f"Valid {crop_display} crop image.", metrics
