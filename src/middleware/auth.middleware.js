const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { ApiError } = require('../utils/ApiError');
const asyncHandler = require('./async.middleware');

exports.authenticateUser = asyncHandler(async (req, res, next) => {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        throw new ApiError(401, 'Not authorized to access this route');
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from token
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            throw new ApiError(401, 'User not found');
        }

        if (!user.isActive) {
            throw new ApiError(401, 'User account is deactivated');
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth Error:', error);
        throw new ApiError(401, 'Not authorized to access this route');
    }
});

exports.authorizeRole = (roles) => {
    return (req, res, next) => {
        // Handle both single role string and array of roles
        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        
        if (!allowedRoles.includes(req.user.role)) {
            console.error('Authorization Error:', {
                userRole: req.user.role,
                allowedRoles,
                userId: req.user._id
            });
            throw new ApiError(403, `User role ${req.user.role} is not authorized to access this route`);
        }
        next();
    };
};
