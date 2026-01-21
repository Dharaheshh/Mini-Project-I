# Improving ML Predictions

## Current Status

Right now, predictions are **rule-based** and analyze basic image properties:
- **Category**: Based on aspect ratio, brightness, color analysis
- **Priority**: Based on keywords + image contrast/brightness
- **Severity**: Based on brightness, contrast, color diversity

## Why Predictions Might Be Similar

1. **Rule-based fallbacks** - Not using actual ML models
2. **Similar images** - If all your test images are similar, predictions will be similar
3. **No training data** - We haven't trained custom models yet

## How to Get Better Predictions

### Option 1: Install PyTorch (Quick Improvement) ⚡

This will enable **pre-trained models** that actually analyze image content:

```bash
pip install torch torchvision
```

Then restart the ML server. The category classifier will use MobileNet (pre-trained on ImageNet) which can recognize objects much better.

**Benefits:**
- ✅ Much better category classification
- ✅ Actually analyzes image content, not just basic properties
- ✅ Works immediately (no training needed)

### Option 2: Train Custom Models (Best Accuracy) 🎯

For the best results, train models on actual damage images:

1. **Collect training data**: Gather images of damaged chairs, benches, projectors, etc.
2. **Label the data**: Categorize each image
3. **Train models**: Use transfer learning with your data
4. **Deploy**: Replace rule-based with trained models

**Benefits:**
- ✅ Highest accuracy
- ✅ Tailored to your specific damage types
- ⏳ Requires training data and time

### Option 3: Improve Rule-Based (Current) 📊

I've just improved the rule-based predictions to:
- Analyze image brightness, contrast, aspect ratio
- Use color analysis
- Consider image characteristics

**Current improvements:**
- ✅ Category now varies based on image properties
- ✅ Priority considers image contrast (damage visibility)
- ✅ Severity analyzes brightness, contrast, color diversity

## Test the Improvements

1. **Restart ML server**: `cd ml-server && python main.py`
2. **Try different images**:
   - Dark image → Might predict "Socket"
   - Square bright image → Might predict "Chair"
   - Wide image → Might predict "Projector" or "Bench"
   - Tall image → Might predict "Pipe"
3. **Check predictions** - They should now vary!

## Next Steps

**For immediate improvement:**
```bash
pip install torch torchvision
```
Then restart ML server - predictions will be much better!

**For best results:**
- Collect training data
- Train custom models
- Deploy trained models

## Current Prediction Logic

### Category Classification
- Analyzes: Aspect ratio, brightness, dominant colors
- Rules: Dark → Socket, Square bright → Chair, Wide → Projector/Bench, Tall → Pipe

### Priority Prediction
- Analyzes: Keywords in notes + image contrast
- High contrast (visible damage) → Higher priority
- Keywords like "spark", "leak", "hazard" → High priority

### Severity Detection
- Analyzes: Brightness, contrast, color diversity
- Very dark/bright → Higher severity
- High contrast → More visible damage → Higher severity

Try different images now - predictions should vary more! 🎯

