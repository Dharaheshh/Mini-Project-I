"""
Severity Detector Service
Detects severity level from image using:
  1. Category-aware base severity rules
  2. OpenCV Canny edge detection for structural damage estimation

Levels:
- Minor: Small scratches, cosmetic issues
- Moderate: Noticeable damage, functional issues
- Severe: Significant damage, safety concerns
- Hazardous: Immediate danger, exposed hazards
"""
from PIL import Image
import io
import gc

try:
    import numpy as np
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False

# Ordered severity levels for bump-up / bump-down logic
SEVERITY_LEVELS = ["Minor", "Moderate", "Severe", "Hazardous"]
SEVERITY_SCORES = {"Minor": 0.15, "Moderate": 0.40, "Severe": 0.70, "Hazardous": 0.95}

# Category → base severity mapping
CATEGORY_BASE_SEVERITY = {
    "Socket":    "Hazardous",
    "Pipe":      "Severe",
    "Bench":     "Minor",
    "Chair":     "Minor",
    "Projector": "Moderate",
    "Other":     "Moderate",
}


class SeverityDetector:
    def __init__(self):
        if CV2_AVAILABLE:
            print("✅ SeverityDetector initialized (OpenCV edge detection + category rules)")
        else:
            print("⚠️  OpenCV not available — falling back to category-only severity")

    async def predict(self, image_bytes: bytes, category: str = "Other") -> tuple[str, float]:
        """
        Predict severity from image + category.
        Returns: Tuple of (severity_string, severity_score 0.0-1.0)
        """
        try:
            image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
            image = image.resize((160, 160))  # Keep memory low

            # Step 1: Get base severity from category
            base_severity = CATEGORY_BASE_SEVERITY.get(category, "Moderate")
            print(f"🔍 [SeverityDetector] Category '{category}' → Base severity: {base_severity}")

            # Step 2: Compute edge density
            edge_density = self._compute_edge_density(image)
            print(f"   → Edge density: {edge_density:.4f}")

            # Step 3: Adjust severity based on edge density
            severity_str = self._adjust_severity(base_severity, edge_density)
            severity_score = SEVERITY_SCORES[severity_str]

            image.close()
            gc.collect()

            print(f"✅ [SeverityDetector] Final output: {severity_str} (Score: {severity_score:.2f})")
            return severity_str, severity_score

        except Exception as e:
            print(f"Error in severity detection: {e}")
            return "Moderate", 0.40

    def _compute_edge_density(self, pil_image: Image.Image) -> float:
        """Use Canny edge detection to estimate structural damage."""
        if not CV2_AVAILABLE:
            return 0.10  # Neutral fallback

        try:
            # Convert PIL → numpy → grayscale
            img_array = np.array(pil_image)
            gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)

            # Apply Canny edge detection
            edges = cv2.Canny(gray, threshold1=50, threshold2=150)

            # Edge density = ratio of edge pixels to total pixels
            edge_density = float(np.count_nonzero(edges)) / float(edges.size)

            del img_array, gray, edges
            gc.collect()

            return edge_density

        except Exception as e:
            print(f"⚠️ Edge detection failed: {e}")
            return 0.10

    def _adjust_severity(self, base_severity: str, edge_density: float) -> str:
        """Shift severity up or down based on edge density."""
        idx = SEVERITY_LEVELS.index(base_severity)

        if edge_density > 0.25:
            # High edge density → bump up one level
            idx = min(idx + 1, len(SEVERITY_LEVELS) - 1)
            print(f"   → Edge density HIGH (>{0.25}) — bumping severity UP")
        elif edge_density < 0.05:
            # Low edge density → bump down one level
            idx = max(idx - 1, 0)
            print(f"   → Edge density LOW (<{0.05}) — bumping severity DOWN")
        else:
            print(f"   → Edge density NORMAL — keeping base severity")

        return SEVERITY_LEVELS[idx]
