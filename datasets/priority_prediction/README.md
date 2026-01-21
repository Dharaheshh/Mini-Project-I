# Priority Prediction Dataset

## Purpose
Train a model to predict priority level (High, Medium, Low) from images and context

## Folder Structure
- `High/` - Images that should be classified as High priority
- `Medium/` - Images that should be classified as Medium priority
- `Low/` - Images that should be classified as Low priority

## What Makes Each Priority?

### High Priority
- Electrical issues (sparking, exposed wires)
- Water leaks (active leaks, flooding)
- Safety hazards (sharp edges, broken glass)
- Critical equipment failures
- Emergency situations

### Medium Priority
- Noticeable damage
- Functional issues
- Equipment not working
- Moderate safety concerns

### Low Priority
- Cosmetic damage
- Minor scratches
- Small issues
- Non-urgent repairs

## How to Add Images

1. Place images in the appropriate priority folder
2. Optionally create a CSV file: `priority_data.csv`
   ```csv
   image_path,priority,category,note
   High/electrical_spark_001.jpg,High,Socket,sparking socket
   Medium/chair_wobbly_001.jpg,Medium,Chair,wobbly chair
   ```

## Minimum: 30 images per priority level
## Recommended: 100+ images per priority level

