/**
 * testWhatsapp.js
 * Admin-only test routes for verifying WhatsApp integration.
 * 
 * Routes:
 *  POST /api/test/whatsapp          — Send a plain text test to admin number
 *  POST /api/test/issue-notification — Simulate full new-complaint notification flow
 */
const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const whatsappService = require('../services/whatsappService');
const { notifyNewComplaint } = require('../services/notificationOrchestrator');

const router = express.Router();
router.use(auth);
router.use(adminAuth);

// @route   POST /api/test/whatsapp
// @desc    Send a basic test message to the admin WhatsApp number
// @access  Private/Admin
router.post('/whatsapp', async (req, res) => {
    try {
        if (!whatsappService.isReady()) {
            return res.status(503).json({ message: 'WhatsApp service not configured. Check WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, ADMIN_WHATSAPP_NUMBER in .env' });
        }

        const to = req.body.to || process.env.ADMIN_WHATSAPP_NUMBER;
        const text = req.body.message || `✅ *WhatsApp Integration Test*\n\nThis is a test message from the Campus Damage Reporting System.\n\n🕒 Sent at: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;

        const result = await whatsappService.sendTextMessage(to, text);

        if (result.success) {
            res.json({ message: `Test message sent to ${to}`, messageId: result.messageId });
        } else {
            res.status(500).json({ message: 'Failed to send test message', error: result.error });
        }
    } catch (err) {
        console.error('Test WhatsApp error:', err.message);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// @route   POST /api/test/issue-notification
// @desc    Simulate full new complaint notification flow with mock data
// @access  Private/Admin
// Body: { department: 'electrical' } — optional, defaults to 'infrastructure'
router.post('/issue-notification', async (req, res) => {
    try {
        if (!whatsappService.isReady()) {
            return res.status(503).json({ message: 'WhatsApp service not configured.' });
        }

        const department = req.body.department || 'infrastructure';

        // Build a realistic mock complaint
        const mockComplaint = {
            _id: '507f1f77bcf86cd799439011',
            user: { name: 'Test User', email: 'test@campus.edu' },
            location: 'A Block',
            classroom: 'Room 101',
            category: 'Socket',
            priority: 'High',
            severity: 'Severe',
            note: 'Electrical socket sparking near entrance, potential fire hazard.',
            assignedDepartment: department,
            duplicate: false,
            slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
            createdAt: new Date(),
        };

        // Run the full orchestrator
        await notifyNewComplaint(mockComplaint);

        res.json({
            message: 'Test notification dispatched. Check WhatsApp and backend logs.',
            mockComplaint: {
                ticketId: '#439011',
                department,
                priority: mockComplaint.priority,
                adminNumber: process.env.ADMIN_WHATSAPP_NUMBER,
            }
        });
    } catch (err) {
        console.error('Test issue notification error:', err.message);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
