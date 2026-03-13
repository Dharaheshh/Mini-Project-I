from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from pydantic import BaseModel
from typing import Optional, List
import json

from pipeline.inference_pipeline import InferencePipeline

router = APIRouter()

# Initialize pipeline once at startup
pipeline = InferencePipeline()

@router.get("/")
async def root():
    return {
        "message": "Damage Reporting ML API",
        "version": "1.0.0",
        "endpoints": [
            "/predict/category",
            "/predict/severity",
            "/detect/duplicate",
            "/generate/description",
            "/predict/all"
        ]
    }

@router.get("/health")
async def health():
    return {"status": "ok"}

@router.post("/predict/category")
async def predict_category(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        category = await pipeline.category_classifier.predict(contents)
        return {"category": category, "confidence": 0.85}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict/severity")
async def predict_severity(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        severity_str, score = await pipeline.severity_detector.predict(contents)
        return {"severity": severity_str, "score": score}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/detect/duplicate")
async def detect_duplicate(
    file: UploadFile = File(...),
    category: str = Form(...),
    block: Optional[str] = Form(None),
    classroom: Optional[str] = Form(None),
    candidates: Optional[str] = Form(None)
):
    try:
        contents = await file.read()
        candidates_list = []
        if candidates:
            candidates_list = json.loads(candidates)
            
        result = await pipeline.duplicate_detector.detect(
            image_bytes=contents,
            category=category,
            block=block,
            classroom=classroom,
            candidates=candidates_list
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate/description")
async def generate_description(
    file: UploadFile = File(...),
    category: Optional[str] = Form(None)
):
    try:
        contents = await file.read()
        description = await pipeline.description_generator.generate(contents, category)
        return {"description": description}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict/all")
async def predict_all(
    file: UploadFile = File(...),
    block: Optional[str] = Form(None),
    classroom: Optional[str] = Form(None),
    candidates: Optional[str] = Form(None)
):
    try:
        print("⚡ REQUEST RECEIVED: /predict/all ⚡")
        contents = await file.read()
        candidates_list = []
        if candidates:
            candidates_list = json.loads(candidates)
            
        result = await pipeline.run_pipeline(
            image_bytes=contents,
            block=block,
            classroom=classroom,
            existing_complaints=candidates_list
        )
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
