const User = require('../models/User');
const Product = require('../models/Product');
const Report = require('../models/Report');
const Order = require('../models/Order');
const mongoose = require('mongoose');

// Get admin dashboard stats
exports.getDashboardStats = async (req, res) => {
    try {
        // Check if collections exist before counting
        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);
        
        // Default stats object
        const stats = {
            users: { total: 0, sellers: 0, buyers: 0 },
            products: { total: 0, active: 0 },
            reports: { total: 0, pending: 0 },
            orders: { total: 0, pending: 0, completed: 0 }
        };
        
        // Only count if collections exist
        if (collectionNames.includes('users')) {
            stats.users.total = await User.countDocuments();
            stats.users.sellers = await User.countDocuments({ role: 'seller' });
            stats.users.buyers = await User.countDocuments({ role: 'buyer' });
        }
        
        if (collectionNames.includes('products')) {
            stats.products.total = await Product.countDocuments();
            stats.products.active = await Product.countDocuments({ isAvailable: true });
        }
        
        if (collectionNames.includes('reports')) {
            stats.reports.total = await Report.countDocuments();
            stats.reports.pending = await Report.countDocuments({ status: 'pending' });
        }
        
        if (collectionNames.includes('orders')) {
            stats.orders.total = await Order.countDocuments();
            stats.orders.pending = await Order.countDocuments({ status: { $in: ['pending_payment', 'pending_delivery'] } });
            stats.orders.completed = await Order.countDocuments({ status: 'delivered' });
        }
        
     //   
        res.json(stats);
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all users with pagination
exports.getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Build query with filters
        const query = {};
        
        // Search by name or email
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            query.$or = [
                { name: searchRegex },
                { email: searchRegex }
            ];
        }
        
        // Filter by role
        if (req.query.role) {
            query.role = req.query.role;
        }
        
        // Execute query with pagination
        const users = await User.find(query)
            .select('-password')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
            
        // Get total count with the same filters for pagination
        const total = await User.countDocuments(query);
        
        res.json({
            users,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update user status (block/unblock)
exports.updateUserStatus = async (req, res) => {
    try {
        const { userId, isActive } = req.body;
        
        const user = await User.findByIdAndUpdate(
            userId, 
            { isActive }, 
            { new: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update user role
exports.updateUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;
        
        // Validate role
        if (!['buyer', 'seller'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role. Must be buyer or seller.' });
        }
        
        // Find the user
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Don't allow changing admin roles
        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Admin roles cannot be modified' });
        }
        
        // Update the role
        user.role = role;
        await user.save();
        
        console.log(`User ${user.name} (${user._id}) role changed to ${role} by admin ${req.user.name}`);
        
        res.json({
            message: 'User role updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all products with pagination
exports.getAllProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Build query with filters
        const query = {};
        let useAggregation = false;
        
        // Filter by status
        if (req.query.status) {
            query.status = req.query.status;
        }
        
        // Search by title or seller name
        if (req.query.search) {
            useAggregation = true;
            const searchRegex = new RegExp(req.query.search, 'i');
            
            // Add any existing filters to the aggregation
            const aggregationMatch = { ...query };
            
            // We need to search in product title and also in seller name
            // We'll use aggregation for this complex query
            const products = await Product.aggregate([
                {
                    $lookup: {
                        from: 'users',
                        localField: 'seller',
                        foreignField: '_id',
                        as: 'sellerData'
                    }
                },
                {
                    $match: {
                        $and: [
                            aggregationMatch,
                            {
                                $or: [
                                    { title: searchRegex },
                                    { description: searchRegex },
                                    { 'sellerData.name': searchRegex }
                                ]
                            }
                        ]
                    }
                },
                { $skip: skip },
                { $limit: limit },
                { $sort: { createdAt: -1 } }
            ]);
            
            // Populate seller info manually since we used aggregation
            const populatedProducts = await Product.populate(products, {
                path: 'seller',
                select: 'name email'
            });
            
            // Count total matching documents for pagination
            const countMatch = {
                $and: [
                    aggregationMatch,
                    {
                        $or: [
                            { title: searchRegex },
                            { description: searchRegex },
                            { 'sellerData.name': searchRegex }
                        ]
                    }
                ]
            };
            
            const total = await Product.aggregate([
                {
                    $lookup: {
                        from: 'users',
                        localField: 'seller',
                        foreignField: '_id',
                        as: 'sellerData'
                    }
                },
                { $match: countMatch },
                { $count: 'total' }
            ]);
            
            return res.json({
                products: populatedProducts,
                total: total.length > 0 ? total[0].total : 0,
                pages: total.length > 0 ? Math.ceil(total[0].total / limit) : 0,
                currentPage: page
            });
        }
        
        // Standard query (when not searching by title/seller)
        if (!useAggregation) {
            const products = await Product.find(query)
            .populate('seller', 'name email')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
            
            const total = await Product.countDocuments(query);
        
        res.json({
            products,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page
        });
        }
    } catch (error) {
        console.error('Error getting products:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update product status (active/inactive/removed)
exports.updateProductStatus = async (req, res) => {
    try {
        const { productId, status } = req.body;
        
        if (!['active', 'inactive', 'removed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }
        
        const product = await Product.findByIdAndUpdate(
            productId, 
            { status }, 
            { new: true }
        ).populate('seller', 'name email');
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        res.json(product);
    } catch (error) {
        console.error('Error updating product status:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all reports with pagination
exports.getAllReports = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Apply filters from query params
        const filters = {};
        
        if (req.query.status) {
            filters.status = req.query.status;
        }
        
        if (req.query.reportType) {
            filters.reportType = req.query.reportType;
        }
        
        if (req.query.targetType) {
            if (req.query.targetType === 'product') {
                filters.targetProduct = { $exists: true };
            } else if (req.query.targetType === 'user') {
                filters.targetUser = { $exists: true };
            } else if (req.query.targetType === 'other') {
                // For "other" type, neither targetProduct nor targetUser should exist
                filters.$and = [
                    { targetProduct: { $exists: false } },
                    { targetUser: { $exists: false } }
                ];
            }
        }
        
        console.log('Report filters:', filters);
        
        const reports = await Report.find(filters)
            .populate('reportedBy', 'name email')
            .populate('targetUser', 'name email')
            .populate('targetProduct', 'title price')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
            
        const total = await Report.countDocuments(filters);
        
        res.json({
            reports,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        console.error('Error getting reports:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update report status
exports.updateReportStatus = async (req, res) => {
    try {
        const { reportId, status, adminNotes } = req.body;
        
        if (!['pending', 'investigating', 'resolved', 'dismissed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }
        
        const report = await Report.findByIdAndUpdate(
            reportId,
            { 
                status,
                adminNotes,
                resolvedBy: req.user._id,
                resolvedAt: status === 'resolved' ? new Date() : undefined
            },
            { new: true }
        )
        .populate('reportedBy', 'name email')
        .populate('targetUser', 'name email')
        .populate('targetProduct', 'title price');
        
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }
        
        res.json(report);
    } catch (error) {
        console.error('Error updating report status:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all orders with pagination
exports.getAllOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Apply any filters from query params
        const filters = {};
        if (req.query.status) {
            filters.status = req.query.status;
        }
        
        if (req.query.paymentStatus) {
            filters.paymentStatus = req.query.paymentStatus;
        }
        
        const orders = await Order.find(filters)
            .populate('product', 'title price images')
            .populate('buyer', 'name email')
            .populate('seller', 'name email')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
            
        const total = await Order.countDocuments(filters);
        
        res.json({
            orders,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        console.error('Error getting orders:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status, paymentStatus } = req.body;
        
        const updateData = {};
        
        if (status) {
            if (!['pending_payment', 'pending_delivery', 'shipped', 'delivered', 'cancelled', 'returned'].includes(status)) {
                return res.status(400).json({ message: 'Invalid status value' });
            }
            updateData.status = status;
        }
        
        if (paymentStatus) {
            if (!['pending', 'paid', 'refunded', 'failed'].includes(paymentStatus)) {
                return res.status(400).json({ message: 'Invalid payment status value' });
            }
            updateData.paymentStatus = paymentStatus;
        }
        
        const order = await Order.findByIdAndUpdate(
            orderId,
            updateData,
            { new: true }
        )
        .populate('product', 'title price images')
        .populate('buyer', 'name email')
        .populate('seller', 'name email');
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        res.json(order);
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get a single product by ID (for admin, returns any status)
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name email');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}; 