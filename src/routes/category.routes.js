const express = require('express');
const router = express.Router();
const { authenticateUser, authorizeRole } = require('../middleware/auth.middleware');
const {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/category.controller');

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Protected routes (require authentication and admin role)
router.post('/', authenticateUser, authorizeRole('admin'), createCategory);
router.put('/:id', authenticateUser, authorizeRole('admin'), updateCategory);
router.delete('/:id', authenticateUser, authorizeRole('admin'), deleteCategory);

module.exports = router;
