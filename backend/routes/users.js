const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configure multer for profile image uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const uploadsDir = path.join(__dirname, '../uploads/profiles');
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        cb(null, uploadsDir);
    },
    filename: function(req, file, cb) {
        // Create unique filename with user ID and timestamp
        const userId = req.user._id;
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        cb(null, `user-${userId}-${timestamp}${ext}`);
    }
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max size
    },
    fileFilter: fileFilter
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
    try {
        // Get user data and exclude password
        const user = await User.findById(req.user._id).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Make sure role is always included in the response
        const userData = user.toObject();
        if (!userData.role) {
            userData.role = req.user.role || 'user'; // Default to user if somehow missing
        }
        
        res.json(userData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
});

// Update user profile
router.patch('/profile', auth, async (req, res) => {
    try {
        // Get allowed updates from the request body
        const updates = Object.keys(req.body);
        const allowedUpdates = ['name', 'phone', 'address', 'bio', 'profileImage'];
        
        // Check if updates are valid
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));
        if (!isValidOperation) {
            return res.status(400).json({ message: 'Invalid updates' });
        }
        
        // Get the user
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Handle each field update
        updates.forEach(update => {
            if (update === 'address') {
                try {
                    // Handle address as either object or JSON string
                    if (typeof req.body.address === 'string') {
                        user.address = JSON.parse(req.body.address);
                    } else {
                        user.address = req.body.address;
                    }
                } catch (e) {
                    console.error('Error parsing address:', e);
                    // If parsing fails, just use the string as-is
                    user.address = req.body.address;
                }
            } else {
                user[update] = req.body[update];
            }
        });
        
        // Update lastActive timestamp
        user.lastActive = new Date();
        
        // Save the user
        await user.save();
        
        // Return user without password
        const userToReturn = user.toObject();
        delete userToReturn.password;
        
        res.json(userToReturn);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(400).json({ message: 'Error updating profile', error: error.message });
    }
});

// Upload profile image
router.post('/profile/avatar', auth, upload.single('profileImage'), async (req, res) => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }
        
        // Get the user
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Remove old profile image if it exists and is not the default
        if (user.profileImage && 
            fs.existsSync(path.join(__dirname, '..', user.profileImage))) {
            try {
                fs.unlinkSync(path.join(__dirname, '..', user.profileImage));
            } catch (unlinkError) {
                console.error('Error removing old profile image:', unlinkError);
                // Continue with the update even if old file removal fails
            }
        }
        
        // Update user with new profile image path
        const relativePath = path.join('uploads/profiles', path.basename(req.file.path));
        user.profileImage = relativePath.replace(/\\/g, '/'); // Normalize path for all OS
        await user.save();
        
        res.json({ 
            message: 'Profile image uploaded successfully',
            profileImage: user.profileImage
        });
    } catch (error) {
        console.error('Error uploading profile image:', error);
        res.status(500).json({ message: 'Error uploading profile image', error: error.message });
    }
}, (error, req, res, next) => {
    // Error handling for multer
    console.error('Multer error:', error);
    res.status(400).json({ message: error.message });
});

// Get user's listings
router.get('/listings', auth, async (req, res) => {
    try {
        // Find all products where the seller is the current user
        const listings = await Product.find({ seller: req.user._id })
            .sort({ createdAt: -1 }); // Most recent first
        
        res.json(listings);
    } catch (error) {
        console.error('Error fetching user listings:', error);
        res.status(500).json({ message: 'Error fetching listings', error: error.message });
    }
});

// Get seller profile with their active listings
router.get('/seller/:id', async (req, res) => {
    try {
        // Find the seller
        const seller = await User.findById(req.params.id)
            .select('-password -email -phone -address');
        
        if (!seller) {
            return res.status(404).json({ message: 'Seller not found' });
        }
        
        // Find seller's active listings
        const listings = await Product.find({ 
            seller: req.params.id,
            status: 'active'
        })
        .sort({ createdAt: -1 });
        
        // Create response object with seller info and listings
        const sellerProfile = {
            ...seller.toObject(),
            listings
        };

        res.json(sellerProfile);
    } catch (error) {
        console.error('Error fetching seller profile:', error);
        res.status(500).json({ message: 'Error fetching seller profile', error: error.message });
    }
});

// Get user's wishlist
router.get('/wishlist', auth, async (req, res) => {
    try {
        // Find the user and populate the wishlist
        const user = await User.findById(req.user._id)
            .populate('wishlist');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user.wishlist || []);
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({ message: 'Error fetching wishlist', error: error.message });
    }
});

// Add product to wishlist
router.post('/wishlist/:productId', auth, async (req, res) => {
    try {
        const productId = req.params.productId;
        
        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        // Find the user
        const user = await User.findById(req.user._id);
        
        // Check if product is already in wishlist
        if (user.wishlist && user.wishlist.includes(productId)) {
            return res.status(400).json({ message: 'Product already in wishlist' });
        }
        
        // Add to wishlist
        if (!user.wishlist) {
            user.wishlist = [];
        }
        user.wishlist.push(productId);
        await user.save();
        
        res.status(201).json({ message: 'Product added to wishlist', wishlist: user.wishlist });
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        res.status(500).json({ message: 'Error adding to wishlist', error: error.message });
    }
});

// Remove product from wishlist
router.delete('/wishlist/:productId', auth, async (req, res) => {
    try {
        const productId = req.params.productId;
        
        // Find the user
        const user = await User.findById(req.user._id);
        
        // Check if wishlist exists and product is in wishlist
        if (!user.wishlist || !user.wishlist.includes(productId)) {
            return res.status(400).json({ message: 'Product not in wishlist' });
        }
        
        // Remove from wishlist
        user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
        await user.save();
        
        res.json({ message: 'Product removed from wishlist', wishlist: user.wishlist });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        res.status(500).json({ message: 'Error removing from wishlist', error: error.message });
    }
});

// Become a seller
router.post('/become-seller', auth, async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        
        const userId = req.user._id;
        
        // Get the current user
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // If already a seller, return success
        if (user.role === 'seller') {
            return res.json({ 
                message: 'You are already registered as a seller',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    becameSellerAt: user.becameSellerAt
                }
            });
        }
        
        // Update user role to seller and set becameSellerAt
        user.role = 'seller';
        if (!user.becameSellerAt) user.becameSellerAt = new Date();
        await user.save();
        
        res.json({ 
            message: 'Successfully registered as a seller',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                becameSellerAt: user.becameSellerAt
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error becoming a seller', error: error.message });
    }
});

module.exports = router; 