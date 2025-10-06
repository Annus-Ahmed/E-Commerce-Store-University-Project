const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Messaging functionality has been removed
// All message-related endpoints now return empty responses

// Create a new message - DISABLED
router.post('/', auth, async (req, res) => {
    res.status(501).json({ message: 'Messaging functionality has been removed' });
});

// Get messages for a specific conversation - DISABLED
router.get('/conversation/:conversationId', auth, async (req, res) => {
    res.status(501).json({ message: 'Messaging functionality has been removed' });
});

// Get all conversations for the current user - DISABLED
router.get('/conversations', auth, async (req, res) => {
    res.status(501).json({ message: 'Messaging functionality has been removed' });
});

module.exports = router; 