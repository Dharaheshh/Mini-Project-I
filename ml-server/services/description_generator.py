"""
Auto Description Generator Service
Generates short issue summary from image and category
"""
from typing import Optional
from PIL import Image
import io

class DescriptionGenerator:
    def __init__(self):
        # Template descriptions based on category
        self.category_templates = {
            'Chair': [
                "Damaged chair requiring repair",
                "Chair with structural issues",
                "Broken chair leg or support",
                "Unstable or wobbly chair"
            ],
            'Bench': [
                "Bench damage reported",
                "Bench requiring maintenance",
                "Structural damage to bench",
                "Unstable bench surface"
            ],
            'Projector': [
                "Projector malfunction",
                "Projector not functioning properly",
                "Display or projection issue",
                "Equipment failure in projector"
            ],
            'Socket': [
                "Electrical socket issue",
                "Socket not working",
                "Electrical outlet problem",
                "Power socket malfunction"
            ],
            'Pipe': [
                "Pipe damage or leak",
                "Water pipe issue",
                "Plumbing problem",
                "Pipe requiring repair"
            ],
            'Other': [
                "Infrastructure damage reported",
                "Maintenance required",
                "Damage to facility",
                "Repair needed"
            ]
        }
    
    async def generate(
        self,
        image_bytes: bytes,
        category: Optional[str] = None
    ) -> str:
        """
        Generate description from image and category
        Returns: auto-generated description string
        """
        try:
            # For Phase 2, use template-based generation
            # In Phase 3, this could use vision-language models (GPT-4V, etc.)
            
            if category and category in self.category_templates:
                # Return first template for the category
                # In production, could analyze image to select best template
                return self.category_templates[category][0]
            else:
                return "Infrastructure damage requiring attention"
                
        except Exception as e:
            print(f"Error generating description: {e}")
            return "Damage reported - requires inspection"

