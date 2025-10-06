const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const User = require('../models/User');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// Create a new report
router.post('/', auth, async (req, res) => {
    try {
        const { reportType, reason, details, targetType, targetId } = req.body;
        
        // Validate required fields
        if (!reportType || !reason || !details || !targetType) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        
        // Create report object
        const reportData = {
            reportedBy: req.user._id,
            reportType,
            reason,
            details,
            status: 'pending'
        };
        
        // Validate target based on targetType
        if (targetType === 'user' && targetId) {
            const targetUser = await User.findById(targetId);
            if (!targetUser) {
                return res.status(404).json({ message: 'Target user not found' });
            }
            reportData.targetUser = targetId;
        } else if (targetType === 'product' && targetId) {
            const targetProduct = await Product.findById(targetId);
            if (!targetProduct) {
                return res.status(404).json({ message: 'Target product not found' });
            }
            reportData.targetProduct = targetId;
        } else if (targetType !== 'other') {
            return res.status(400).json({ message: 'Invalid target type or missing target ID' });
        }
        
        // Create and save the report
        const report = new Report(reportData);
        await report.save();
        
        res.status(201).json({
            message: 'Report submitted successfully',
            report
        });
    } catch (error) {
        console.error('Error submitting report:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get user's reports
router.get('/my-reports', auth, async (req, res) => {
    try {
        const reports = await Report.find({ reportedBy: req.user._id })
            .sort({ createdAt: -1 });
            
        res.json(reports);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get report details (only the user who created it)
router.get('/:id', auth, async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }
        
        // Check if user is authorized to view this report
        if (report.reportedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        
        res.json(report);
    } catch (error) {
        console.error('Error fetching report:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 