# Phase 2 - ML Integration Plan

## Overview
Integrate AI/ML capabilities into the damage reporting system to automate classification, priority assignment, and other smart features.

## Components

### 1. ML Server (FastAPI) ✅
- [x] FastAPI server setup
- [x] Service structure
- [ ] Model training scripts
- [ ] Model deployment

### 2. Category Classifier
- [x] Service structure
- [ ] Data collection/preparation
- [ ] Model training (MobileNet/ResNet)
- [ ] Model evaluation
- [ ] Integration with backend

### 3. Priority Predictor
- [x] Service structure
- [x] Rule-based implementation (Phase 2)
- [ ] ML model training (Phase 2.5)
- [ ] Integration with backend

### 4. Severity Detector
- [x] Service structure
- [ ] Model training
- [ ] Integration

### 5. Duplicate Detector
- [x] Service structure
- [ ] Image similarity model
- [ ] Integration

### 6. Auto Description Generator
- [x] Template-based (Phase 2)
- [ ] Vision-language model (Phase 2.5)
- [ ] Integration

### 7. Backend Integration
- [ ] Connect Express to ML API
- [ ] Update complaint creation to use ML
- [ ] Error handling

### 8. Frontend Updates
- [ ] Show ML predictions in form
- [ ] Auto-fill category/priority
- [ ] Show confidence scores
- [ ] Allow user to override

## Next Steps

1. **Test ML Server**: Start the FastAPI server and test endpoints
2. **Backend Integration**: Connect Express backend to ML API
3. **Frontend Updates**: Show ML predictions in UI
4. **Model Training**: Prepare data and train models (if needed)
5. **Testing**: Test all ML features end-to-end

## Implementation Order

1. ✅ ML Server structure
2. ⏳ Backend integration (Express → FastAPI)
3. ⏳ Frontend updates
4. ⏳ Model training (if using custom models)
5. ⏳ Testing and refinement

