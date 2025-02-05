const User = require('../models/user.model');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');
const asyncHandler = require('../middleware/asyncHandler');

// Get all users with filtering and pagination
const getUsers = asyncHandler(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const { search, status, sortBy = 'createdAt' } = req.query;

        // Build query
        let query = { role: 'customer' }; // Only get customers

        // Add search filter
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Add status filter
        if (status) {
            query.status = status;
        }

        // Build sort object
        let sort = {};
        switch (sortBy) {
            case 'name':
                sort.name = 1;
                break;
            case 'orderCount':
                sort.orderCount = -1;
                break;
            case 'totalSpent':
                sort.totalSpent = -1;
                break;
            default:
                sort.createdAt = -1;
        }

        // Execute query with pagination
        const skip = (page - 1) * limit;
        
        // Get users with order stats
        const aggregationPipeline = [
            { $match: query },
            {
                $lookup: {
                    from: 'orders',
                    localField: '_id',
                    foreignField: 'user',
                    as: 'orders'
                }
            },
            {
                $addFields: {
                    orderCount: { $size: '$orders' },
                    totalSpent: {
                        $reduce: {
                            input: '$orders',
                            initialValue: 0,
                            in: { $add: ['$$value', '$$this.totalAmount'] }
                        }
                    }
                }
            },
            {
                $project: {
                    password: 0,
                    orders: 0
                }
            }
        ];

        // Add sorting
        aggregationPipeline.push({ $sort: sort });

        // Get total count
        const totalUsers = await User.aggregate([
            ...aggregationPipeline,
            { $count: 'total' }
        ]);

        // Add pagination
        aggregationPipeline.push(
            { $skip: skip },
            { $limit: limit }
        );

        const users = await User.aggregate(aggregationPipeline);

        // Calculate pagination info
        const total = totalUsers.length > 0 ? totalUsers[0].total : 0;
        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        res.status(200).json(new ApiResponse(200, {
            users,
            pagination: {
                total,
                page,
                limit,
                totalPages,
                hasNextPage,
                hasPrevPage
            }
        }));
    } catch (error) {
        console.error('Error in getUsers:', error);
        throw new ApiError(500, 'Error fetching users');
    }
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
    getUsers,
    getUserById,
    updateUser,
    deleteUser
};
