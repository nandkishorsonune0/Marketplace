const User = require('../models/user.model');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');
const asyncHandler = require('../middleware/asyncHandler');

// Get all users
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select('-password');
    res.json(new ApiResponse(200, { users }));
});

// Get user by ID
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
        throw new ApiError(404, 'User not found');
    }
    res.json(new ApiResponse(200, { user }));
});

// Update user
const updateUser = asyncHandler(async (req, res) => {
    const { name, email, role } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    // Check if email is being changed and is not already taken
    if (email && email !== user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new ApiError(400, 'Email already in use');
        }
        user.email = email;
    }

    // Update other fields
    if (name) user.name = name;
    if (role) user.role = role;

    await user.save();

    res.json(new ApiResponse(200, {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    }, 'User updated successfully'));
});

// Delete user
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    // Prevent deleting the last admin
    if (user.role === 'admin') {
        const adminCount = await User.countDocuments({ role: 'admin' });
        if (adminCount <= 1) {
            throw new ApiError(400, 'Cannot delete the last admin user');
        }
    }

    await user.deleteOne();
    res.json(new ApiResponse(200, null, 'User deleted successfully'));
});

module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
};
