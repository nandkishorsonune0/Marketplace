const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');
const asyncHandler = require('../middleware/asyncHandler');

// Register new user
const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(400, 'User already exists');
    }

    // Create new user
    const user = new User({
        name,
        email,
        password,
        role: 'customer' // Default role is customer
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json(new ApiResponse(201, {
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    }, 'User registered successfully'));
});

// Login user
const login = asyncHandler(async (req, res) => {
    console.log('Login attempt:', { email: req.body.email });

    const { email, password } = req.body;

    if (!email || !password) {
        console.log('Missing credentials:', { email: !!email, password: !!password });
        return res.status(400).json({
            success: false,
            message: 'Please provide email and password'
        });
    }

    try {
        // Find user
        const user = await User.findOne({ email });
        console.log('User found:', { exists: !!user, email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password check:', { isMatch });

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        console.log('Login successful:', { userId: user._id, role: user.role });

        return res.status(200).json(new ApiResponse(200, {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        }, 'Login successful'));
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred during login'
        });
    }
});

// Get user profile
const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    res.json(new ApiResponse(200, { user }));
});

// Update user profile
const updateProfile = asyncHandler(async (req, res) => {
    const { name, email, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    if (email && email !== user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new ApiError(400, 'Email already in use');
        }
        user.email = email;
    }

    if (name) {
        user.name = name;
    }

    if (currentPassword && newPassword) {
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            throw new ApiError(401, 'Current password is incorrect');
        }
        user.password = newPassword;
    }

    await user.save();

    res.json(new ApiResponse(200, {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    }, 'Profile updated successfully'));
});

module.exports = {
    register,
    login,
    getProfile,
    updateProfile
};
