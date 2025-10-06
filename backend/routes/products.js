const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const fs = require('fs');
const path = require('path');

// Get all products
router.get('/', async (req, res) => {
    try {
        const filters = {};
        const { 
            category, 
            seller, 
            minPrice, 
            maxPrice, 
            search, 
            tags, 
            condition, 
            location,
            sort = 'newest',
            isAvailable
        } = req.query;
        
        // Only show active products to users
        filters.status = 'active';
        
        // Apply filters if provided
        if (category) {
            // Handle multiple categories
            if (Array.isArray(category)) {
                filters.category = { $in: category };
            } else {
                filters.category = category;
            }
        }
        
        if (seller) filters.seller = seller;
        
        // Price range
        if (minPrice || maxPrice) {
            filters.price = {};
            if (minPrice) filters.price.$gte = Number(minPrice);
            if (maxPrice) filters.price.$lte = Number(maxPrice);
        }
        
        // Search in title and description
        if (search) {
            filters.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Tags filter (can be multiple)
        if (tags) {
            const tagArray = Array.isArray(tags) ? tags : [tags];
            filters.tags = { $in: tagArray };
        }
        
        // Condition filter (can be multiple)
        if (condition) {
            if (Array.isArray(condition)) {
                filters.condition = { $in: condition };
            } else {
                filters.condition = condition;
            }
        }
        
        // Location filter
        if (location) {
            filters.location = { $regex: location, $options: 'i' };
        }
        
        // Availability filter
        if (isAvailable !== undefined) {
            filters.isAvailable = isAvailable === 'true';
        }
        
        // Sort options
        let sortOption = {};
        switch (sort) {
            case 'newest':
                sortOption = { createdAt: -1 };
                break;
            case 'oldest':
                sortOption = { createdAt: 1 };
                break;
            case 'price_low':
                sortOption = { price: 1 };
                break;
            case 'price_high':
                sortOption = { price: -1 };
                break;
            case 'title_asc':
                sortOption = { title: 1 };
                break;
            case 'title_desc':
                sortOption = { title: -1 };
                break;
            default:
                sortOption = { createdAt: -1 };
        }
        
        // Get products with applied filters
        const products = await Product.find(filters)
            .populate('seller', 'name email')
            .sort(sortOption);
        
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
});

// Get product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('seller', 'name email phone bio profileImage');
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Error fetching product', error: error.message });
    }
});

// Create a new product (sellers only)
router.post('/', auth, upload.array('images', 5), async (req, res) => {
    try {
        // Check if user is a seller
        const user = await User.findById(req.user._id);
        if (user.role !== 'seller') {
            // Delete uploaded files if user is not a seller
            if (req.files) {
                req.files.forEach(file => {
                    fs.unlinkSync(file.path);
                });
            }
            return res.status(403).json({ message: 'Only sellers can create product listings' });
        }
        
        // Get uploaded file paths
        const imagePaths = req.files ? req.files.map(file => `/uploads/${path.basename(file.path)}`) : [];

        const product = new Product({
            ...req.body,
            seller: req.user._id,
            images: imagePaths // Save image paths instead of URLs
        });
        
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        // Delete uploaded files on error
        if (req.files) {
            req.files.forEach(file => {
                fs.unlinkSync(file.path);
            });
        }
        console.error('Error creating product listing:', error);
        res.status(400).json({ message: 'Error creating product listing', error: error.message });
    }
});

// Update a product (seller only)
router.patch('/:id', auth, upload.array('images', 5), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        // Check if product exists
        if (!product) {
            // Delete uploaded files if product not found
            if (req.files) {
                req.files.forEach(file => {
                    fs.unlinkSync(file.path);
                });
            }
            return res.status(404).json({ message: 'Product not found' });
        }
        
        // Check if user is the seller of this product
        if (product.seller.toString() !== req.user._id.toString()) {
            // Delete uploaded files if user is not the seller
            if (req.files) {
                req.files.forEach(file => {
                    fs.unlinkSync(file.path);
                });
            }
            return res.status(403).json({ message: 'You can only update your own product listings' });
        }
        
        // Process uploaded images if any
        if (req.files && req.files.length > 0) {
            const newImagePaths = req.files.map(file => `/uploads/${path.basename(file.path)}`);

            // Handle image array in the request body based on the keep_images parameter
            if (req.body.keep_images === 'false') {
                // Replace all images with new uploads
                // Delete old image files
                product.images.forEach(imagePath => {
                    const filePath = path.join(__dirname, '..', imagePath);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                });
                product.images = newImagePaths;
            } else {
                // Append new uploads to existing images
                product.images = [...product.images, ...newImagePaths];
            }
        }
        
        // Update only allowed fields
        const updates = Object.keys(req.body);
        const allowedUpdates = ['title', 'description', 'price', 'category', 'tags', 'condition', 'location', 'isAvailable'];
        
        updates.forEach(update => {
            if (allowedUpdates.includes(update)) {
                product[update] = req.body[update];
            }
        });
        
        await product.save();
        
        res.json(product);
    } catch (error) {
        // Delete uploaded files on error
        if (req.files) {
            req.files.forEach(file => {
                fs.unlinkSync(file.path);
            });
        }
        console.error('Error updating product listing:', error);
        res.status(400).json({ message: 'Error updating product listing', error: error.message });
    }
});

// Delete a product (seller only)
router.delete('/:id', auth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        // Check if product exists
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        // Check if user is the seller of this product
        if (product.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only delete your own product listings' });
        }
        
        // Delete image files
        product.images.forEach(imagePath => {
            const filePath = path.join(__dirname, '..', imagePath);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });
        
        // Use findByIdAndDelete instead of remove()
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product listing deleted successfully' });
    } catch (error) {
        console.error('Error deleting product listing:', error);
        res.status(500).json({ message: 'Error deleting product listing', error: error.message });
    }
});

// Get categories
router.get('/categories/all', async (req, res) => {
    try {
        const categories = ['electronics', 'furniture', 'clothing', 'books', 'toys', 'sports', 'automotive', 'other'];
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
});

// Get most frequent tags
router.get('/tags/popular', async (req, res) => {
    try {
        const aggregation = await Product.aggregate([
            { $unwind: '$tags' },
            { $group: { _id: '$tags', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 20 }
        ]);
        
        const popularTags = aggregation.map(item => item._id);
        res.json(popularTags);
    } catch (error) {
        console.error('Error fetching popular tags:', error);
        res.status(500).json({ message: 'Error fetching popular tags', error: error.message });
    }
});

// Get similar products
router.get('/similar/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const sourceProduct = await Product.findById(productId);
        
        if (!sourceProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        // Find products with similar characteristics
        const similarProducts = await Product.find({
            _id: { $ne: productId }, // Exclude the current product
            $or: [
                // Same category
                { category: sourceProduct.category },
                // Matching tags (at least one)
                { tags: { $in: sourceProduct.tags } },
                // Similar price range (within 20% of the original price)
                { 
                    price: { 
                        $gte: sourceProduct.price * 0.8, 
                        $lte: sourceProduct.price * 1.2 
                    } 
                }
            ]
        }).limit(12);
        
        res.json(similarProducts);
    } catch (error) {
        console.error('Error finding similar products:', error);
        res.status(500).json({ message: 'Error finding similar products', error: error.message });
    }
});

module.exports = router; 