const Product = require('../models/product.model');
const Category = require('../models/category.model');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');
const asyncHandler = require('../middleware/asyncHandler');

// Get all products with pagination and filters
exports.getProducts = asyncHandler(async (req, res) => {
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
    try {
        console.log('Request body:', req.body); // Debug log
        const { name, description, price, category, stock } = req.body;

        // Validate fields
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

        // Create product
        const product = await Product.create({
            name,
            description,
            price: numericPrice,
            category,
            stock: stock || 0,
            seller: req.user._id
        });

        console.log('Product created:', product); // Debug log

        const populatedProduct = await Product.findById(product._id)
            .populate('category', 'name')
            .populate('seller', 'name email')
            .lean();

        res.status(201).json(new ApiResponse(201, populatedProduct, "Product created successfully"));
    } catch (error) {
        console.error('Product creation error:', error); // Debug log
        throw error;
    }
});

// Update product
exports.updateProduct = asyncHandler(async (req, res) => {
    try {
        console.log('Update request received:', {
            body: req.body,
            params: req.params,
            user: req.user._id
        });

        // Find and validate product
        const product = await Product.findById(req.params.id);
        if (!product) {
            throw new ApiError(404, 'Product not found');
        }

        // Check if user is authorized
        if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            throw new ApiError(403, 'Not authorized to update this product');
        }

        // Validate the update data
        const updates = {};
        if (req.body.name) updates.name = req.body.name;
        if (req.body.description) updates.description = req.body.description;
        if (req.body.price) {
            const price = Number(req.body.price);
            if (isNaN(price) || price < 0) {
                throw new ApiError(400, 'Invalid price value');
            }
            updates.price = price;
        }
        if (req.body.stock !== undefined) {
            const stock = Number(req.body.stock);
            if (isNaN(stock) || stock < 0) {
                throw new ApiError(400, 'Invalid stock value');
            }
            updates.stock = stock;
        }
        
        // Check if category exists if it's being updated
        if (req.body.category) {
            const categoryExists = await Category.findById(req.body.category);
            if (!categoryExists) {
                throw new ApiError(400, 'Invalid category');
            }
            updates.category = req.body.category;
        }

        // Update the product with the validated data
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { 
                new: true, 
                runValidators: true 
            }
        ).populate('category', 'name')
         .populate('seller', 'name email');

        console.log('Product updated successfully:', updatedProduct);
        res.status(200).json(new ApiResponse(200, updatedProduct));
    } catch (error) {
        console.error('Product update error:', error);
        throw error;
    }
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
