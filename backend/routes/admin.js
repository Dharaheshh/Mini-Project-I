const express = require('express');
const { body, validationResult } = require('express-validator');
const Complaint = require('../models/Complaint');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);
router.use(adminAuth);

// @route   GET /api/admin/export-report
// @desc    Generate and export PDF report
// @access  Private/Admin
router.get('/export-report', async (req, res) => {
  try {
    const reportService = require('../services/reportService');
    const pdfBuffer = await reportService.generateReport(req.query);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=damage-report.pdf');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Export report error:', error);
    res.status(500).json({ message: 'Server error while generating report' });
  }
});

// @route   POST /api/admin/export-department-report
// @desc    Generate and export department-specific PDF report
// @access  Private/Admin
router.post('/export-department-report', async (req, res) => {
  try {
    const { department } = req.body;
    if (!['infrastructure', 'electrical', 'plumbing'].includes(department)) {
      return res.status(400).json({ message: 'Invalid department scope provided' });
    }

    const reportService = require('../services/reportService');
    const pdfBuffer = await reportService.generateReport({ type: 'department', department });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${department}-report.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Export department report error:', error);
    res.status(500).json({ message: 'Server error while mapping departmental PDF' });
  }
});

// @route   POST /api/admin/send-department-report
// @desc    Email department-specific PDF report directly to assigned Supervisor
// @access  Private/Admin
router.post('/send-department-report', async (req, res) => {
  try {
    const { department } = req.body;
    if (!['infrastructure', 'electrical', 'plumbing'].includes(department)) {
      return res.status(400).json({ message: 'Invalid department scope provided' });
    }

    const User = require('../models/User');
    const supervisor = await User.findOne({ role: 'supervisor', department });

    if (!supervisor) {
      return res.status(404).json({ message: `No active supervisor mapped to the ${department} department.` });
    }

    const reportService = require('../services/reportService');
    const emailService = require('../services/emailService');

    // Generate strict buffer in memory
    const pdfBuffer = await reportService.generateReport({ type: 'department', department });

    const total = await Complaint.countDocuments({ assignedDepartment: department });
    const resolved = await Complaint.countDocuments({ assignedDepartment: department, status: 'Resolved' });
    const pending = await Complaint.countDocuments({ assignedDepartment: department, status: { $in: ['Submitted', 'In-Progress'] } });

    // Stream Buffer explicitly to Nodemailer
    await emailService.sendSupervisorReport(supervisor, department, { total, resolved, pending }, pdfBuffer);

    res.json({ message: `Report dispatched successfully to ${supervisor.email}` });
  } catch (error) {
    console.error('Send department report error:', error);
    res.status(500).json({ message: 'Server error during SMTP email dispatch.' });
  }
});

// @route   GET /api/admin/complaints
// @desc    Get all complaints with filters
// @access  Private/Admin
router.get('/complaints', async (req, res) => {
  try {
    const { category, priority, status, startDate, endDate, userLocation, search } = req.query;

    // Build filter object
    const filter = {};
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    if (search) {
      // Allow searching by exact user ID or location string if needed
      filter.location = { $regex: search, $options: 'i' };
    }

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
      complaint.statusHistory.push({ status });
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
          title: 'Status Updated',
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

      const oldPriority = complaint.priority;

      if (priority) complaint.priority = priority;
      if (category) complaint.category = category;
      if (severity) complaint.severity = severity;
      if (adminNotes) complaint.adminNotes = adminNotes;

      // Handle priority change notification explicitly
      if (priority === 'High' && oldPriority !== 'High') {
        const Notification = require('../models/Notification');
        const User = require('../models/User');
        const admins = await User.find({ role: 'admin' });
        const adminNotifs = admins.map(admin => ({
          user: admin._id,
          complaint: complaint._id,
          title: 'High Priority Complaint',
          type: 'warning',
          message: `Complaint priority upgraded to HIGH for "${complaint.category}" at ${complaint.location}`
        }));
        if (adminNotifs.length > 0) {
          await Notification.insertMany(adminNotifs);
        }
      }

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

// @route   GET /api/admin/heatmap
// @desc    Get dynamic heatmap data
// @access  Private/Admin
router.get('/heatmap', async (req, res) => {
  try {
    const { filter = 'total' } = req.query;
    const matchquery = {};

    switch (filter) {
      case 'pending':
        matchquery.status = { $in: ['Submitted', 'In-Progress'] };
        break;
      case 'high':
        matchquery.priority = 'High';
        break;
      case 'total':
      default:
        // No additional filters
        break;
    }

    const heatmapStats = await Complaint.aggregate([
      { $match: matchquery },
      { $group: { _id: '$location', count: { $sum: 1 } } }
    ]);

    const formattedData = heatmapStats.map(stat => ({
      location: stat._id,
      count: stat.count
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Heatmap API error:', error);
    res.status(500).json({ message: 'Server error generating heatmap' });
  }
});

module.exports = router;

