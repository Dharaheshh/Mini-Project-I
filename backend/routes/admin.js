const express = require('express');
const { body, validationResult } = require('express-validator');
const Complaint = require('../models/Complaint');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);
router.use(adminAuth);

// @route   GET /api/admin/complaints
// @desc    Get all complaints with filters
// @access  Private/Admin
router.get('/complaints', async (req, res) => {
  try {
    const { category, priority, status } = req.query;

    // Build filter object
    const filter = {};
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (status) filter.status = status;

    const complaints = await Complaint.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    console.error('Get all complaints error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/complaints/:id/status
// @desc    Update complaint status
// @access  Private/Admin
router.put(
  '/complaints/:id/status',
  [body('status').isIn(['Submitted', 'In-Progress', 'Resolved']).withMessage('Invalid status')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { status, adminNotes } = req.body;

      const complaint = await Complaint.findById(req.params.id);

      if (!complaint) {
        return res.status(404).json({ message: 'Complaint not found' });
      }

      const oldStatus = complaint.status;
      complaint.status = status;
      if (adminNotes) {
        complaint.adminNotes = adminNotes;
      }

      await complaint.save();
      await complaint.populate('user', 'name email');

      // Create Notification if status changed
      if (oldStatus !== status) {
        const Notification = require('../models/Notification');
        await Notification.create({
          user: complaint.user._id,
          complaint: complaint._id,
          type: status === 'Resolved' ? 'success' : status === 'In-Progress' ? 'info' : 'warning',
          message: `Your report for "${complaint.category}" at ${complaint.location} has been updated to: ${status}`
        });
      }

      res.json(complaint);
    } catch (error) {
      console.error('Update status error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   PUT /api/admin/complaints/:id
// @desc    Update complaint (priority, category, etc.)
// @access  Private/Admin
router.put(
  '/complaints/:id',
  [
    body('priority').optional().isIn(['High', 'Medium', 'Low']),
    body('category').optional().isIn(['Chair', 'Bench', 'Projector', 'Socket', 'Pipe', 'Other']),
    body('severity').optional().isIn(['Minor', 'Moderate', 'Severe', 'Hazardous']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const complaint = await Complaint.findById(req.params.id);

      if (!complaint) {
        return res.status(404).json({ message: 'Complaint not found' });
      }

      const { priority, category, severity, adminNotes } = req.body;

      if (priority) complaint.priority = priority;
      if (category) complaint.category = category;
      if (severity) complaint.severity = severity;
      if (adminNotes) complaint.adminNotes = adminNotes;

      await complaint.save();
      await complaint.populate('user', 'name email');

      res.json(complaint);
    } catch (error) {
      console.error('Update complaint error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Private/Admin
router.get('/stats', async (req, res) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const submitted = await Complaint.countDocuments({ status: 'Submitted' });
    const inProgress = await Complaint.countDocuments({ status: 'In-Progress' });
    const resolved = await Complaint.countDocuments({ status: 'Resolved' });
    const highPriority = await Complaint.countDocuments({ priority: 'High' });

    const categoryStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      totalComplaints,
      status: {
        submitted,
        inProgress,
        resolved,
      },
      highPriority,
      categoryStats,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

