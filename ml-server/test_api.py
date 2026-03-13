import requests
import os

BASE_URL = "http://127.0.0.1:8000"

# Note: We assume the ML Server is running on port 8000
# Run: python main.py
print("Testing /health ...")
try:
    health_resp = requests.get(f"{BASE_URL}/health")
    print(health_resp.json())
except Exception as e:
    print(f"Failed to reach server: {e}")
    exit(1)

# Test Predict All
print("\nTesting /predict/all ...")
# Create a dummy image for testing
import cv2
import numpy as np

dummy_img = np.zeros((224, 224, 3), dtype=np.uint8)
# Add some color to simulate something
cv2.rectangle(dummy_img, (50, 50), (150, 150), (255, 0, 0), -1) 
cv2.imwrite("dummy_test.jpg", dummy_img)

with open("dummy_test.jpg", "rb") as f:
    files = {"file": f}
    data = {
        "block": "Block A",
        "classroom": "101",
        "existing_complaints_json": "[]" # Empty list of existing
    }
    
    resp = requests.post(f"{BASE_URL}/predict/all", files=files, data=data)
    print(f"Status Code: {resp.status_code}")
    if resp.status_code == 200:
        import json
        print(json.dumps(resp.json(), indent=2))
    else:
        print(resp.text)

if os.path.exists("dummy_test.jpg"):
    os.remove("dummy_test.jpg")
