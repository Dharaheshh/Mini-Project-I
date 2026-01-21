"""
Severity Detector Service
Detects severity level from image:
- Minor: Small scratches, cosmetic issues
- Moderate: Noticeable damage, functional issues
- Severe: Significant damage, safety concerns
- Hazardous: Immediate danger, exposed hazards
"""
from PIL import Image
import io
try:
    import numpy as np
    NUMPY_AVAILABLE = True
except ImportError:
    NUMPY_AVAILABLE = False

class SeverityDetector:
    def __init__(self):
        pass
    
    async def predict(self, image_bytes: bytes) -> str:
        """
        Predict severity from image
        Returns: 'Minor', 'Moderate', 'Severe', or 'Hazardous'
        """
        try:
            image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
            
            # Analyze image characteristics
            severity_score = await self._analyze_severity(image)
            
            # Determine severity level
            if severity_score >= 8:
                return "Hazardous"
            elif severity_score >= 5:
                return "Severe"
            elif severity_score >= 2:
                return "Moderate"
            else:
                return "Minor"
                
        except Exception as e:
            print(f"Error in severity detection: {e}")
            return "Moderate"  # Default to moderate
    
    async def _analyze_severity(self, image: Image.Image) -> int:
        """
        Analyze image to determine severity score
        Returns: score from 0-10
        """
        score = 0
        
        try:
            width, height = image.size
            pixels = list(image.getdata())
            
            # Calculate brightness statistics
            brightness_values = [sum(pixel) / 3 for pixel in pixels]
            avg_brightness = sum(brightness_values) / len(brightness_values)
            
            # Calculate contrast (standard deviation of brightness)
            mean_brightness = avg_brightness
            variance = sum((b - mean_brightness)**2 for b in brightness_values) / len(brightness_values)
            contrast = variance ** 0.5
            
            # Very dark images (might be hazardous electrical issues)
            if avg_brightness < 40:
                score += 3
            elif avg_brightness < 60:
                score += 1
            
            # Very bright images (might be exposed/worn surfaces)
            if avg_brightness > 220:
                score += 2
            elif avg_brightness > 200:
                score += 1
            
            # High contrast indicates visible damage/edges
            if contrast > 60:
                score += 3  # Severe damage visible
            elif contrast > 40:
                score += 2  # Moderate damage
            elif contrast > 25:
                score += 1  # Minor damage
            
            # Analyze color distribution for unusual patterns
            # Count distinct colors (damaged items might have more color variation)
            unique_colors = len(set(pixels))
            total_pixels = len(pixels)
            color_diversity = unique_colors / total_pixels if total_pixels > 0 else 0
            
            # High color diversity might indicate multiple types of damage
            if color_diversity > 0.3:
                score += 1
            
            # Clamp score to 0-10
            score = min(10, max(0, score))
            
        except Exception as e:
            print(f"Error in severity analysis: {e}")
            score = 3  # Default moderate
        
        return score

