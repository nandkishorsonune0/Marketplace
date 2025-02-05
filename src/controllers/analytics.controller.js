const Order = require('../models/order.model');
const Product = require('../models/product.model');
const Category = require('../models/category.model');
const User = require('../models/user.model');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');
const asyncHandler = require('../middleware/asyncHandler');

// Get sales trends
const getSalesTrends = asyncHandler(async (req, res) => {
    try {
        const { timeRange = 'month' } = req.query;
        let startDate = new Date();
        let groupBy;

        // Set time range
        switch (timeRange) {
            case 'week':
                startDate.setDate(startDate.getDate() - 7);
                groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
                break;
            case 'month':
                startDate.setMonth(startDate.getMonth() - 1);
                groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
                break;
            case 'quarter':
                startDate.setMonth(startDate.getMonth() - 3);
                groupBy = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
                break;
            case 'year':
                startDate.setFullYear(startDate.getFullYear() - 1);
                groupBy = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
                break;
            default:
                throw new ApiError(400, 'Invalid time range');
        }

        const salesData = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    status: { $nin: ['cancelled', 'refunded'] }
                }
            },
            {
                $group: {
                    _id: groupBy,
                    revenue: { $sum: '$totalAmount' }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        const response = {
            labels: salesData.map(item => item._id),
            values: salesData.map(item => item.revenue)
        };

        res.status(200).json(new ApiResponse(200, response));
    } catch (error) {
        console.error('Error in getSalesTrends:', error);
        throw new ApiError(500, 'Error fetching sales trends');
    }
});

// Get category performance
const getCategoryPerformance = asyncHandler(async (req, res) => {
    try {
        const { timeRange = 'month' } = req.query;
        let startDate = new Date();

        // Set time range
        switch (timeRange) {
            case 'week':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            case 'quarter':
                startDate.setMonth(startDate.getMonth() - 3);
                break;
            case 'year':
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
            default:
                throw new ApiError(400, 'Invalid time range');
        }

        const categoryData = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    status: { $nin: ['cancelled', 'refunded'] }
                }
            },
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.product',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'product.category',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            { $unwind: '$category' },
            {
                $group: {
                    _id: '$category.name',
                    revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
                }
            },
            { $sort: { revenue: -1 } }
        ]);

        const response = {
            labels: categoryData.map(item => item._id),
            values: categoryData.map(item => item.revenue)
        };

        res.status(200).json(new ApiResponse(200, response));
    } catch (error) {
        console.error('Error in getCategoryPerformance:', error);
        throw new ApiError(500, 'Error fetching category performance');
    }
});

// Get customer metrics
const getCustomerMetrics = asyncHandler(async (req, res) => {
    try {
        const { timeRange = 'month' } = req.query;
        let startDate = new Date();
        let groupBy;

        // Set time range
        switch (timeRange) {
            case 'week':
                startDate.setDate(startDate.getDate() - 7);
                groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
                break;
            case 'month':
                startDate.setMonth(startDate.getMonth() - 1);
                groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
                break;
            case 'quarter':
                startDate.setMonth(startDate.getMonth() - 3);
                groupBy = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
                break;
            case 'year':
                startDate.setFullYear(startDate.getFullYear() - 1);
                groupBy = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
                break;
            default:
                throw new ApiError(400, 'Invalid time range');
        }

        const customerData = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    role: 'customer'
                }
            },
            {
                $group: {
                    _id: groupBy,
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        const response = {
            labels: customerData.map(item => item._id),
            values: customerData.map(item => item.count)
        };

        res.status(200).json(new ApiResponse(200, response));
    } catch (error) {
        console.error('Error in getCustomerMetrics:', error);
        throw new ApiError(500, 'Error fetching customer metrics');
    }
});

// Get product performance
const getProductPerformance = asyncHandler(async (req, res) => {
    try {
        const { timeRange = 'month' } = req.query;
        let startDate = new Date();

        // Set time range
        switch (timeRange) {
            case 'week':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            case 'quarter':
                startDate.setMonth(startDate.getMonth() - 3);
                break;
            case 'year':
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
            default:
                throw new ApiError(400, 'Invalid time range');
        }

        const productData = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    status: { $nin: ['cancelled', 'refunded'] }
                }
            },
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.product',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            {
                $group: {
                    _id: '$product.name',
                    sales: { $sum: '$items.quantity' },
                    revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: 10 }
        ]);

        const response = {
            labels: productData.map(item => item._id),
            values: productData.map(item => item.revenue)
        };

        res.status(200).json(new ApiResponse(200, response));
    } catch (error) {
        console.error('Error in getProductPerformance:', error);
        throw new ApiError(500, 'Error fetching product performance');
    }
});

module.exports = {
    getSalesTrends,
    getCategoryPerformance,
    getCustomerMetrics,
    getProductPerformance
}; 