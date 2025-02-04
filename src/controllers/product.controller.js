const Product = require('../models/product.model');
const Category = require('../models/category.model');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');
const asyncHandler = require('../middleware/asyncHandler');

// Function to generate unique SKU
const generateUniqueSku = async (productName) => {
    const maxAttempts = 10;
    let attempt = 0;
    
    while (attempt < maxAttempts) {
        try {
            const timestamp = Date.now().toString().slice(-6);
            const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            const namePrefix = (productName || '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase();
            const sku = `${namePrefix}${randomNum}${timestamp}`;
            
            // Check if SKU exists
            const existingSku = await Product.findOne({ sku });
            if (!existingSku) {
                return sku;
            }
        } catch (error) {
            console.error('Error generating SKU:', error);
        }
        
        attempt++;
    }
    
    throw new ApiError(500, 'Failed to generate unique SKU after multiple attempts');
};

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
        const productData = req.body;
        console.log('Creating product with data:', productData);

        // Ensure required fields
        if (!productData.name || !productData.description || !productData.price || !productData.category) {
            throw new ApiError(400, 'Missing required fields');
        }

        // Ensure seller is provided
        if (!productData.seller) {
            throw new ApiError(400, 'Seller information is required');
        }

        // Generate unique SKU if not provided
        if (!productData.sku) {
            try {
                productData.sku = await generateUniqueSku(productData.name);
                console.log('Generated SKU:', productData.sku);
            } catch (error) {
                console.error('Error generating SKU:', error);
                throw new ApiError(500, 'Failed to generate SKU');
            }
        } else {
            // Check if provided SKU already exists
            const existingSku = await Product.findOne({ sku: productData.sku });
            if (existingSku) {
                throw new ApiError(400, 'Product with this SKU already exists');
            }
        }

        // Create the product
        const product = await Product.create({
            ...productData,
            price: parseFloat(productData.price),
            status: productData.status || 'active',
            visibility: productData.visibility || 'public'
        });

        // Populate seller information
        await product.populate('seller', 'name email');
        await product.populate('category', 'name');

        console.log('Created product:', product);

        // Transform the response
        const transformedProduct = {
            _id: product._id.toString(),
            name: product.name,
            description: product.description,
            price: product.price,
            sku: product.sku,
            category: {
                _id: product.category._id,
                name: product.category.name
            },
            status: product.status,
            visibility: product.visibility,
            seller: {
                _id: product.seller._id,
                name: product.seller.name,
                email: product.seller.email
            },
            createdAt: product.createdAt,
            updatedAt: product.updatedAt
        };

        res.status(201).json({
            success: true,
            data: transformedProduct,
            message: 'Product created successfully'
        });
    } catch (error) {
        console.error('Error creating product:', error);
        if (error.code === 11000) {
            throw new ApiError(400, 'Product with this SKU already exists');
        }
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
