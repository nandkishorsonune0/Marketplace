const Category = require('../models/category.model');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');
const asyncHandler = require('../middleware/asyncHandler');
const Product = require('../models/product.model');

// Get all categories with advanced filtering and sorting
exports.getCategories = asyncHandler(async (req, res) => {
    try {
        const { 
            search = '', 
            status = '',
            visibility,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            page = 1,
            limit = 10
        } = req.query;

        console.log('Get Categories Request:', { 
            search, status, visibility, sortBy, 
            sortOrder, page, limit 
        });

        const query = {};

        // Search by name or description
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by status
        if (status) {
            query.status = status;
        }

        // Filter by visibility
        if (visibility) {
            query.visibility = visibility;
        }

        console.log('MongoDB Query:', query);

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Build sort object
        const sort = {
            [sortBy]: sortOrder === 'desc' ? -1 : 1
        };

        // Execute query with pagination
        const categories = await Category.find(query)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        console.log('Found Categories:', categories);

        // Get total count
        const total = await Category.countDocuments(query);

        // Calculate pagination info
        const totalPages = Math.ceil(total / parseInt(limit));

        // Validate and transform data
        const validatedCategories = categories.map(category => ({
            _id: category._id.toString(),
            name: category.name || '',
            description: category.description || '',
            status: category.status || 'active',
            visibility: category.visibility || 'public',
            createdAt: category.createdAt,
            updatedAt: category.updatedAt
        }));

        // Send response with proper structure
        res.status(200).json({
            success: true,
            data: validatedCategories,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages
            }
        });
    } catch (error) {
        console.error('Error in getCategories:', error);
        throw new ApiError(500, 'Failed to fetch categories');
    }
});

// Get category by ID
exports.getCategoryById = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id)
        .populate('parentCategory', 'name')
        .lean();

    if (!category) {
        throw new ApiError(404, 'Category not found');
    }

    res.status(200).json(new ApiResponse(200, category));
});

// Create new category
exports.createCategory = asyncHandler(async (req, res) => {
    const { 
        name, 
        description, 
        slug, 
        parentCategory,
        status = 'active',
        visibility = 'public',
        metadata = {}
    } = req.body;

    // Validate required fields
    if (!name) {
        throw new ApiError(400, 'Category name is required');
    }

    // Generate slug if not provided
    const categorySlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Check if category with same name or slug exists
    const existingCategory = await Category.findOne({
        $or: [
            { name: { $regex: new RegExp(`^${name}$`, 'i') } },
            { slug: categorySlug }
        ]
    });

    if (existingCategory) {
        throw new ApiError(400, 'Category with this name or slug already exists');
    }

    // Validate parent category if provided
    if (parentCategory) {
        const parentExists = await Category.findById(parentCategory);
        if (!parentExists) {
            throw new ApiError(400, 'Parent category not found');
        }
    }

    // Validate status and visibility
    const validStatuses = ['active', 'inactive'];
    const validVisibilities = ['public', 'private'];

    if (!validStatuses.includes(status)) {
        throw new ApiError(400, 'Invalid status value');
    }

    if (!validVisibilities.includes(visibility)) {
        throw new ApiError(400, 'Invalid visibility value');
    }

    const category = await Category.create({
        name,
        description,
        slug: categorySlug,
        parentCategory,
        status,
        visibility,
        metadata
    });

    res.status(201).json(new ApiResponse(201, category, 'Category created successfully'));
});

// Update category
exports.updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { 
        name, 
        description, 
        slug, 
        parentCategory,
        status,
        visibility,
        metadata 
    } = req.body;

    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
        throw new ApiError(404, 'Category not found');
    }

    // If updating name or slug, check for duplicates
    if (name || slug) {
        const categorySlug = slug || (name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : category.slug);
        
        const existingCategory = await Category.findOne({
            _id: { $ne: id },
            $or: [
                { name: name ? { $regex: new RegExp(`^${name}$`, 'i') } : undefined },
                { slug: categorySlug }
            ].filter(Boolean)
        });

        if (existingCategory) {
            throw new ApiError(400, 'Category with this name or slug already exists');
        }
    }

    // Validate parent category if provided
    if (parentCategory) {
        // Prevent setting self as parent
        if (parentCategory === id) {
            throw new ApiError(400, 'Category cannot be its own parent');
        }

        const parentExists = await Category.findById(parentCategory);
        if (!parentExists) {
            throw new ApiError(400, 'Parent category not found');
        }

        // Check for circular reference
        let currentParent = parentExists;
        while (currentParent.parentCategory) {
            if (currentParent.parentCategory.toString() === id) {
                throw new ApiError(400, 'Circular parent reference detected');
            }
            currentParent = await Category.findById(currentParent.parentCategory);
        }
    }

    // Validate status and visibility if provided
    if (status && !['active', 'inactive'].includes(status)) {
        throw new ApiError(400, 'Invalid status value');
    }

    if (visibility && !['public', 'private'].includes(visibility)) {
        throw new ApiError(400, 'Invalid visibility value');
    }

    // Update category
    const updatedCategory = await Category.findByIdAndUpdate(
        id,
        {
            $set: {
                ...(name && { name }),
                ...(description && { description }),
                ...(slug && { slug }),
                ...(parentCategory && { parentCategory }),
                ...(status && { status }),
                ...(visibility && { visibility }),
                ...(metadata && { metadata })
            }
        },
        { new: true, runValidators: true }
    ).populate('parentCategory', 'name');

    res.status(200).json(new ApiResponse(200, updatedCategory, 'Category updated successfully'));
});

// Delete category
exports.deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
        throw new ApiError(404, 'Category not found');
    }

    // Check if category has child categories
    const hasChildren = await Category.exists({ parentCategory: id });
    if (hasChildren) {
        throw new ApiError(400, 'Cannot delete category with child categories');
    }

    // Check if category has associated products
    const hasProducts = await Product.exists({ category: id });
    if (hasProducts) {
        throw new ApiError(400, 'Cannot delete category with associated products');
    }

    await Category.findByIdAndDelete(id);

    res.status(200).json(
        new ApiResponse(200, null, 'Category deleted successfully')
    );
});
