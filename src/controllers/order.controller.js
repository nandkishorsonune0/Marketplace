const Order = require('../models/order.model');
const Product = require('../models/product.model');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');
const asyncHandler = require('../middleware/asyncHandler');

// Create a new order
const createOrder = asyncHandler(async (req, res) => {
    const { items, shippingAddress } = req.body;

    // Validate items and calculate total
    let total = 0;
    const orderItems = [];

    for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) {
            throw new ApiError(404, `Product not found: ${item.product}`);
        }

        if (product.stock < item.quantity) {
            throw new ApiError(400, `Insufficient stock for product: ${product.name}`);
        }

        orderItems.push({
            product: product._id,
            quantity: item.quantity,
            price: product.price
        });

        total += product.price * item.quantity;

        // Update product stock
        product.stock -= item.quantity;
        await product.save();
    }

    const order = await Order.create({
        user: req.user._id,
        items: orderItems,
        total,
        shippingAddress
    });

    res.status(201).json(
        new ApiResponse(201, order, 'Order created successfully')
    );
});

// Get all orders with filtering and pagination
const getOrders = asyncHandler(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const { search, status, dateRange, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

        // Build query
        let query = {};

        // Add seller filter for non-admin users
        if (req.user.role !== 'admin') {
            query.seller = req.user._id;
        }

        // Add search filter
        if (search) {
            query.$or = [
                { orderNumber: { $regex: search, $options: 'i' } },
                { 'customer.name': { $regex: search, $options: 'i' } },
                { 'customer.email': { $regex: search, $options: 'i' } }
            ];
        }

        // Add status filter
        if (status) {
            query.status = status;
        }

        // Add date range filter
        if (dateRange) {
            const now = new Date();
            let startDate;

            switch (dateRange) {
                case 'today':
                    startDate = new Date(now.setHours(0, 0, 0, 0));
                    break;
                case 'week':
                    startDate = new Date(now.setDate(now.getDate() - 7));
                    break;
                case 'month':
                    startDate = new Date(now.setMonth(now.getMonth() - 1));
                    break;
                case 'year':
                    startDate = new Date(now.setFullYear(now.getFullYear() - 1));
                    break;
                default:
                    startDate = null;
            }

            if (startDate) {
                query.createdAt = { $gte: startDate };
            }
        }

        // Build sort object
        const sort = {
            [sortBy]: sortOrder === 'desc' ? -1 : 1
        };

        // Execute query with pagination
        const skip = (page - 1) * limit;
        const [orders, total] = await Promise.all([
            Order.find(query)
                .populate('user', 'name email')
                .populate('items.product', 'name price')
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(),
            Order.countDocuments(query)
        ]);

        // Transform orders for response
        const transformedOrders = orders.map(order => ({
            _id: order._id,
            orderNumber: order.orderNumber,
            customer: order.user.name,
            email: order.user.email,
            total: order.totalAmount,
            status: order.status,
            items: order.items.length,
            createdAt: order.createdAt
        }));

        // Calculate pagination info
        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        res.status(200).json(new ApiResponse(200, {
            orders: transformedOrders,
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
        console.error('Error in getOrders:', error);
        throw new ApiError(500, 'Error fetching orders');
    }
});

// Get order by ID
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'name email')
        .populate('items.product', 'name price image');

    if (!order) {
        throw new ApiError(404, 'Order not found');
    }

    // Check if user is authorized to view this order
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        throw new ApiError(403, 'Not authorized to view this order');
    }

    res.json(new ApiResponse(200, order));
});

// Get my orders
const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id })
        .populate('items.product', 'name price')
        .sort('-createdAt');

    res.json(new ApiResponse(200, orders));
});

// Update order status
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
        throw new ApiError(404, 'Order not found');
    }

    // Validate status transition
    const validTransitions = {
        pending: ['processing', 'cancelled'],
        processing: ['shipped', 'cancelled'],
        shipped: ['delivered', 'returned'],
        delivered: ['returned'],
        cancelled: [],
        returned: []
    };

    if (!validTransitions[order.status].includes(status)) {
        throw new ApiError(400, `Invalid status transition from ${order.status} to ${status}`);
    }

    order.status = status;
    await order.save();

    res.json(new ApiResponse(200, order, 'Order status updated successfully'));
});

// Cancel order
const cancelOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        throw new ApiError(404, 'Order not found');
    }

    // Check if user is authorized to cancel this order
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        throw new ApiError(403, 'Not authorized to cancel this order');
    }

    if (order.status !== 'pending' && order.status !== 'processing') {
        throw new ApiError(400, 'Cannot cancel order in current status');
    }

    // Restore product stock
    for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
            product.stock += item.quantity;
            await product.save();
        }
    }

    order.status = 'cancelled';
    await order.save();

    res.json(new ApiResponse(200, order, 'Order cancelled successfully'));
});

// Delete order (admin only)
const deleteOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
        throw new ApiError(404, 'Order not found');
    }

    // Only admin can delete orders
    if (req.user.role !== 'admin') {
        throw new ApiError(403, 'Not authorized to delete orders');
    }

    await order.deleteOne();
    res.status(200).json(new ApiResponse(200, null, 'Order deleted successfully'));
});

// Bulk delete orders (admin only)
const bulkDeleteOrders = asyncHandler(async (req, res) => {
    const { orderIds } = req.body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
        throw new ApiError(400, 'No order IDs provided');
    }

    // Only admin can delete orders
    if (req.user.role !== 'admin') {
        throw new ApiError(403, 'Not authorized to delete orders');
    }

    const result = await Order.deleteMany({ _id: { $in: orderIds } });

    res.status(200).json(
        new ApiResponse(200, { deletedCount: result.deletedCount }, 'Orders deleted successfully')
    );
});

// Get order invoice
const getOrderInvoice = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'name email')
        .populate('items.product', 'name price');

    if (!order) {
        throw new ApiError(404, 'Order not found');
    }

    // Check if user is authorized to view this invoice
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        throw new ApiError(403, 'Not authorized to view this invoice');
    }

    // Generate invoice (implementation depends on your invoice generation library)
    // This is a placeholder - you'll need to implement actual invoice generation
    const invoice = {
        orderNumber: order.orderNumber,
        date: order.createdAt,
        customer: {
            name: order.user.name,
            email: order.user.email
        },
        items: order.items.map(item => ({
            name: item.product.name,
            quantity: item.quantity,
            price: item.price,
            total: item.quantity * item.price
        })),
        total: order.totalAmount
    };

    res.json(new ApiResponse(200, invoice));
});

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    getMyOrders,
    deleteOrder,
    bulkDeleteOrders,
    getOrderInvoice
};
