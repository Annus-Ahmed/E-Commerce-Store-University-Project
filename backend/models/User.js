const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Invalid email address');
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        trim: true
    },
    role: {
        type: String,
        enum: {
            values: ['user', 'admin', 'seller', 'buyer'],
            message: 'Role must be either user, admin, seller, or buyer'
        },
        default: 'user'
    },
    phone: {
        type: String,
        trim: true
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    profileImage: {
        type: String,
        default: null
    },
    bio: {
        type: String,
        maxlength: 500
    },
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    joinedDate: {
        type: Date,
        default: Date.now
    },
    lastActive: {
        type: Date,
        default: Date.now
    },
    ratings: {
        average: {
            type: Number,
            default: 0
        },
        count: {
            type: Number,
            default: 0
        }
    },
    socialMedia: {
        facebook: String,
        twitter: String,
        instagram: String
    },
    becameSellerAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for listings
userSchema.virtual('listings', {
    ref: 'Product',
    localField: '_id',
    foreignField: 'seller'
});

// Virtual for sold items
userSchema.virtual('soldItems', {
    ref: 'Product',
    localField: '_id',
    foreignField: 'seller',
    match: { status: 'sold' }
});

// Virtual for active listings
userSchema.virtual('activeListings', {
    ref: 'Product',
    localField: '_id',
    foreignField: 'seller',
    match: { status: 'active' }
});

userSchema.virtual('profileImageUrl').get(function() {
    if (this.profileImage) {
        return this.profileImage;
    }
    return null; // Return null if no profile image is set
});

// Method to get a sanitized public user profile
userSchema.methods.getPublicProfile = function() {
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
};

// Hash password before saving
userSchema.pre('save', async function(next) {
    const user = this;
    
    // Set default profile image if none
    if (!user.profileImage) {
        user.profileImage = null;
    }
    
    // Hash password if modified
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    
    next();
});

// Method to compare password for login
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User; 