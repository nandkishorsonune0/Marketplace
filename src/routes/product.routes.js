const express = require('express');
const router = express.Router();
const { authenticateUser, authorizeRole } = require('../middleware/auth.middleware');
const upload = require('../middleware/multer.middleware');
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductsByCategory,
    uploadProductImage
} = require('../controllers/product.controller');

// Public routes - no authentication required
router.get('/', getProducts);
router.get('/:id', getProductById);
router.get('/category/:categoryId', getProductsByCategory);

// Protected routes - require authentication
router.use(authenticateUser);

// Seller and Admin routes
router.post('/', authorizeRole(['seller', 'admin']), upload.single('image'), createProduct);
router.put('/:id', authorizeRole(['seller', 'admin']), upload.single('image'), updateProduct);
router.delete('/:id', authorizeRole(['seller', 'admin']), deleteProduct);

// Image upload route
router.post('/upload-image', authorizeRole(['seller', 'admin']), upload.single('image'), uploadProductImage);

module.exports = router;
