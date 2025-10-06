const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Create a new order
router.post('/', auth, async (req, res) => {
    try {
        const { 
            productId, 
            paymentMethod, 
            shippingAddress, 
            paymentDetails
        } = req.body;

        // Validate required fields
        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required' });
        }

        if (!paymentMethod) {
            return res.status(400).json({ message: 'Payment method is required' });
        }

        // Make sure shipping address is provided
        if (!shippingAddress || typeof shippingAddress !== 'string' || !shippingAddress.trim()) {
            return res.status(400).json({ message: 'A valid shipping address is required' });
        }

        // Validate product exists and is available
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (!product.isAvailable) {
            return res.status(400).json({ message: 'Product is not available for purchase' });
        }

        // Create new order
        const order = new Order({
            product: productId,
            buyer: req.user._id,
            seller: product.seller,
            price: product.price,
            paymentMethod,
            shippingAddress,
            status: paymentMethod === 'cod' ? 'pending_delivery' : 'pending_payment'
        });

        // Process payment based on method
        if (paymentMethod === 'credit_card') {
            // In a real app, you would integrate with a payment gateway here
            // For now, we'll simulate a successful payment
            order.paymentStatus = 'paid';
            order.paymentDetails = {
                ...paymentDetails,
                transactionId: 'sim_' + Math.random().toString(36).substring(2, 15),
                cardNumber: paymentDetails?.cardNumber ? 
                    '****' + paymentDetails.cardNumber.slice(-4) : '****'
            };
        } else if (paymentMethod === 'cod') {
            order.paymentStatus = 'pending';
            order.paymentDetails = {
                codAddress: shippingAddress
            };
        } else if (paymentMethod === 'bank_transfer') {
            order.paymentStatus = 'pending';
            order.paymentDetails = {
                bankDetails: 'Bank transfer details will be sent separately',
                referenceId: 'REF_' + Math.random().toString(36).substring(2, 10).toUpperCase()
            };
        }

        // Save the order
        await order.save();
        
        // Update product availability
        product.isAvailable = false;
        await product.save();

        // Return the created order
        res.status(201).json(order);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Error creating order', error: error.message });
    }
});

// Get orders for current user
router.get('/myorders', auth, async (req, res) => {
    try {
        const orders = await Order.find({ buyer: req.user._id })
            .populate('product')
            .populate('seller', 'name email phone')
            .sort({ createdAt: -1 });
            
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
});

// Get orders for products user is selling
router.get('/mysales', auth, async (req, res) => {
    try {
        const orders = await Order.find({ seller: req.user._id })
            .populate('product')
            .populate('buyer', 'name email phone')
            .sort({ createdAt: -1 });
            
        res.json(orders);
    } catch (error) {
        console.error('Error fetching sales:', error);
        res.status(500).json({ message: 'Error fetching sales', error: error.message });
    }
});

// Get specific order details
router.get('/:id', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('product')
            .populate('buyer', 'name email phone')
            .populate('seller', 'name email phone');
            
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        // Only the buyer, seller, or admin should be able to see order details
        if (order.buyer._id.toString() !== req.user._id.toString() && 
            order.seller._id.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view this order' });
        }
        
        res.json(order);
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({ message: 'Error fetching order details', error: error.message });
    }
});

// Update order status - for sellers and admins
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        // Only the seller or admin can update order status
        if (order.seller.toString() !== req.user._id.toString() && 
            req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this order' });
        }
        
        // Update status
        order.status = status;
        
        // If status is delivered and payment method is COD, mark as paid
        if (status === 'delivered' && order.paymentMethod === 'cod') {
            order.paymentStatus = 'paid';
        }
        
        await order.save();
        
        res.json(order);
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Error updating order status', error: error.message });
    }
});

// Confirm payment for bank transfer orders
router.patch('/:id/confirm-payment', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        // Only the seller or admin can confirm payment
        if (order.seller.toString() !== req.user._id.toString() && 
            req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to confirm payment' });
        }
        
        if (order.paymentMethod !== 'bank_transfer' && order.paymentMethod !== 'cod') {
            return res.status(400).json({ message: 'Invalid payment method for manual confirmation' });
        }
        
        // Update payment status
        order.paymentStatus = 'paid';
        await order.save();
        
        res.json(order);
    } catch (error) {
        console.error('Error confirming payment:', error);
        res.status(500).json({ message: 'Error confirming payment', error: error.message });
    }
});

module.exports = router; 