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
    deleteOrder,
    bulkDeleteOrders,
    getOrderInvoice
} = require('../controllers/order.controller');

// All routes require authentication
router.use(authenticateUser);

// Public routes (for authenticated users)
router.post('/', createOrder);
router.get('/my-orders', getOrders);
router.get('/:id', getOrderById);
router.post('/:id/cancel', cancelOrder);
router.get('/:id/invoice', getOrderInvoice);

// Admin only routes
router.get('/', authorizeRole('admin'), getOrders);
router.put('/:id/status', authorizeRole('admin'), updateOrderStatus);
router.delete('/:id', authorizeRole('admin'), deleteOrder);
router.post('/bulk-delete', authorizeRole('admin'), bulkDeleteOrders);

module.exports = router;
