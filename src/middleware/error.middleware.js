const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');

const errorHandler = (err, req, res, next) => {
    console.error('Error Handler:', {
        path: req.path,
        method: req.method,
        error: {
            name: err.name,
            message: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        }
    });

    let error = err instanceof ApiError ? err : new ApiError(500, err.message || 'Internal Server Error');

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        error = new ApiError(404, `Resource not found with id: ${err.value}`);
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        error = new ApiError(400, `${field} already exists: ${err.keyValue[field]}`);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        error = new ApiError(400, message.join(', '));
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error = new ApiError(401, 'Invalid token');
    }

    if (err.name === 'TokenExpiredError') {
        error = new ApiError(401, 'Token expired');
    }

    // Send error response
    res.status(error.statusCode).json({
        status: 'error',
        message: error.message,
        errors: error.errors,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

module.exports = errorHandler;
