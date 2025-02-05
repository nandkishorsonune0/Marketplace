const express = require('express');
const router = express.Router();
const { authenticateUser, authorizeRole } = require('../middleware/auth.middleware');
const {
    getDashboardStats,
    getRecentOrders,
    getRevenueTrends,
    getCategoryDistribution,
    getOrderStatusDistribution,
    getTopProducts,
    getCustomerActivity
} = require('../controllers/dashboard.controller');

// All dashboard routes require authentication and admin/seller role
router.use(authenticateUser);
router.use(authorizeRole(['admin', 'seller']));

// Dashboard routes
router.get('/stats', getDashboardStats);
router.get('/recent-orders', getRecentOrders);
router.get('/revenue-trends', getRevenueTrends);
router.get('/category-distribution', getCategoryDistribution);
router.get('/order-status', getOrderStatusDistribution);
router.get('/top-products', getTopProducts);
router.get('/customer-activity', getCustomerActivity);

module.exports = router;
