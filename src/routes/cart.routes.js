const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth.middleware');

// Import cart controller (we'll create this next)
const { 
    addToCart,
    getCart,
    updateCartItem,
    removeFromCart,
    clearCart
} = require('../controllers/cart.controller');

// Cart routes
router.post('/add', authenticateUser, addToCart);
router.get('/', authenticateUser, getCart);
router.put('/update/:itemId', authenticateUser, updateCartItem);
router.delete('/remove/:itemId', authenticateUser, removeFromCart);
router.delete('/clear', authenticateUser, clearCart);

module.exports = router;
