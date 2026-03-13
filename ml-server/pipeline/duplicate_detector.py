"""
Duplicate Detector Service
Detects if a complaint image is similar to existing complaint images
Uses image similarity (Siamese networks or CLIP embeddings)
"""
from typing import List, Optional
from PIL import Image
import io
try:
    import numpy as np
    NUMPY_AVAILABLE = True
except ImportError:
    NUMPY_AVAILABLE = False

import hashlib
import requests

try:
    import torch
    import torch.nn as nn
    from torchvision import transforms
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False


class DuplicateDetector:
    def __init__(self):
        self.similarity_threshold = 0.85
        if TORCH_AVAILABLE:
            self.device = torch.device('cpu')
            self.transform = transforms.Compose([
                transforms.Resize((224, 224)),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
            ])
            self.load_model()
        else:
            self.device = None
            self.transform = None
            self.model = None

    def load_model(self):
        """Load MobileNetV2 for feature extraction (Stage 3)"""
        if not TORCH_AVAILABLE:
            return
        try:
            from torchvision.models import mobilenet_v2
            # Use pretrained mobilenet just as a feature extractor
            self.model = mobilenet_v2(pretrained=True)
            # Remove the classification head to just get embeddings
            self.model.classifier = torch.nn.Identity()
            self.model.eval()
            self.model.to(self.device)
            print("✅ Duplicate Detector (MobileNet Feature Extractor) initialized")
        except Exception as e:
            print(f"⚠️ Could not load MobileNet for duplicate detection: {e}")
            self.model = None

    async def detect(
        self,
        image_bytes: bytes,
        category: str,
        block: Optional[str] = None,
        classroom: Optional[str] = None,
        candidates: Optional[List[dict]] = None
    ) -> dict:
        """
        Detect if image is duplicate of existing complaints using 3-stage pipeline.
        existing_complaints should be a list of dicts:
        [
            {
               "id": "...", 
               "block": "...", 
               "classroom": "...", 
               "category": "...", 
               "created_at": <datetime or timestamp>,
               "image_bytes": <bytes> or "image_url": "..." # assuming we can fetch bytes for Stage 3
            }
        ]
        """
        if not candidates:
            return {
                "is_duplicate": False,
                "similarity_score": 0.0,
                "similar_complaint_id": None
            }
            
        try:
            # Stage 1: Metadata Filter & Stage 2: Candidate Selection
            # The backend DB already filtered candidates by location/date!
            # We iterate through the provided candidates directly.
            filtered_candidates = candidates
            
            if not filtered_candidates:
                return {
                    "is_duplicate": False,
                    "similarity_score": 0.0,
                    "similar_complaint_id": None
                }

            # Stage 3: Image Similarity
            if not self.model or not TORCH_AVAILABLE:
                return {
                    "is_duplicate": False,
                    "similarity_score": 0.0,
                    "similar_complaint_id": None,
                    "message": "Model not available for image similarity."
                }

            print(f"🔍 [DuplicateDetector] Fetching embedding for current image...")
            # Get target image embedding
            target_embedding = self._get_embedding(image_bytes)
            if target_embedding is None:
                print(f"⚠️ [DuplicateDetector] Failed to get embedding.")
                return {"is_duplicate": False, "similarity_score": 0.0, "similar_complaint_id": None}

            best_score = 0.0
            best_id = None

            print(f"🔍 [DuplicateDetector] Comparing against {len(filtered_candidates)} candidate(s) via Cosine Similarity...")
            for candidate in filtered_candidates:
                candidate_img_bytes = candidate.get("image_bytes")
                
                # Fetch dynamically if we only have URL
                if not candidate_img_bytes and candidate.get("image_url"):
                    try:
                        print(f"📥 [DuplicateDetector] Downloading candidate image: {candidate.get('complaint_id')}")
                        resp = requests.get(candidate["image_url"], timeout=5)
                        if resp.status_code == 200:
                            candidate_img_bytes = resp.content
                    except Exception as e:
                        print(f"⚠️ [DuplicateDetector] Failed to download candidate image: {e}")
                        continue
                        
                if not candidate_img_bytes:
                    continue
                
                candidate_embedding = self._get_embedding(candidate_img_bytes)
                if candidate_embedding is None:
                    continue
                
                # Compute Cosine Similarity
                sim = torch.nn.functional.cosine_similarity(target_embedding, candidate_embedding)
                score = sim.item()
                
                if score > best_score:
                    best_score = score
                    best_id = candidate.get("id") or candidate.get("complaint_id")

            is_dup = best_score > self.similarity_threshold

            if is_dup:
                print(f"✅ [DuplicateDetector] DUPLICATE FOUND. Score: {best_score:.4f} (ID: {best_id})")
            else:
                print(f"✅ [DuplicateDetector] No duplicates detected. (Highest match: {best_score:.4f})")

            return {
                "is_duplicate": is_dup,
                "similarity_score": best_score,
                "similar_complaint_id": best_id if is_dup else None
            }

        except Exception as e:
            print(f"Error in duplicate detection: {e}")
            return {
                "is_duplicate": False,
                "similarity_score": 0.0,
                "similar_complaint_id": None
            }

    def _get_embedding(self, image_bytes: bytes):
        try:
            image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
            tensor = self.transform(image).unsqueeze(0).to(self.device)
            with torch.no_grad():
                embedding = self.model(tensor)
            
            image.close()
            import gc
            gc.collect()
            return embedding
        except Exception as e:
            print(f"Failed to get embedding: {e}")
            return None

