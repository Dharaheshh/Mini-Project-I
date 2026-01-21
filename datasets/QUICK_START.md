# Quick Start - Adding Your Datasets

## 📁 Folder Structure Created

```
datasets/
├── category_classification/
│   ├── Chair/          ← Put chair damage images here
│   ├── Bench/          ← Put bench damage images here
│   ├── Projector/      ← Put projector damage images here
│   ├── Socket/         ← Put socket damage images here
│   ├── Pipe/           ← Put pipe damage images here
│   └── Other/          ← Put other damage images here
│
├── priority_prediction/
│   ├── High/           ← High priority damage images
│   ├── Medium/         ← Medium priority damage images
│   └── Low/            ← Low priority damage images
│
├── severity_detection/
│   ├── Minor/          ← Minor damage images
│   ├── Moderate/       ← Moderate damage images
│   ├── Severe/         ← Severe damage images
│   └── Hazardous/      ← Hazardous damage images
│
└── raw/                ← Dump all images here first, then organize
```

## 🚀 How to Add Images

### Step 1: Collect Images
- Take photos of actual damage
- Export from existing complaints
- Gather from various sources

### Step 2: Organize by Category
1. Open `datasets/category_classification/`
2. Place images in the correct folder:
   - Broken chair? → `Chair/`
   - Damaged socket? → `Socket/`
   - Leaking pipe? → `Pipe/`
   - etc.

### Step 3: Organize by Priority (Optional)
1. Open `datasets/priority_prediction/`
2. Place images based on urgency:
   - Emergency? → `High/`
   - Needs repair? → `Medium/`
   - Cosmetic? → `Low/`

### Step 4: Organize by Severity (Optional)
1. Open `datasets/severity_detection/`
2. Place images based on damage level:
   - Small scratch? → `Minor/`
   - Noticeable damage? → `Moderate/`
   - Major damage? → `Severe/`
   - Dangerous? → `Hazardous/`

## 📝 Naming Your Images

Use descriptive names:
```
category_item_description_number.jpg

Examples:
- chair_broken_leg_001.jpg
- socket_sparking_002.jpg
- pipe_leaking_001.jpg
- projector_not_working_003.jpg
```

## 📊 Minimum Requirements

- **Category Classification**: 50 images per category (300 total)
- **Priority Prediction**: 30 images per level (90 total)
- **Severity Detection**: 30 images per level (120 total)

## ✅ Checklist

- [ ] Created folder structure ✓
- [ ] Collected images
- [ ] Organized by category
- [ ] Organized by priority (optional)
- [ ] Organized by severity (optional)
- [ ] Used consistent naming
- [ ] Verified image quality

## 📚 More Info

- See `README.md` for detailed structure
- See `DATA_COLLECTION_GUIDE.md` for collection tips
- See individual README files in each folder

## 🎯 Next Steps

Once you have enough images:
1. Review and clean up bad images
2. Balance datasets (similar numbers per category)
3. Use training scripts (to be created) to train models
4. Deploy trained models to replace rule-based predictions

