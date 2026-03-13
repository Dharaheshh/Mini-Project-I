"""
Inference Pipeline Service
Orchestrates the entire ML pipeline: Category -> Severity -> Priority -> Description -> Duplicate
Ensures all models are loaded exactly once and infer sequentially.
"""
from typing import Optional, List, Dict, Any

from models.category_classifier import CategoryClassifier
from models.severity_detector import SeverityDetector
from pipeline.priority_logic import PriorityLogic
from pipeline.description_generator import DescriptionGenerator
from pipeline.duplicate_detector import DuplicateDetector

class InferencePipeline:
    def __init__(self):
        print("🚀 Initializing Inference Pipeline...")
        self.category_classifier = CategoryClassifier()
        self.severity_detector = SeverityDetector()
        self.priority_logic = PriorityLogic()
        self.description_generator = DescriptionGenerator()
        self.duplicate_detector = DuplicateDetector()
        print("✅ Inference Pipeline Initialized")

    async def run_pipeline(
        self,
        image_bytes: bytes,
        block: Optional[str] = None,
        classroom: Optional[str] = None,
        existing_complaints: Optional[List[dict]] = None
    ) -> Dict[str, Any]:
        """
        Run the full sequential pipeline.
        Returns the unified JSON response.
        """
        try:
            # 1. Category Classifier
            print("1. Running Category Classifier...")
            category = await self.category_classifier.predict(image_bytes)
            
            # 2. Severity Detector
            print("2. Running Severity Detector...")
            severity_str, severity_score = await self.severity_detector.predict(image_bytes, category=category)

            # 3. Priority Logic
            print(f"3. Running Priority Logic (Severity Score: {severity_score:.2f})...")
            priority = await self.priority_logic.determine_priority(severity_score)

            # 4. Description Generator
            print("4. Running Description Generator...")
            description = await self.description_generator.generate(image_bytes, category)

            # 5. Duplicate Detection
            print("5. Running Duplicate Detector...")
            duplicate_info = await self.duplicate_detector.detect(
                image_bytes=image_bytes,
                category=category,
                block=block,
                classroom=classroom,
                candidates=existing_complaints or []
            )

            return {
                "category": category,
                "severity_score": severity_score,
                "severity_label": severity_str,
                "priority": priority,
                "description": description,
                "duplicate": duplicate_info["is_duplicate"],
                "duplicate_reference": duplicate_info["similar_complaint_id"]
            }

        except Exception as e:
            import traceback
            traceback.print_exc()
            raise Exception(f"Pipeline execution failed: {e}")
