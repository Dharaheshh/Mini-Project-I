# Data Collection Guide

## Quick Start

1. **Start collecting images** from actual complaints
2. **Organize them** into the folder structure
3. **Label consistently** - use clear filenames
4. **Aim for variety** - different angles, lighting, damage types

## Where to Get Images

### Option 1: Use Existing Complaints
- Export images from your complaint database
- Organize by category/priority/severity
- This gives you real-world data

### Option 2: Take New Photos
- Visit actual damage sites
- Take multiple angles
- Ensure good lighting
- Include context when helpful

### Option 3: Synthetic/Simulated
- Create staged damage scenarios
- Use stock images (if allowed)
- Augment existing images

## Image Quality Guidelines

### Good Images ✅
- Clear, in focus
- Good lighting
- Damage is visible
- Appropriate size (not too small)
- Relevant to category

### Bad Images ❌
- Blurry or out of focus
- Too dark or overexposed
- Damage not visible
- Wrong category
- Too small or low resolution

## Naming Convention

Use descriptive, consistent names:
```
category_item_description_number.jpg

Examples:
- chair_broken_leg_001.jpg
- socket_sparking_002.jpg
- pipe_leaking_water_001.jpg
- projector_not_working_003.jpg
```

## Data Collection Checklist

- [ ] Collect minimum 50 images per category (category classification)
- [ ] Collect minimum 30 images per priority level
- [ ] Collect minimum 30 images per severity level
- [ ] Organize images into correct folders
- [ ] Verify image quality
- [ ] Use consistent naming
- [ ] Keep backups in `raw/` folder

## Training Data Split

When ready to train:
- **Training**: 70% of images
- **Validation**: 15% of images
- **Testing**: 15% of images

## Next Steps After Collection

1. **Review data** - Remove bad images
2. **Balance datasets** - Ensure similar numbers per category
3. **Augment data** - Rotate, flip, adjust brightness (if needed)
4. **Train models** - Use training scripts (to be created)

## Tips

- **More data = Better accuracy** (generally)
- **Variety matters** - Different lighting, angles, damage types
- **Quality over quantity** - 100 good images > 500 bad images
- **Start small** - You can always add more data later

