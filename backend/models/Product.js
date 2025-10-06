const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true,
        enum: ['electronics', 'furniture', 'clothing', 'books', 'toys', 'sports', 'automotive', 'other']
    },
    tags: [{
        type: String,
        trim: true
    }],
    condition: {
        type: String,
        required: true,
        enum: ['new', 'like-new', 'good', 'fair', 'poor'],
        default: 'good'
    },
    images: [{
        type: String  // URLs to images
    }],
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    location: {
        type: String,
        trim: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'removed'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
productSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Virtual for formatted price
productSchema.virtual('formattedPrice').get(function() {
    return `$${this.price.toFixed(2)}`;
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product; 