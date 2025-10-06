const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    tax: {
        type: Number,
        default: function() {
            return parseFloat((this.price * 0.08).toFixed(2));
        }
    },
    shipping: {
        type: Number,
        default: 5.00
    },
    total: {
        type: Number,
        default: function() {
            return parseFloat((this.price + this.shipping + this.tax).toFixed(2));
        }
    },
    status: {
        type: String,
        enum: ['pending_payment', 'pending_delivery', 'shipped', 'delivered', 'cancelled', 'returned'],
        default: 'pending_payment'
    },
    paymentMethod: {
        type: String,
        enum: ['credit_card', 'bank_transfer', 'cod', 'other'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded', 'failed'],
        default: 'pending'
    },
    paymentDetails: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    shippingAddress: {
        type: String,
        required: true
    },
    deliveryDate: {
        type: Date
    },
    tracking: {
        carrier: String,
        trackingNumber: String,
        trackingURL: String
    },
    notes: {
        type: String,
        trim: true
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

// Update timestamp on document update
orderSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Create indexes for faster queries
orderSchema.index({ buyer: 1 });
orderSchema.index({ seller: 1 });
orderSchema.index({ product: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: 1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order; 