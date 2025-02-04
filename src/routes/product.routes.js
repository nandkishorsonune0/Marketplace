const express = require('express');
const router = express.Router();
const { authenticateUser, authorizeRole } = require('../middleware/auth.middleware');
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductsByCategory
} = require('../controllers/product.controller');

// Public routes - no authentication required
router.get('/', getProducts);
router.get('/:id', getProductById);
router.get('/category/:categoryId', getProductsByCategory);

// Protected routes - require authentication
router.use(authenticateUser);

// Seller and Admin routes
router.post('/', authorizeRole(['seller', 'admin']), createProduct);
router.put('/:id', authorizeRole(['seller', 'admin']), updateProduct);
router.delete('/:id', authorizeRole(['seller', 'admin']), deleteProduct);

module.exports = router;
