"""
Priority Logic Service
Determines priority level based on severity.
"""

class PriorityLogic:
    def __init__(self):
        pass

    async def determine_priority(self, severity_score: float) -> str:
        """
        severity > 0.7 -> High
        severity > 0.4 -> Medium
        else -> Low
        """
        # Since the severity detector returns a string ("Hazardous", "Severe", "Moderate", "Minor")
        # and also internally calculates a 0-10 score, we should map that score or just map the string.
        # But wait, read3.md stated: Predicts severity score (0-1), 0.0-0.3 -> minor, 0.3-0.6 -> moderate, 0.6-1.0 -> severe.
        # So we should probably update the severity detector to return the actual score (0-1) and string, then compute priority.
        # First let's put in the basic logic assuming a float 0.0 to 1.0.
        print(f"🔍 [PriorityLogic] Mapping severity score {severity_score:.2f} to priority level...")
        if severity_score > 0.7:
            priority = "High"
        elif severity_score > 0.4:
            priority = "Medium"
        else:
            priority = "Low"
            
        print(f"✅ [PriorityLogic] Assigned Priority: {priority}")
        return priority
