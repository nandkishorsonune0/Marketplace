const express = require('express');
const router = express.Router();
const { authenticateUser, authorizeRole } = require('../middleware/auth.middleware');
const {
    getSalesTrends,
    getCategoryPerformance,
    getCustomerMetrics,
    getProductPerformance
} = require('../controllers/analytics.controller');

// All analytics routes require authentication and admin/seller role
router.use(authenticateUser);
router.use(authorizeRole(['admin', 'seller']));

// Analytics routes
router.get('/sales', getSalesTrends);
router.get('/categories', getCategoryPerformance);
router.get('/customers', getCustomerMetrics);
router.get('/products', getProductPerformance);

module.exports = router; 