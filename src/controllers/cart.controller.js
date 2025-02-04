const Cart = require('../models/cart.model');
const Product = require('../models/product.model');

// Add item to cart
exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user.id;

        // Find existing cart or create new one
        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if item already exists in cart
        const cartItemIndex = cart.items.findIndex(item => 
            item.product.toString() === productId
        );

        if (cartItemIndex > -1) {
            // Update quantity if item exists
            cart.items[cartItemIndex].quantity += quantity;
        } else {
            // Add new item if it doesn't exist
            cart.items.push({
                product: productId,
                quantity: quantity,
                price: product.price
            });
        }

        await cart.save();
        await cart.populate('items.product');
        
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get cart
exports.getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id })
            .populate('items.product');
        
        if (!cart) {
            return res.status(200).json({ items: [] });
        }
        
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update cart item
exports.updateCartItem = async (req, res) => {
    try {
        const { quantity } = req.body;
        const { itemId } = req.params;
        
        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const cartItem = cart.items.id(itemId);
        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        cartItem.quantity = quantity;
        await cart.save();
        await cart.populate('items.product');

        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
    try {
        const { itemId } = req.params;
        
        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = cart.items.filter(item => item._id.toString() !== itemId);
        await cart.save();
        await cart.populate('items.product');

        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Clear cart
exports.clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = [];
        await cart.save();

        res.status(200).json({ message: 'Cart cleared successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
