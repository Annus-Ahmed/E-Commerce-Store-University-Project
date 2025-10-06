// Middleware to check if the user is a seller
const isSeller = (req, res, next) => {
    if (req.user && req.user.role === 'seller') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Seller role required.' });
    }
};

// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
    console.log('Checking admin access for user:', {
        id: req.user?._id,
        email: req.user?.email,
        role: req.user?.role
    });

    // Special handling for known admin email
    if (req.user && req.user.email === 'admin@example.com') {
        console.log('Admin email detected, granting access regardless of role');
        
        // Update role to admin if not already set
        if (req.user.role !== 'admin') {
            console.log('Updating role to admin for admin@example.com');
            // This won't persist unless we save the user, but it will work for this request
            req.user.role = 'admin';
        }
        
        return next();
    }
    
    if (req.user && req.user.role === 'admin') {
        console.log('Admin role confirmed, access granted');
        next();
    } else {
        console.log('Admin access denied. User does not have admin role:', req.user?.role);
        res.status(403).json({ message: 'Access denied. Admin role required.' });
    }
};

// Middleware to check if the user is an admin or seller
const isAdminOrSeller = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'seller')) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin or seller role required.' });
    }
};

module.exports = {
    isSeller,
    isAdmin,
    isAdminOrSeller
}; 