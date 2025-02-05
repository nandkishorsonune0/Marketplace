const Product = require('../models/product.model');
const Category = require('../models/category.model');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');
const asyncHandler = require('../middleware/asyncHandler');

// Get all products with pagination and filters
const getProducts = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'createdAt';
    const order = req.query.order || 'desc';
    const search = req.query.search || '';
    const category = req.query.category;
    const minPrice = req.query.minPrice;
    const maxPrice = req.query.maxPrice;

    // Build query
    const query = {};
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }
    if (category) {
        query.category = category;
    }
    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = parseFloat(minPrice);
        if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
        Product.find(query)
            .populate('category', 'name')
            .populate('seller', 'name email')
            .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Product.countDocuments(query)
    ]);

    // Calculate pagination info
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

// Get product by ID
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)
        .populate('category', 'name')
        .populate('seller', 'name email')
        .lean();

    if (!product) {
        throw new ApiError(404, 'Product not found');
    }

    res.status(200).json(new ApiResponse(200, product));
});

// Upload product image
const uploadProductImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, 'No image file provided');
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    res.status(200).json(new ApiResponse(200, {
        imageUrl
    }, 'Image uploaded successfully'));
});

// Create product
const createProduct = asyncHandler(async (req, res) => {
    try {
        const { name, description, price, category, stock, sku, brand, status = 'active' } = req.body;
        
        // Validate required fields
        if (!name || !description || !price || !category) {
            throw new ApiError(400, 'Missing required fields');
        }

        // Validate price is a number
        const numericPrice = Number(price);
        if (isNaN(numericPrice)) {
            throw new ApiError(400, 'Price must be a valid number');
        }

        // Validate category exists
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            throw new ApiError(400, 'Invalid category ID');
        }

        // Validate SKU uniqueness if provided
        if (sku) {
            const existingSku = await Product.findOne({ sku });
            if (existingSku) {
                throw new ApiError(400, 'SKU already exists');
            }
        }

        // Handle image upload
        let image = null;
        if (req.file) {
            image = `/uploads/${req.file.filename}`;
        } else if (req.body.imageUrl) {
            image = req.body.imageUrl;
        }

        // Create product
        const product = await Product.create({
            name,
            description,
            price: numericPrice,
            category,
            stock: stock || 0,
            image,
            seller: req.user._id,
            sku,
            brand,
            status
        });

        const populatedProduct = await Product.findById(product._id)
            .populate('category', 'name')
            .populate('seller', 'name email')
            .lean();

        res.status(201).json(new ApiResponse(201, populatedProduct, "Product created successfully"));
    } catch (error) {
        console.error('Product creation error:', error);
        throw error;
    }
});

// Update product
const updateProduct = asyncHandler(async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            throw new ApiError(404, 'Product not found');
        }

        // Check if user is authorized
        if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            throw new ApiError(403, 'Not authorized to update this product');
        }

        // Handle image update if new file is uploaded
        if (req.file) {
            req.body.image = `/uploads/${req.file.filename}`;
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        )
        .populate('category', 'name')
        .populate('seller', 'name email')
        .lean();

        res.status(200).json(new ApiResponse(200, updatedProduct, 'Product updated successfully'));
    } catch (error) {
        console.error('Product update error:', error);
        throw error;
    }
});

// Delete product
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        throw new ApiError(404, 'Product not found');
    }

    // Check if user is authorized
    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        throw new ApiError(403, 'Not authorized to delete this product');
    }

    await Product.deleteOne({ _id: req.params.id });

    res.status(200).json(new ApiResponse(200, null, 'Product deleted successfully'));
});

// Get products by category
const getProductsByCategory = asyncHandler(async (req, res) => {
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

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductsByCategory,
    uploadProductImage
};
