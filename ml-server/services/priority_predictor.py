"""
Priority Predictor Service
Predicts priority (High, Medium, Low) based on:
- Image analysis
- Category
- Keywords in notes
"""
import re
from typing import Optional
from PIL import Image
import io

class PriorityPredictor:
    def __init__(self):
        # High priority keywords
        self.high_priority_keywords = [
            'spark', 'sparking', 'electric', 'fire', 'smoke', 'burning',
            'leak', 'leaking', 'water', 'flood', 'hazard', 'hazardous',
            'danger', 'dangerous', 'broken', 'cracked', 'sharp', 'exposed',
            'urgent', 'emergency', 'critical'
        ]
        
        # Medium priority keywords
        self.medium_priority_keywords = [
            'damage', 'damaged', 'worn', 'loose', 'unstable', 'not working',
            'faulty', 'issue', 'problem'
        ]
        
        # Low priority keywords
        self.low_priority_keywords = [
            'minor', 'small', 'slight', 'cosmetic', 'scratch', 'stain'
        ]
    
    async def predict(
        self,
        image_bytes: bytes,
        category: Optional[str] = None,
        note: Optional[str] = None
    ) -> str:
        """
        Predict priority from image, category, and note
        Returns: 'High', 'Medium', or 'Low'
        """
        score = 0  # Priority score (higher = more urgent)
        
        # Analyze note/keywords
        if note:
            note_lower = note.lower()
            
            # Check for high priority keywords
            high_count = sum(1 for keyword in self.high_priority_keywords if keyword in note_lower)
            if high_count > 0:
                score += 3 * high_count
            
            # Check for medium priority keywords
            medium_count = sum(1 for keyword in self.medium_priority_keywords if keyword in note_lower)
            if medium_count > 0:
                score += 1 * medium_count
            
            # Check for low priority keywords
            low_count = sum(1 for keyword in self.low_priority_keywords if keyword in note_lower)
            if low_count > 0:
                score -= 2 * low_count
        
        # Category-based priority
        if category:
            category_priority = self._get_category_priority(category)
            score += category_priority
        
        # Image analysis (placeholder - can be enhanced)
        image_score = await self._analyze_image(image_bytes)
        score += image_score
        
        # Determine priority
        if score >= 5:
            return "High"
        elif score >= 2:
            return "Medium"
        else:
            return "Low"
    
    def _get_category_priority(self, category: str) -> int:
        """Get priority score based on category"""
        category_priorities = {
            'Socket': 3,  # Electrical issues are high priority
            'Pipe': 2,    # Water leaks are urgent
            'Projector': 1,  # Equipment issues
            'Chair': 0,   # Furniture
            'Bench': 0,   # Furniture
            'Other': 0
        }
        return category_priorities.get(category, 0)
    
    async def _analyze_image(self, image_bytes: bytes) -> int:
        """
        Analyze image for severity indicators
        Returns: priority score contribution
        """
        try:
            image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
            # OPTIMIZATION: Resize to small resolution for analysis
            # Processing 12MP images pixel-by-pixel in Python is too slow
            image = image.resize((160, 160))
            width, height = image.size
            
            # Analyze image characteristics
            # Get pixel data
            pixels = list(image.getdata())
            
            # Calculate brightness variance (high variance = more damage visible)
            brightness_values = [sum(pixel) / 3 for pixel in pixels]
            brightness_variance = sum((b - sum(brightness_values) / len(brightness_values))**2 for b in brightness_values) / len(brightness_values)
            
            # Calculate average brightness
            avg_brightness = sum(brightness_values) / len(brightness_values)
            
            # High contrast (high variance) might indicate visible damage
            if brightness_variance > 2000:
                return 2  # Higher priority for high-contrast images (damage visible)
            
            # Very dark or very bright images might indicate serious issues
            if avg_brightness < 50 or avg_brightness > 220:
                return 1
            
            # Check for edge-like patterns (simplified - would use edge detection in production)
            # For now, use variance as proxy
            
            import gc
            del pixels
            del brightness_values
            image.close()
            gc.collect()
            
            return 0
        except Exception as e:
            print(f"Error analyzing image: {e}")
            return 0

