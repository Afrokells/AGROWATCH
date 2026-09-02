"""
AgroWatch Crop Image Validator
Performs pre-inference domain verification to reject out-of-distribution imagery
(e.g., human faces, indoor scenes, skin, furniture, vehicles) before running YOLO.
"""

import os
from pathlib import Path
from typing import Tuple, Dict, Any
import cv2
import numpy as np


def validate_crop_image(image_path: str, crop_type: str = "tomato") -> Tuple[bool, str, Dict[str, Any]]:
    """
    Validates whether the uploaded image contains legitimate plant / agricultural imagery.

    Args:
        image_path: Path to the image file.
        crop_type: Expected crop ('tomato', 'maize', 'pineapple').

    Returns:
        (is_valid: bool, reason: str, metrics: dict)
    """
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
    # Skin range in YCrCb: Cr in [133, 175], Cb in [77, 127]
    skin_mask_ycrcb = (ycrcb[:, :, 1] >= 133) & (ycrcb[:, :, 1] <= 175) & \
                      (ycrcb[:, :, 2] >= 77) & (ycrcb[:, :, 2] <= 127)
    
    # Secondary check in HSV for skin hue (0 - 25, saturation 20 - 200, value >= 40)
    skin_mask_hsv = (hsv[:, :, 0] <= 25) & (hsv[:, :, 1] >= 20) & (hsv[:, :, 1] <= 200) & (hsv[:, :, 2] >= 40)
    combined_skin = skin_mask_ycrcb & skin_mask_hsv
    skin_ratio = np.sum(combined_skin) / total_pixels

    # ── 2. Vegetation & Agricultural Color Analysis ───────────────────────────
    # Plant foliage hues in HSV: Green (28-90), Yellow/Gold/Ripening (12-32)
    green_mask = (hsv[:, :, 0] >= 28) & (hsv[:, :, 0] <= 90) & (hsv[:, :, 1] >= 30) & (hsv[:, :, 2] >= 25)
    green_ratio = np.sum(green_mask) / total_pixels

    # Excess Green Index (ExG = 2G - R - B)
    r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    denominator = r + g + b + 1e-6
    norm_r, norm_g, norm_b = r / denominator, g / denominator, b / denominator
    exg = 2 * norm_g - norm_r - norm_b
    exg_positive_ratio = np.sum(exg > 0.04) / total_pixels

    # Yellow/Amber/Ripening fruit/Soil range (e.g. ripe pineapple, maize tassels/husks/cobs)
    amber_crop_mask = (hsv[:, :, 0] >= 12) & (hsv[:, :, 0] <= 32) & (hsv[:, :, 1] >= 40) & (hsv[:, :, 2] >= 35)
    amber_ratio = np.sum(amber_crop_mask) / total_pixels

    # Combined botanical index
    botanical_coverage = green_ratio + (amber_ratio * 0.6) + (exg_positive_ratio * 0.5)

    # ── 3. Texture & Foliar Edge Complexity ───────────────────────────────────
    gray = cv2.cvtColor(img_resized, cv2.COLOR_BGR2GRAY)
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()

    metrics = {
        "skin_ratio": round(float(skin_ratio), 4),
        "green_ratio": round(float(green_ratio), 4),
        "exg_positive_ratio": round(float(exg_positive_ratio), 4),
        "amber_ratio": round(float(amber_ratio), 4),
        "botanical_coverage": round(float(botanical_coverage), 4),
        "texture_laplacian_var": round(float(laplacian_var), 2),
    }

    # ── Evaluation Rules ──────────────────────────────────────────────────────
    
    # Rule A: Clear Human Face / Skin Dominance with minimal botanical vegetation
    if skin_ratio > 0.30 and green_ratio < 0.08 and exg_positive_ratio < 0.08:
        return (
            False,
            "The uploaded image appears to contain a human face or skin rather than agricultural crops. "
            "Please upload clear aerial drone or field photos of your plants.",
            metrics
        )

    # Rule B: Extreme lack of any botanical, foliar, or agricultural crop coverage
    if botanical_coverage < 0.06 and green_ratio < 0.04 and exg_positive_ratio < 0.04 and amber_ratio < 0.08:
        return (
            False,
            "No recognizable crop, leaf, or agricultural foliage was detected in this photo. "
            "Please ensure the image clearly shows Tomato, Maize, or Pineapple plants.",
            metrics
        )

    # Rule C: Completely flat / featureless texture (e.g. solid white/blank wall)
    if laplacian_var < 10.0:
        return (
            False,
            "The image is too blurry, dark, or featureless for agricultural diagnostic analysis.",
            metrics
        )

    return True, "Valid agricultural image.", metrics

