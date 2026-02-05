const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { body, validationResult } = require('express-validator');
const Complaint = require('../models/Complaint');
const { auth } = require('../middleware/auth');
const mlService = require('../services/mlService');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// @route   POST /api/complaints
// @desc    Create a new complaint
// @access  Private
router.post(
  '/',
  auth,
  upload.single('image'),
  [
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('note').optional().trim(),
    body('category').optional().isIn(['Chair', 'Bench', 'Projector', 'Socket', 'Pipe', 'Other']),
    body('priority').optional().isIn(['High', 'Medium', 'Low']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'Image is required' });
      }

      // Get existing complaint image URLs for duplicate detection
      const existingComplaints = await Complaint.find({}).select('image.url').limit(50);
      const existingImageUrls = existingComplaints.map(c => c.image.url);

      // Get ML predictions (category, priority, severity, description, duplicate)
      const mlPredictions = await mlService.getAllPredictions(
        req.file.buffer,
        req.body.note || '',
        existingImageUrls
      );

      // Check for duplicate
      if (mlPredictions.duplicate?.is_duplicate) {
        return res.status(400).json({
          message: 'This appears to be a duplicate complaint',
          duplicate: mlPredictions.duplicate,
        });
      }

      // Upload image to Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'damage-reports',
            resource_type: 'image',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });

      // LOGIC ENFORCEMENT: User cannot set priority manually.
      // Priority must come from ML predictions or default to 'Medium' until Admin reviews it.
      // We allow user to set Category/Note, but Priority is strictly system-controlled.
      const category = req.body.category || mlPredictions.category || 'Other';
      const severity = mlPredictions.severity || 'Moderate';
      const priority = mlPredictions.priority || 'Medium'; // Ignore req.body.priority entirely
      const note = req.body.note || mlPredictions.description || '';

      // Create complaint
      const complaint = new Complaint({
        user: req.user._id,
        image: {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
        },
        location: req.body.location,
        note: note,
        category: category,
        priority: priority,
        severity: severity,
        status: 'Submitted',
      });

      await complaint.save();
      await complaint.populate('user', 'name email');

      res.status(201).json(complaint);
    } catch (error) {
      console.error('Create complaint error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// @route   GET /api/complaints
// @desc    Get user's complaints
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const complaints = await Complaint.find({ user: req.user._id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/complaints/:id
// @desc    Get single complaint
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate('user', 'name email');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check if user owns the complaint or is admin
    if (complaint.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(complaint);
  } catch (error) {
    console.error('Get complaint error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/complaints/predict
// @desc    Get ML predictions for an image (before submitting)
// @access  Private
router.post(
  '/predict',
  auth,
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Image is required' });
      }

      const note = req.body.note || '';

      // Get ML predictions
      const predictions = await mlService.getAllPredictions(
        req.file.buffer,
        note,
        []
      );

      res.json({
        category: predictions.category,
        priority: predictions.priority,
        severity: predictions.severity,
        description: predictions.description,
        duplicate: predictions.duplicate,
      });
    } catch (error) {
      console.error('ML prediction error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

module.exports = router;

