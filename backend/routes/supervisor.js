const express = require('express');
const { body, validationResult } = require('express-validator');
const Complaint = require('../models/Complaint');
const { auth, requireSupervisor } = require('../middleware/auth');
const Notification = require('../models/Notification');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);
router.use(requireSupervisor);

// @route   GET /api/supervisor/complaints
// @desc    Get all complaints assigned to the supervisor's department
// @access  Private/Supervisor
router.get('/complaints', async (req, res) => {
    try {
        const { status, priority, search } = req.query;

        if (!req.user.department) {
            return res.status(403).json({ message: 'Supervisor department not configured' });
        }

        // Enforce supervisor department restriction
        const filter = { assignedDepartment: req.user.department };

        if (priority) filter.priority = priority;
        if (status) filter.status = status;
        if (search) {
            filter.location = { $regex: search, $options: 'i' };
        }

        const complaints = await Complaint.find(filter)
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        // Let's also attach some simple stats explicitly for this supervisor
        const totalAssigned = await Complaint.countDocuments({ assignedDepartment: req.user.department });
        const pending = await Complaint.countDocuments({ assignedDepartment: req.user.department, status: 'Submitted' });
        const inProgress = await Complaint.countDocuments({ assignedDepartment: req.user.department, status: 'In-Progress' });
        const resolved = await Complaint.countDocuments({ assignedDepartment: req.user.department, status: 'Resolved' });

        res.json({
            complaints,
            stats: {
                totalAssigned,
                pending,
                inProgress,
                resolved
            }
        });
    } catch (error) {
        console.error('Supervisor get complaints error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/supervisor/complaints/:id/status
// @desc    Update complaint status
// @access  Private/Supervisor
router.put(
    '/complaints/:id/status',
    [body('status').isIn(['Submitted', 'In-Progress', 'Resolved']).withMessage('Invalid status')],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { status } = req.body;

            const complaint = await Complaint.findById(req.params.id);

            if (!complaint) {
                return res.status(404).json({ message: 'Complaint not found' });
            }

            // Security measure: Supervisor can ONLY edit complaints in their department
            if (complaint.assignedDepartment !== req.user.department) {
                return res.status(403).json({ message: 'Access denied. Complaint not in your department.' });
            }

            const oldStatus = complaint.status;
            complaint.status = status;
            complaint.statusHistory.push({ status });

            await complaint.save();
            await complaint.populate('user', 'name email');

            // Create Notification if status changed
            if (oldStatus !== status) {
                await Notification.create({
                    user: complaint.user._id,
                    complaint: complaint._id,
                    title: 'Status Updated (via Supervisor)',
                    type: status === 'Resolved' ? 'success' : status === 'In-Progress' ? 'info' : 'warning',
                    message: `Your report for "${complaint.category}" at ${complaint.location} has been updated to: ${status}`
                });
            }

            res.json(complaint);
        } catch (error) {
            console.error('Supervisor update status error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

module.exports = router;
