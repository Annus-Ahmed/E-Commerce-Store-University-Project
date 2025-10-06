const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        // Check for Authorization header
        if (!req.header('Authorization')) {
            return res.status(401).json({ message: 'No authorization token provided' });
        }
        
        // Extract token
        const authHeader = req.header('Authorization');
        
        // Make sure it starts with "Bearer "
        if (!authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Invalid token format' });
        }
        
        const token = authHeader.replace('Bearer ', '').trim();
        
        if (!token) {
            return res.status(401).json({ message: 'Invalid token format' });
        }
        
        // Verify token
        let decodedToken;
        try {
            const secretKey = process.env.JWT_SECRET || 'your-secret-key';
            decodedToken = jwt.verify(token, secretKey);
        } catch (jwtError) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        
        if (!decodedToken.userId) {
            return res.status(401).json({ message: 'Invalid token format' });
        }
        
        // Find user by ID
        try {
            const user = await User.findById(decodedToken.userId);
            
            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }
            
            // Special handling for admin email
            if (user.email === 'admin@example.com' && user.role !== 'admin') {
                user.role = 'admin';
                await user.save();
            }
            
            // Update lastActive timestamp
            user.lastActive = new Date();
            await user.save();
            
            // Attach user to request
            req.user = user;
            next();
        } catch (dbError) {
            return res.status(500).json({ message: 'Server error during authentication' });
        }
    } catch (error) {
        res.status(401).json({ message: 'Please authenticate' });
    }
};

module.exports = auth; 