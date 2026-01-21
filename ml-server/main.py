from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uvicorn
from dotenv import load_dotenv
import os

from services.category_classifier import CategoryClassifier
from services.priority_predictor import PriorityPredictor
from services.severity_detector import SeverityDetector
from services.duplicate_detector import DuplicateDetector
from services.description_generator import DescriptionGenerator

load_dotenv()

app = FastAPI(title="Damage Reporting ML API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ML services
category_classifier = CategoryClassifier()
priority_predictor = PriorityPredictor()
severity_detector = SeverityDetector()
duplicate_detector = DuplicateDetector()
description_generator = DescriptionGenerator()

class PredictionRequest(BaseModel):
    category: Optional[str] = None
    note: Optional[str] = None
    keywords: Optional[List[str]] = None

@app.get("/")
async def root():
    return {
        "message": "Damage Reporting ML API",
        "version": "1.0.0",
        "endpoints": [
            "/predict/category",
            "/predict/priority",
            "/predict/severity",
            "/detect/duplicate",
            "/generate/description",
            "/predict/all"
        ]
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/predict/category")
async def predict_category(file: UploadFile = File(...)):
    """
    Predict damage category from image
    Returns: category (Chair, Bench, Projector, Socket, Pipe, Other)
    """
    try:
        contents = await file.read()
        category = await category_classifier.predict(contents)
        return {"category": category, "confidence": 0.85}  # Placeholder
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/priority")
async def predict_priority(
    file: UploadFile = File(...),
    category: Optional[str] = None,
    note: Optional[str] = None
):
    """
    Predict priority level from image, category, and notes
    Returns: priority (High, Medium, Low)
    """
    try:
        contents = await file.read()
        priority = await priority_predictor.predict(contents, category, note)
        return {"priority": priority, "confidence": 0.80}  # Placeholder
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/severity")
async def predict_severity(file: UploadFile = File(...)):
    """
    Detect severity level from image
    Returns: severity (Minor, Moderate, Severe, Hazardous)
    """
    try:
        contents = await file.read()
        severity = await severity_detector.predict(contents)
        return {"severity": severity, "confidence": 0.75}  # Placeholder
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/detect/duplicate")
async def detect_duplicate(
    file: UploadFile = File(...),
    existing_images: Optional[List[str]] = None
):
    """
    Detect if complaint image is duplicate of existing complaints
    Returns: is_duplicate (bool), similarity_score (float), similar_complaint_id (optional)
    """
    try:
        contents = await file.read()
        result = await duplicate_detector.detect(contents, existing_images or [])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate/description")
async def generate_description(
    file: UploadFile = File(...),
    category: Optional[str] = None
):
    """
    Auto-generate description from image
    Returns: description (string)
    """
    try:
        contents = await file.read()
        description = await description_generator.generate(contents, category)
        return {"description": description}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/all")
async def predict_all(
    file: UploadFile = File(...),
    note: Optional[str] = None,
    existing_images: Optional[List[str]] = None
):
    """
    Get all ML predictions at once
    Returns: category, priority, severity, description, duplicate_info
    """
    try:
        contents = await file.read()
        
        # Run all predictions (can be parallelized)
        category = await category_classifier.predict(contents)
        priority = await priority_predictor.predict(contents, category, note)
        severity = await severity_detector.predict(contents)
        description = await description_generator.generate(contents, category)
        duplicate_info = await duplicate_detector.detect(contents, existing_images or [])
        
        return {
            "category": category,
            "priority": priority,
            "severity": severity,
            "description": description,
            "duplicate": duplicate_info
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

