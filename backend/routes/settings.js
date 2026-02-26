const express = require('express');
const Settings = require('../models/Settings');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware
router.use(auth);
router.use(adminAuth);

// @route   GET /api/settings
// @desc    Get global settings
// @access  Private/Admin
router.get('/', async (req, res) => {
    try {
        let settings = await Settings.findById('global');
        if (!settings) {
            settings = new Settings({ _id: 'global' });
            await settings.save();
        }
        res.json(settings);
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/settings
// @desc    Update global settings
// @access  Private/Admin
router.put('/', async (req, res) => {
    try {
        const updatedSettings = await Settings.findByIdAndUpdate(
            'global',
            { $set: req.body },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        res.json(updatedSettings);
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
