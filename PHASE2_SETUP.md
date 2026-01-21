# Phase 2 - ML Integration Setup Guide

## Overview
Phase 2 adds AI/ML capabilities to automatically classify damage, predict priority, detect duplicates, and generate descriptions.

## Setup Steps

### 1. Install Python Dependencies

```bash
cd ml-server
pip install -r requirements.txt
```

**Note**: If you don't have Python 3.8+, install it first from https://www.python.org/

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

This will install the new dependencies (axios, form-data) needed for ML integration.

### 3. Environment Variables

#### Backend `.env`
Add this line to your `backend/.env`:
```env
ML_API_URL=http://localhost:8000
```

#### ML Server `.env`
Create `ml-server/.env`:
```env
PORT=8000
MODEL_PATH=./models
LOG_LEVEL=INFO
```

### 4. Start All Services

You'll need **3 terminals** running:

**Terminal 1 - ML Server:**
```bash
cd ml-server
python main.py
```
Should see: `Uvicorn running on http://0.0.0.0:8000`

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
```
Should see: `🚀 Server running on port 5000`

**Terminal 3 - Frontend:**
```bash
cd frontend
npm start
```
Should open: `http://localhost:3000`

### 5. Test ML Integration

1. **Go to Dashboard** → Click "+ New Complaint"
2. **Upload an image**
3. **Click "🤖 Get AI Predictions"** button
4. You should see:
   - AI-predicted category
   - AI-predicted priority
   - AI-predicted severity
   - Auto-generated description
5. **Review and modify** if needed
6. **Fill in location** and **submit**

## Features Added

### 🤖 AI Predictions
- **Category Classification**: Automatically detects if damage is Chair, Bench, Projector, Socket, Pipe, or Other
- **Priority Prediction**: Analyzes image + notes to suggest High/Medium/Low priority
- **Severity Detection**: Assesses damage severity (Minor/Moderate/Severe/Hazardous)
- **Auto Description**: Generates description from image
- **Duplicate Detection**: Checks if similar complaint already exists

### 🎯 Smart Features
- Predictions are **auto-applied** but can be **manually overridden**
- Form fields update automatically when predictions are received
- User can still submit manually if ML service is unavailable

## How It Works

1. **User uploads image** → Frontend shows preview
2. **User clicks "Get AI Predictions"** → Frontend sends image to backend
3. **Backend forwards to ML API** → ML server analyzes image
4. **ML returns predictions** → Backend sends to frontend
5. **Frontend auto-fills form** → User can review/modify
6. **User submits** → Backend uses ML predictions (or user overrides) when creating complaint

## Troubleshooting

### ML Server Not Starting
- Check Python version: `python --version` (need 3.8+)
- Install dependencies: `pip install -r requirements.txt`
- Check port 8000 is available

### "ML Service Error" in Backend
- Make sure ML server is running on port 8000
- Check `ML_API_URL` in `backend/.env`
- Backend will use defaults if ML service unavailable (graceful degradation)

### Predictions Not Showing
- Check browser console for errors
- Verify ML server is running
- Check network tab for API calls

### Models Not Loading
- First run uses rule-based fallbacks
- Models will be trained/loaded in Phase 2.5
- Current implementation works with basic predictions

## Next Steps (Phase 2.5)

- Train custom category classification model
- Improve priority prediction with ML
- Enhance duplicate detection with image embeddings
- Add vision-language model for better descriptions

## Current Status

✅ ML Server structure
✅ Backend integration
✅ Frontend UI updates
✅ Basic predictions working
⏳ Model training (Phase 2.5)
⏳ Enhanced accuracy (Phase 2.5)

