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

// Get all orders (admin only)
const getOrders = asyncHandler(async (req, res) => {
    const {
        status,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = 1,
        limit = 10
    } = req.query;

    const query = {};
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const orders = await Order.find(query)
        .populate('user', 'name email')
        .populate('items.product', 'name price')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit));

    const total = await Order.countDocuments(query);

    res.json(
        new ApiResponse(200, {
            orders,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit))
            }
        })
    );
});

// Get order by ID
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'name email')
        .populate('items.product', 'name price');

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

// Update order status (admin only)
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
        throw new ApiError(404, 'Order not found');
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

    if (order.status !== 'pending') {
        throw new ApiError(400, 'Cannot cancel order that is not pending');
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
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
        throw new ApiError(404, 'Order not found');
    }

    res.status(204).json(new ApiResponse(204, null, 'Order deleted successfully'));
});

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    getMyOrders,
    deleteOrder
};
