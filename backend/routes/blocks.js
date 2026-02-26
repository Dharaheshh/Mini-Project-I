const express = require('express');
const router = express.Router();
const BLOCK_ANCHORS = require('../constants/blocks');

// @route   GET /api/blocks
// @desc    Get all standardized campus blocks
// @access  Public
router.get('/', (req, res) => {
    res.json(BLOCK_ANCHORS);
});

module.exports = router;
