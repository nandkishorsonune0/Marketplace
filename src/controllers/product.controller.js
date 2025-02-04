const Product = require('../models/product.model');
const Category = require('../models/category.model');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');
const asyncHandler = require('../middleware/asyncHandler');

// Get all products with pagination and filters
exports.getProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const category = req.query.category;
        const minPrice = req.query.minPrice;
        const maxPrice = req.query.maxPrice;
        const inStock = req.query.inStock;

        const query = {};

        // Search filter
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Category filter
        if (category) {
            query.category = category;
        }

        // Price filter
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }

        // Stock filter
        if (inStock === 'true') {
            query.stock = { $gt: 0 };
        } else if (inStock === 'false') {
            query.stock = 0;
        }

        const skip = (page - 1) * limit;

        const [products, total] = await Promise.all([
            Product.find(query)
                .populate('category')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            Product.countDocuments(query)
        ]);

        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        res.json({
            products,
            pagination: {
                total,
                page,
                limit,
                totalPages,
                hasNextPage,
                hasPrevPage
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get product by ID
exports.getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)
        .populate('category', 'name')
        .populate('seller', 'name email')
        .lean();

    if (!product) {
        throw new ApiError(404, 'Product not found');
    }

    res.status(200).json(new ApiResponse(200, product));
});

// Create product
exports.createProduct = asyncHandler(async (req, res) => {
    const { name, description, price, category, stock, seller } = req.body;

    // Validate category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
        throw new ApiError(404, 'Category not found');
    }

    // Create product
    const product = await Product.create({
        name,
        description,
        price,
        category,
        stock,
        seller: seller || req.user._id // Use provided seller or current user
    });

    // Populate category and seller information
    await product.populate([
        { path: 'category', select: 'name' },
        { path: 'seller', select: 'name email' }
    ]);

    res.status(201).json(
        new ApiResponse(201, product, 'Product created successfully')
    );
});

// Update product
exports.updateProduct = asyncHandler(async (req, res) => {
    const { name, description, price, category, stock } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
        throw new ApiError(404, 'Product not found');
    }

    // Check if user is authorized
    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        throw new ApiError(403, 'Not authorized to update this product');
    }

    // Check if category exists if it's being updated
    if (category) {
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            throw new ApiError(400, 'Invalid category');
        }
    }

    // Update product
    Object.assign(product, {
        name: name || product.name,
        description: description || product.description,
        price: price || product.price,
        category: category || product.category,
        stock: stock !== undefined ? stock : product.stock,
        imageUrl: imageUrl || product.imageUrl
    });

    await product.save();

    const updatedProduct = await Product.findById(product._id)
        .populate('category', 'name')
        .populate('seller', 'name email')
        .lean();

    res.status(200).json(new ApiResponse(200, updatedProduct));
});

// Delete product
exports.deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        throw new ApiError(404, 'Product not found');
    }

    // Check if user is authorized
    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        throw new ApiError(403, 'Not authorized to delete this product');
    }

    await product.remove();

    res.status(200).json(new ApiResponse(200, null, 'Product deleted successfully'));
});

// Get products by category
exports.getProductsByCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
        Product.find({ category: categoryId })
            .populate('category', 'name')
            .populate('seller', 'name email')
            .skip(skip)
            .limit(limit)
            .lean(),
        Product.countDocuments({ category: categoryId })
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json(new ApiResponse(200, {
        products,
        pagination: {
            total,
            page,
            limit,
            totalPages,
            hasNextPage,
            hasPrevPage
        }
    }));
});
