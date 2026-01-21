# Datasets Directory

This directory contains training data for ML models.

## Directory Structure

```
datasets/
├── category_classification/     # Images for category classification
│   ├── Chair/
│   ├── Bench/
│   ├── Projector/
│   ├── Socket/
│   ├── Pipe/
│   └── Other/
├── priority_prediction/        # Images + metadata for priority prediction
│   ├── High/
│   ├── Medium/
│   └── Low/
├── severity_detection/         # Images labeled by severity
│   ├── Minor/
│   ├── Moderate/
│   ├── Severe/
│   └── Hazardous/
└── raw/                        # Raw/unprocessed images
```

## How to Organize Data

### Category Classification
1. Create folders for each category: `Chair`, `Bench`, `Projector`, `Socket`, `Pipe`, `Other`
2. Place images of damaged items in their respective folders
3. Example: `category_classification/Chair/chair_broken_1.jpg`

### Priority Prediction
1. Organize by priority level: `High`, `Medium`, `Low`
2. Include images that match the priority level
3. You can also create a CSV file with: `image_path, priority, category, note`

### Severity Detection
1. Organize by severity: `Minor`, `Moderate`, `Severe`, `Hazardous`
2. Place images showing that level of damage
3. Example: `severity_detection/Severe/cracked_wall.jpg`

## Data Requirements

### Minimum Recommended
- **Category Classification**: 50-100 images per category
- **Priority Prediction**: 30-50 images per priority level
- **Severity Detection**: 30-50 images per severity level

### For Better Accuracy
- **Category Classification**: 200+ images per category
- **Priority Prediction**: 100+ images per priority level
- **Severity Detection**: 100+ images per severity level

## Image Guidelines

- **Format**: JPG, PNG (preferred)
- **Size**: 224x224 or larger (will be resized during training)
- **Quality**: Clear, well-lit images showing the damage
- **Variety**: Different angles, lighting, damage types

## Next Steps

1. **Collect Images**: Take photos of actual damage or use existing complaint images
2. **Organize**: Place images in appropriate folders
3. **Label**: Ensure images are in correct categories
4. **Train**: Use training scripts (to be created) to train models

## Notes

- Keep original images in `raw/` folder as backup
- Use consistent naming: `category_item_number.jpg`
- Document any special cases or edge cases

