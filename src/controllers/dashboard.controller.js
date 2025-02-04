const Order = require('../models/order.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');
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
        const [totalOrders, totalProducts, totalUsers] = await Promise.all([
            Order.countDocuments(query),
            Product.countDocuments(query),
            req.user.role === 'admin' ? User.countDocuments() : 0
        ]);

        stats.totalOrders = totalOrders;
        stats.totalProducts = totalProducts;
        stats.totalUsers = totalUsers;

        console.log('Basic stats fetched:', { totalOrders, totalProducts, totalUsers });

        // Calculate total revenue from completed orders
        const revenueQuery = [
            { $match: { ...query, status: 'delivered' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ];

        const revenue = await Order.aggregate(revenueQuery);
        stats.totalRevenue = revenue.length > 0 ? revenue[0].total : 0;
        console.log('Revenue calculated:', stats.totalRevenue);

        // Get order status counts
        const orderStatusQuery = [
            { $match: query },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ];

        const orderStatusCounts = await Order.aggregate(orderStatusQuery);
        orderStatusCounts.forEach(({ _id, count }) => {
            if (_id in stats.orderStatusCounts) {
                stats.orderStatusCounts[_id] = count;
            }
        });

        console.log('Order status counts:', stats.orderStatusCounts);
        res.json(new ApiResponse(200, stats));
    } catch (error) {
        console.error('Error in getDashboardStats:', error);
        throw new ApiError(500, 'Error fetching dashboard statistics');
    }
});

// Get recent orders
const getRecentOrders = asyncHandler(async (req, res) => {
    console.log('Fetching recent orders for user:', req.user._id, 'with role:', req.user.role);
    
    try {
        let query = {};
        
        // If user is a seller, only show their orders
        if (req.user.role === 'seller') {
            query = { seller: req.user._id };
        }

        const recentOrders = await Order.find(query)
            .populate('user', 'name email')
            .populate('items.product', 'name price')
            .sort('-createdAt')
            .limit(10);

        const formattedOrders = recentOrders.map(order => ({
            _id: order._id,
            orderNumber: order.orderNumber,
            user: {
                name: order.user?.name || 'N/A',
                email: order.user?.email || 'N/A'
            },
            totalAmount: order.totalAmount,
            status: order.status,
            items: order.items.map(item => ({
                product: {
                    name: item.product?.name || 'Product Removed',
                    price: item.price
                },
                quantity: item.quantity
            })),
            createdAt: order.createdAt
        }));

        console.log(`Found ${formattedOrders.length} recent orders`);
        res.json(new ApiResponse(200, formattedOrders));
    } catch (error) {
        console.error('Error in getRecentOrders:', error);
        throw new ApiError(500, 'Error fetching recent orders');
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

        console.log(`Found ${trends.length} revenue data points for ${period} period`);
        res.json(new ApiResponse(200, response));
    } catch (error) {
        console.error('Error in getRevenueTrends:', error);
        throw new ApiError(500, 'Error fetching revenue trends');
    }
});

module.exports = {
    getDashboardStats,
    getRecentOrders,
    getRevenueTrends
};
