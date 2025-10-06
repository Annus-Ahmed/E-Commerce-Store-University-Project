const express = require('express');
const router = express.Router();
const adminController = require('../controllers/AdminController');
const auth = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');

// Admin dashboard statistics
router.get('/dashboard', auth, isAdmin, adminController.getDashboardStats);

// User management routes
router.get('/users', auth, isAdmin, adminController.getAllUsers);
router.patch('/users/status', auth, isAdmin, adminController.updateUserStatus);
router.patch('/users/:userId/role', auth, isAdmin, adminController.updateUserRole);

// Product management routes
router.get('/products', auth, isAdmin, adminController.getAllProducts);
router.patch('/products/status', auth, isAdmin, adminController.updateProductStatus);
router.get('/products/:id', auth, isAdmin, adminController.getProductById);

// Report management routes
router.get('/reports', auth, isAdmin, adminController.getAllReports);
router.patch('/reports/status', auth, isAdmin, adminController.updateReportStatus);

// Order management routes
router.get('/orders', auth, isAdmin, adminController.getAllOrders);
router.patch('/orders/status', auth, isAdmin, adminController.updateOrderStatus);

module.exports = router; 