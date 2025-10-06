const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    // Who submitted the report
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // What type of report (product, user, etc.)
    reportType: {
        type: String,
        enum: ['product', 'user', 'other'],
        required: true
    },
    // The reason for the report
    reason: {
        type: String,
        enum: ['fake', 'offensive', 'prohibited', 'spam', 'inappropriate', 'fraud', 'other'],
        required: true
    },
    // Additional details provided by the reporter
    details: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    // Reference to the reported user (if applicable)
    targetUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Reference to the reported product (if applicable)
    targetProduct: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    // Status of the report
    status: {
        type: String,
        enum: ['pending', 'investigating', 'resolved', 'dismissed'],
        default: 'pending'
    },
    // Optional notes added by admin
    adminNotes: {
        type: String,
        trim: true
    },
    // Admin who resolved the report
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // When the report was resolved
    resolvedAt: {
        type: Date
    },
    // When the report was created
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Ensure indexes for faster queries
reportSchema.index({ status: 1 });
reportSchema.index({ reportType: 1 });
reportSchema.index({ reportedBy: 1 });
reportSchema.index({ targetUser: 1 });
reportSchema.index({ targetProduct: 1 });

// Update timestamp on document update
reportSchema.pre('save', function(next) {
    if (this.isModified()) {
        this.updatedAt = Date.now();
    }
    next();
});

const Report = mongoose.model('Report', reportSchema);

module.exports = Report; 