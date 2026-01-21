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
        self.categories = ['Chair', 'Bench', 'Projector', 'Socket', 'Pipe', 'Other']
        self.model = None
        if TORCH_AVAILABLE:
            self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
            self.transform = transforms.Compose([
                transforms.Resize((224, 224)),
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

