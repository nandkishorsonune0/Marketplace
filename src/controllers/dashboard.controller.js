const Order = require('../models/order.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');
const Category = require('../models/category.model');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');
const asyncHandler = require('../middleware/asyncHandler');

// Get dashboard statistics
const getDashboardStats = asyncHandler(async (req, res) => {
    console.log('Fetching dashboard stats for user:', req.user._id, 'with role:', req.user.role);
    
    const stats = {
        totalOrders: 0,
        totalProducts: 0,
        totalUsers: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        pendingOrders: 0,
        lowStockProducts: 0,
        totalCategories: 0,
        monthlyGrowth: 0,
        conversionRate: 0,
        activeUsers: 0,
        customerSatisfaction: 0,
        orderStatusCounts: {
            pending: 0,
            processing: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0
        }
    };

    try {
        let query = {};
        
        // If user is a seller, only show their products and orders
        if (req.user.role === 'seller') {
            query = { seller: req.user._id };
        }

        // Get total orders, revenue, products, and users
        const [totalOrders, totalProducts, totalUsers, totalCategories, lowStockProducts] = await Promise.all([
            Order.countDocuments(query),
            Product.countDocuments(query),
            req.user.role === 'admin' ? User.countDocuments() : 0,
            Category.countDocuments(),
            Product.countDocuments({ ...query, stock: { $lt: 10 } })
        ]);

        stats.totalOrders = totalOrders;
        stats.totalProducts = totalProducts;
        stats.totalUsers = totalUsers;
        stats.totalCategories = totalCategories;
        stats.lowStockProducts = lowStockProducts;

        // Calculate total revenue and average order value from completed orders
        const revenueData = await Order.aggregate([
            { 
                $match: { 
                    ...query, 
                    status: 'delivered',
                    createdAt: { 
                        $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) 
                    }
                } 
            },
            { 
                $group: { 
                    _id: null, 
                    totalRevenue: { $sum: '$totalAmount' },
                    avgOrderValue: { $avg: '$totalAmount' },
                    count: { $sum: 1 }
                } 
            }
        ]);

        if (revenueData.length > 0) {
            stats.totalRevenue = revenueData[0].totalRevenue;
            stats.averageOrderValue = revenueData[0].avgOrderValue;
            
            // Calculate monthly growth
            const previousMonthRevenue = await Order.aggregate([
                { 
                    $match: { 
                        ...query, 
                        status: 'delivered',
                        createdAt: { 
                            $gte: new Date(new Date().setMonth(new Date().getMonth() - 2)),
                            $lt: new Date(new Date().setMonth(new Date().getMonth() - 1))
                        }
                    } 
                },
                { 
                    $group: { 
                        _id: null, 
                        total: { $sum: '$totalAmount' }
                    } 
                }
            ]);

            if (previousMonthRevenue.length > 0) {
                const growth = ((revenueData[0].totalRevenue - previousMonthRevenue[0].total) / previousMonthRevenue[0].total) * 100;
                stats.monthlyGrowth = Math.round(growth * 100) / 100;
            }
        }

        // Get order status counts
        const orderStatusCounts = await Order.aggregate([
            { $match: query },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        orderStatusCounts.forEach(({ _id, count }) => {
            if (_id in stats.orderStatusCounts) {
                stats.orderStatusCounts[_id] = count;
            }
        });

        stats.pendingOrders = stats.orderStatusCounts.pending;

        // Calculate conversion rate (orders / user visits)
        const totalVisits = await User.aggregate([
            { $match: { lastVisit: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) } } },
            { $group: { _id: null, count: { $sum: 1 } } }
        ]);

        if (totalVisits.length > 0 && totalVisits[0].count > 0) {
            stats.conversionRate = Math.round((revenueData[0]?.count || 0) / totalVisits[0].count * 100 * 100) / 100;
        }

        // Get active users (users who visited in last 7 days)
        const activeUsers = await User.countDocuments({
            lastVisit: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) }
        });
        stats.activeUsers = activeUsers;

        // Calculate customer satisfaction (based on order ratings)
        const ratings = await Order.aggregate([
            { $match: { ...query, rating: { $exists: true } } },
            { $group: { _id: null, avgRating: { $avg: '$rating' } } }
        ]);

        if (ratings.length > 0) {
            stats.customerSatisfaction = Math.round(ratings[0].avgRating * 20 * 100) / 100; // Convert 5-star to percentage
        }

        res.json(new ApiResponse(200, stats));
    } catch (error) {
        console.error('Error in getDashboardStats:', error);
        throw new ApiError(500, 'Error fetching dashboard statistics');
    }
});

// Get revenue trends
const getRevenueTrends = asyncHandler(async (req, res) => {
    console.log('Fetching revenue trends for user:', req.user._id, 'with role:', req.user.role);
    
    try {
        const { period = 'monthly' } = req.query;
        let dateFormat;
        let groupBy;

        switch (period) {
            case 'daily':
                dateFormat = '%Y-%m-%d';
                groupBy = {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: { $dayOfMonth: '$createdAt' }
                };
                break;
            case 'weekly':
                dateFormat = '%Y-W%V';
                groupBy = {
                    year: { $year: '$createdAt' },
                    week: { $week: '$createdAt' }
                };
                break;
            case 'monthly':
            default:
                dateFormat = '%Y-%m';
                groupBy = {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                };
        }

        let query = { status: 'delivered' };
        
        // If user is a seller, only show their revenue
        if (req.user.role === 'seller') {
            query.seller = req.user._id;
        }

        const trends = await Order.aggregate([
            {
                $match: {
                    ...query,
                    createdAt: {
                        $gte: new Date(new Date().setMonth(new Date().getMonth() - 12))
                    }
                }
            },
            {
                $group: {
                    _id: groupBy,
                    revenue: { $sum: '$totalAmount' }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: {
                        $dateToString: {
                            format: dateFormat,
                            date: {
                                $dateFromParts: {
                                    year: '$_id.year',
                                    month: { $ifNull: ['$_id.month', 1] },
                                    day: { $ifNull: ['$_id.day', 1] }
                                }
                            }
                        }
                    },
                    revenue: 1
                }
            },
            { $sort: { date: 1 } }
        ]);

        const response = {
            period,
            labels: trends.map(t => t.date),
            values: trends.map(t => t.revenue)
        };

        res.json(new ApiResponse(200, response));
    } catch (error) {
        console.error('Error in getRevenueTrends:', error);
        throw new ApiError(500, 'Error fetching revenue trends');
    }
});

// Get category distribution
const getCategoryDistribution = asyncHandler(async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'seller') {
            query.seller = req.user._id;
        }

        const distribution = await Product.aggregate([
            { $match: query },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $lookup: {
                from: 'categories',
                localField: '_id',
                foreignField: '_id',
                as: 'category'
            }},
            { $unwind: '$category' },
            { $project: {
                _id: 0,
                name: '$category.name',
                count: 1
            }},
            { $sort: { count: -1 } }
        ]);

        res.json(new ApiResponse(200, {
            labels: distribution.map(d => d.name),
            values: distribution.map(d => d.count)
        }));
    } catch (error) {
        console.error('Error in getCategoryDistribution:', error);
        throw new ApiError(500, 'Error fetching category distribution');
    }
});

// Get order status distribution
const getOrderStatusDistribution = asyncHandler(async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'seller') {
            query.seller = req.user._id;
        }

        const distribution = await Order.aggregate([
            { $match: query },
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $project: {
                _id: 0,
                status: '$_id',
                count: 1
            }},
            { $sort: { count: -1 } }
        ]);

        res.json(new ApiResponse(200, {
            labels: distribution.map(d => d.status),
            values: distribution.map(d => d.count)
        }));
    } catch (error) {
        console.error('Error in getOrderStatusDistribution:', error);
        throw new ApiError(500, 'Error fetching order status distribution');
    }
});

// Get top products
const getTopProducts = asyncHandler(async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'seller') {
            query.seller = req.user._id;
        }

        const topProducts = await Product.aggregate([
            { $match: query },
            { $lookup: {
                from: 'orders',
                localField: '_id',
                foreignField: 'items.product',
                as: 'orders'
            }},
            { $project: {
                _id: 1,
                name: 1,
                price: 1,
                image: 1,
                sales: { $size: '$orders' }
            }},
            { $sort: { sales: -1 } },
            { $limit: 5 }
        ]);

        res.json(new ApiResponse(200, topProducts));
    } catch (error) {
        console.error('Error in getTopProducts:', error);
        throw new ApiError(500, 'Error fetching top products');
    }
});

// Get recent orders
const getRecentOrders = asyncHandler(async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'seller') {
            query.seller = req.user._id;
        }

        const recentOrders = await Order.aggregate([
            { $match: query },
            { $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user'
            }},
            { $unwind: '$user' },
            { $project: {
                _id: 1,
                orderNumber: 1,
                status: 1,
                total: '$totalAmount',
                customer: '$user.name',
                createdAt: 1
            }},
            { $sort: { createdAt: -1 } },
            { $limit: 5 }
        ]);

        res.json(new ApiResponse(200, recentOrders));
    } catch (error) {
        console.error('Error in getRecentOrders:', error);
        throw new ApiError(500, 'Error fetching recent orders');
    }
});

// Get customer activity
const getCustomerActivity = asyncHandler(async (req, res) => {
    try {
        const days = 7;
        const activity = [];
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        for (let i = days - 1; i >= 0; i--) {
            const start = new Date(today);
            start.setDate(today.getDate() - i);
            start.setHours(0, 0, 0, 0);

            const end = new Date(start);
            end.setHours(23, 59, 59, 999);

            const count = await User.countDocuments({
                lastVisit: {
                    $gte: start,
                    $lte: end
                }
            });

            activity.push({
                date: start.toISOString().split('T')[0],
                count
            });
        }

        res.json(new ApiResponse(200, {
            labels: activity.map(a => a.date),
            values: activity.map(a => a.count)
        }));
    } catch (error) {
        console.error('Error in getCustomerActivity:', error);
        throw new ApiError(500, 'Error fetching customer activity');
    }
});

module.exports = {
    getDashboardStats,
    getRevenueTrends,
    getCategoryDistribution,
    getOrderStatusDistribution,
    getTopProducts,
    getRecentOrders,
    getCustomerActivity
};
