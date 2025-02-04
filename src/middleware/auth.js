const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const AppError = require('../utils/appError');

/**
 * Middleware to authenticate user using JWT token
 */
exports.authenticateUser = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(new AppError('No token provided. Please log in.', 401));
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if user still exists
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return next(new AppError('User no longer exists.', 401));
        }

        // Add user to request object
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return next(new AppError('Invalid token. Please log in again.', 401));
        }
        if (error.name === 'TokenExpiredError') {
            return next(new AppError('Your token has expired. Please log in again.', 401));
        }
        next(error);
    }
};

/**
 * Middleware to authorize user roles
 * @param {...String} roles - Allowed roles
 */
exports.authorizeRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new AppError('User not authenticated.', 401));
        }

        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action.', 403));
        }

        next();
    };
};

/**
 * Middleware to check if user owns the resource or is admin
 * @param {String} modelName - Name of the model to check ownership
 * @param {String} paramId - Name of the parameter containing resource ID
 */
exports.checkOwnership = (modelName, paramId = 'id') => {
    return async (req, res, next) => {
        if (!req.user) {
            return next(new AppError('User not authenticated.', 401));
        }

        // Admin can access all resources
        if (req.user.role === 'admin') {
            return next();
        }

        const resourceId = req.params[paramId];
        const Model = require(`../models/${modelName}.model`);
        
        const resource = await Model.findById(resourceId);
        if (!resource) {
            return next(new AppError('Resource not found.', 404));
        }

        // Check if the resource belongs to the user
        if (resource.user && resource.user.toString() !== req.user._id.toString()) {
            return next(new AppError('You do not have permission to perform this action.', 403));
        }

        next();
    };
};
