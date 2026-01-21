# ML Server - Damage Reporting System

FastAPI server providing ML/AI services for the damage reporting system.

## Features

- **Category Classification**: CNN-based classification of damage images
- **Priority Prediction**: ML-based priority assignment (High/Medium/Low)
- **Severity Detection**: Image analysis for severity assessment
- **Duplicate Detection**: Image similarity detection
- **Auto Description**: Generate descriptions from images

## Setup

### 1. Install Dependencies

```bash
cd ml-server
pip install -r requirements.txt
```

### 2. Environment Variables

Create `.env` file:
```env
PORT=8000
MODEL_PATH=./models
LOG_LEVEL=INFO
```

### 3. Run Server

```bash
python main.py
```

Or with uvicorn:
```bash
uvicorn main:app --reload --port 8000
```

## API Endpoints

- `GET /` - API information
- `GET /health` - Health check
- `POST /predict/category` - Predict damage category
- `POST /predict/priority` - Predict priority level
- `POST /predict/severity` - Detect severity
- `POST /detect/duplicate` - Detect duplicate complaints
- `POST /generate/description` - Generate auto description
- `POST /predict/all` - Get all predictions at once

## Integration with Backend

The Express backend will call these endpoints when processing complaints.

## Development Status

- [x] Basic FastAPI structure
- [x] Service stubs
- [ ] Model training
- [ ] Model deployment
- [ ] Full integration

