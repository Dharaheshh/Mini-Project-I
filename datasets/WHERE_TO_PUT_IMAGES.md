# Where to Put Your Dataset Images

## 📍 Location

All dataset images should go in the **`datasets/`** folder at the root of the project.

## 📂 Folder Structure

### Category Classification
Put images here to train category classification:
- `datasets/category_classification/Chair/` - Chair damage images
- `datasets/category_classification/Bench/` - Bench damage images
- `datasets/category_classification/Projector/` - Projector damage images
- `datasets/category_classification/Socket/` - Socket damage images
- `datasets/category_classification/Pipe/` - Pipe damage images
- `datasets/category_classification/Other/` - Other damage images

### Priority Prediction
Put images here to train priority prediction:
- `datasets/priority_prediction/High/` - High priority images
- `datasets/priority_prediction/Medium/` - Medium priority images
- `datasets/priority_prediction/Low/` - Low priority images

### Severity Detection
Put images here to train severity detection:
- `datasets/severity_detection/Minor/` - Minor damage images
- `datasets/severity_detection/Moderate/` - Moderate damage images
- `datasets/severity_detection/Severe/` - Severe damage images
- `datasets/severity_detection/Hazardous/` - Hazardous damage images

### Raw/Unprocessed
Dump all images here first, then organize:
- `datasets/raw/` - Temporary storage before organizing

## 🎯 Quick Example

1. You have a photo of a broken chair → Put it in `datasets/category_classification/Chair/`
2. You have a photo of a sparking socket → Put it in `datasets/category_classification/Socket/` AND `datasets/priority_prediction/High/`
3. You have a photo of a minor scratch → Put it in `datasets/severity_detection/Minor/`

## 📝 File Naming

Use descriptive names:
- `chair_broken_leg_001.jpg`
- `socket_sparking_002.jpg`
- `pipe_leaking_water_001.jpg`

## ✅ Checklist

- [ ] Images are in the correct category folder
- [ ] Images are named descriptively
- [ ] Images are clear and show the damage
- [ ] You have at least 50 images per category (for category classification)

## 📚 More Information

- See `README.md` for full documentation
- See `DATA_COLLECTION_GUIDE.md` for collection tips
- See `QUICK_START.md` for quick reference

