const { ApiError } = require("../utils/ApiError");

const errorHandler = (err, req, res, next) => {
    let error = err;

    // If the error is not an instance of ApiError, convert it
    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || error instanceof mongoose.Error ? 400 : 500;
        const message = error.message || "Something went wrong";
        error = new ApiError(statusCode, message, error?.errors || []);
    }

    // Send the error response
    const response = {
        success: false,
        message: error.message,
        errors: error.errors,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    };

    return res.status(error.statusCode).json(response);
};

module.exports = errorHandler;
