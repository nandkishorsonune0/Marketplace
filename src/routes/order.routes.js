const express = require('express');
const router = express.Router();
const { 
    authenticateUser, 
    authorizeRole 
} = require('../middleware/auth.middleware');
const {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    getMyOrders
} = require('../controllers/order.controller');

// All routes require authentication
router.post('/', authenticateUser, createOrder);
router.get('/my-orders', authenticateUser, getMyOrders);
router.get('/:id', authenticateUser, getOrderById);

// Admin only routes
router.get('/', authenticateUser, authorizeRole('admin'), getOrders);
router.put('/:id/status', authenticateUser, authorizeRole('admin'), updateOrderStatus);
router.put('/:id/cancel', authenticateUser, authorizeRole('admin'), cancelOrder);

module.exports = router;
