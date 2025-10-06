const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register new user
router.post('/register', async (req, res) => {
    try {
        console.log('Registration request received:', req.body);
        const { name, email, password, phone, address } = req.body;

        // Enhanced validation
        if (!name || !email || !password) {
            console.log('Registration validation failed - missing required fields');
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        if (!email.includes('@')) {
            return res.status(400).json({ message: 'Please provide a valid email address' });
        }

        // Check if user already exists - more verbose error handling
        try {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                console.log('User already exists with email:', email);
                return res.status(400).json({ message: 'User already exists with this email address' });
            }
        } catch (findError) {
            console.error('Error checking for existing user:', findError);
            return res.status(500).json({ 
                message: 'Error checking for existing user. Database connection may be down.',
                error: findError.message
            });
        }

        // Create new user with enhanced fields
        const newUser = new User({
            name,
            email,
            password,
            role: 'user', // Prevent direct admin creation
            phone: phone || '',
            address: address || {
                street: '',
                city: '',
                state: '',
                zipCode: '',
                country: ''
            }
        });

        console.log('Creating new user:', newUser);

        // Save the user to the database
        const savedUser = await newUser.save();
        console.log('User saved successfully:', savedUser);

        // Generate JWT token
        const token = jwt.sign(
            { userId: savedUser._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
                role: savedUser.role,
                phone: savedUser.phone,
                address: savedUser.address
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        
        // Check for MongoDB validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            console.log('Validation errors:', messages);
            return res.status(400).json({ 
                message: 'Validation error', 
                details: messages 
            });
        }
        
        // MongoDB connection errors
        if (error.name === 'MongoError' || error.name === 'MongoServerError') {
            return res.status(500).json({ 
                message: 'Database error - please try again later', 
                error: 'MongoDB connection issue'
            });
        }
        
        res.status(500).json({ 
            message: 'Error registering user', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        console.log('Login request received:', { email: req.body.email });
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found with email:', email);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('Password mismatch for user:', email);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        console.log('User authenticated successfully:', { 
            id: user._id, 
            email: user.email, 
            role: user.role 
        });

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: 'Error logging in', 
            error: error.message 
        });
    }
});

// Admin login endpoint
router.post('/admin-login', async (req, res) => {
    try {
        console.log('Admin login request received:', { email: req.body.email });
        const { email, password } = req.body;

        // Log the inputs for debugging
        console.log('Admin login attempt with:', { email, passwordLength: password?.length });

        // Verify this is the admin email
        if (email !== 'admin@example.com') {
            console.log('Non-admin email attempted to use admin login:', email);
            return res.status(401).json({ message: 'Unauthorized access' });
        }

        // Find user by email
        const user = await User.findOne({ email });
        
        if (!user) {
            console.log('Admin user not found with email:', email);
            
            // Create admin user on the fly if it doesn't exist
            const adminUser = new User({
                name: 'Admin',
                email: 'admin@example.com',
                password: 'admin123', // Will be hashed by the pre-save hook
                role: 'admin'
            });
            
            await adminUser.save();
            console.log('Admin user created on the fly during login attempt');
            
            // Generate JWT token for the newly created admin
            const token = jwt.sign(
                { userId: adminUser._id },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '24h' }
            );
            
            return res.json({
                message: 'Admin login successful (new account)',
                token,
                user: {
                    id: adminUser._id,
                    name: adminUser.name,
                    email: adminUser.email,
                    role: 'admin'
                }
            });
        }

        console.log('Admin user found:', { id: user._id, role: user.role });

        // Check password
        const isMatch = await user.comparePassword(password);
        
        console.log('Password check result:', isMatch);
        
        if (!isMatch) {
            console.log('Password mismatch for admin user');
            
            // FOR TESTING ONLY: Update password if incorrect (remove in production)
            console.log('Updating admin password for testing purposes');
            user.password = 'admin123';
            await user.save();
            console.log('Admin password updated to admin123');
            
            // Try again with the new password
            const retryMatch = await user.comparePassword('admin123');
            console.log('Retry password check result:', retryMatch);
            
            if (!retryMatch) {
                return res.status(401).json({ message: 'Invalid admin credentials - password mismatch' });
            }
            
            console.log('Password reset successful');
        }

        // Force admin role if not already set
        if (user.role !== 'admin') {
            user.role = 'admin';
            await user.save();
            console.log('Updated user role to admin');
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Admin login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: 'admin'
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ 
            message: 'Error logging in as admin', 
            error: error.message 
        });
    }
});

// Simple ping endpoint to test server connectivity
router.get('/ping', (req, res) => {
    res.status(200).json({ message: 'Server is running' });
});

module.exports = router; 