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

try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False

import hashlib

class DuplicateDetector:
    def __init__(self):
        self.similarity_threshold = 0.85  # Threshold for considering images duplicate
        try:
            # Use CLIP for image embeddings (lightweight alternative)
            # For production, you might want to use a dedicated image similarity model
            self.model = None  # Will be initialized if needed
            print("✅ Duplicate detector initialized")
        except Exception as e:
            print(f"⚠️  Could not load similarity model: {e}")
            self.model = None
    
    async def detect(
        self,
        image_bytes: bytes,
        existing_image_urls: List[str]
    ) -> dict:
        """
        Detect if image is duplicate of existing complaints
        Returns: {
            is_duplicate: bool,
            similarity_score: float,
            similar_complaint_id: Optional[str]
        }
        """
        if not existing_image_urls:
            return {
                "is_duplicate": False,
                "similarity_score": 0.0,
                "similar_complaint_id": None
            }
        
        try:
            # Calculate image hash for quick duplicate detection
            image_hash = self._calculate_image_hash(image_bytes)
            
            # For now, use simple hash comparison
            # In production, you would:
            # 1. Fetch existing images from URLs
            # 2. Calculate embeddings for all images
            # 3. Compare embeddings using cosine similarity
            # 4. Return highest similarity score
            
            # Placeholder: Check if we can fetch and compare
            # For Phase 2, we'll implement basic hash-based detection
            # Full similarity detection can be added later
            
            return {
                "is_duplicate": False,
                "similarity_score": 0.0,
                "similar_complaint_id": None,
                "message": "Duplicate detection requires image URL fetching - to be implemented"
            }
            
        except Exception as e:
            print(f"Error in duplicate detection: {e}")
            return {
                "is_duplicate": False,
                "similarity_score": 0.0,
                "similar_complaint_id": None
            }
    
    def _calculate_image_hash(self, image_bytes: bytes) -> str:
        """Calculate hash of image for quick duplicate detection"""
        return hashlib.md5(image_bytes).hexdigest()
    
    def _calculate_similarity(self, img1_bytes: bytes, img2_bytes: bytes) -> float:
        """
        Calculate similarity between two images
        Returns: similarity score (0-1)
        """
        # Placeholder - would use image embeddings and cosine similarity
        return 0.0

