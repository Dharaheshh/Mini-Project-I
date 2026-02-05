"""
Category Classifier Service
Uses CNN (MobileNet/ResNet) to classify damage images into categories:
- Chair
- Bench
- Projector
- Socket
- Pipe
- Other
"""
try:
    import torch
    import torch.nn as nn
    from torchvision import models, transforms
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False

from PIL import Image
import io
try:
    import numpy as np
    NUMPY_AVAILABLE = True
except ImportError:
    NUMPY_AVAILABLE = False

class CategoryClassifier:
    def __init__(self):
        # CRITICAL: Must match ImageFolder alphabetical order from training
        self.categories = ['Bench', 'Chair', 'Other', 'Pipe', 'Projector', 'Socket']
        self.model = None
        if TORCH_AVAILABLE:
            self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
            self.transform = transforms.Compose([
                transforms.Resize(256),
                transforms.CenterCrop(224),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
            ])
        else:
            self.device = None
            self.transform = None
        self.load_model()
    
    def load_model(self):
        """Load pre-trained MobileNet model"""
        if not TORCH_AVAILABLE:
            print("⚠️  PyTorch not available. Using rule-based fallback.")
            self.model = None
            return
            
        try:
            # Use MobileNet for lightweight inference
            self.model = models.mobilenet_v2(pretrained=True)
            # Modify last layer for 6 categories
            self.model.classifier[1] = nn.Linear(self.model.last_channel, len(self.categories))
            self.model.eval()
            self.model.to(self.device)
            print("✅ Category classifier model loaded")
            
            # Load trained weights if available
            import os
            if os.path.exists("model.pth"):
                try:
                    state_dict = torch.load("model.pth", map_location=self.device)
                    # Handle state dict mismatch if classes changed (safe loading)
                    current_dict = self.model.state_dict()
                    # Filter out unnecessary keys
                    pretrained_dict = {k: v for k, v in state_dict.items() if k in current_dict and v.shape == current_dict[k].shape}
                    current_dict.update(pretrained_dict)
                    self.model.load_state_dict(current_dict)
                    print(f"🎉 Loaded CUSTOM TRAINED weights from model.pth")
                except Exception as e:
                    print(f"⚠️ Found model.pth but failed to load: {e}")
            else:
                print("ℹ️  Using default ImageNet weights (untrained head)")
                
        except Exception as e:
            print(f"⚠️  Could not load model: {e}. Using rule-based fallback.")
            self.model = None
    
    async def predict(self, image_bytes: bytes) -> str:
        """
        Predict category from image bytes
        Returns: category name
        """
        if self.model is None:
            # Rule-based fallback
            return self._rule_based_classification(image_bytes)
        
        try:
            # Preprocess image
            image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
            image_tensor = self.transform(image).unsqueeze(0).to(self.device)
            
            # Predict
            with torch.no_grad():
                outputs = self.model(image_tensor)
                probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
                
                # Debug: Print top 3 predictions
                top3_prob, top3_idx = torch.topk(probabilities, 3)
                print(f"🔍 Top 3 Predictions:")
                for i in range(3):
                    idx = top3_idx[i].item()
                    prob = top3_prob[i].item()
                    name = self.categories[idx]
                    print(f"   {i+1}. {name}: {prob:.4f}")

                predicted_idx = torch.argmax(probabilities).item()
                confidence = probabilities[predicted_idx].item()
            
            category = self.categories[predicted_idx]
            
            # If confidence is too low, return "Other"
            if confidence < 0.3:
                return "Other"
            
            return category
            
        except Exception as e:
            print(f"Error in category prediction: {e}")
            return "Other"
    
    def _rule_based_classification(self, image_bytes: bytes) -> str:
        """
        Simple rule-based classification as fallback
        Analyzes image to make basic predictions
        """
        try:
            from PIL import Image
            import io
            
            image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
            width, height = image.size
            
            # Analyze image characteristics
            # Get dominant colors
            colors = image.getcolors(maxcolors=256*256*256)
            if colors:
                # Sort by frequency
                colors.sort(key=lambda x: x[0], reverse=True)
                dominant_color = colors[0][1]  # (r, g, b)
                avg_brightness = sum(dominant_color) / 3
            else:
                avg_brightness = 128
            
            # Analyze aspect ratio
            aspect_ratio = width / height if height > 0 else 1
            
            # Simple heuristics based on image properties
            # These are basic rules - actual ML would be much better
            
            # Very dark images might be sockets/electrical
            if avg_brightness < 80:
                return "Socket"
            
            # Square-ish images might be furniture
            if 0.8 < aspect_ratio < 1.2:
                if avg_brightness > 150:
                    return "Chair"
                else:
                    return "Bench"
            
            # Wide images might be projectors or benches
            if aspect_ratio > 1.5:
                if avg_brightness > 120:
                    return "Projector"
                else:
                    return "Bench"
            
            # Tall images might be pipes
            if aspect_ratio < 0.7:
                return "Pipe"
            
            # Default based on brightness
            if avg_brightness < 100:
                return "Socket"
            elif avg_brightness > 180:
                return "Chair"
            else:
                return "Other"
                
        except Exception as e:
            print(f"Error in rule-based classification: {e}")
            return "Other"

