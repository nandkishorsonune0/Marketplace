const Category = require('../models/category.model');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');
const asyncHandler = require('../middleware/asyncHandler');
const Product = require('../models/product.model');

// Get all categories with advanced filtering and sorting
exports.getCategories = asyncHandler(async (req, res) => {
    const { 
        search = '', 
        status = '',
        visibility,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = 1,
        limit = 10,
        includeEmpty = false,
        parentCategory
    } = req.query;

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

    // Filter by parent category
    if (parentCategory) {
        query.parentCategory = parentCategory;
    }

    // Optional: filter out empty categories
    if (!includeEmpty) {
        const nonEmptyCategories = await Product.distinct('category');
        query._id = { $in: nonEmptyCategories };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build sort object
    const sort = {
        [sortBy]: sortOrder === 'desc' ? -1 : 1
    };

    // Execute query with pagination
    const [categories, total] = await Promise.all([
        Category.find(query)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('parentCategory', 'name')
            .lean(),
        Category.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json(
        new ApiResponse(200, {
            categories,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages,
                hasNextPage,
                hasPrevPage
            }
        })
    );
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

    // Check if category with same name or slug exists
    const existingCategory = await Category.findOne({
        $or: [
            { name: { $regex: new RegExp(`^${name}$`, 'i') } },
            { slug: { $regex: new RegExp(`^${slug}$`, 'i') } }
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

    const category = await Category.create({
        name,
        description,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        parentCategory,
        status,
        visibility,
        metadata
    });

    res.status(201).json(new ApiResponse(201, category));
});

// Update category
exports.updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
        throw new ApiError(404, 'Category not found');
    }

    // If name or slug is being updated, check for duplicates
    if (updateData.name || updateData.slug) {
        const existingCategory = await Category.findOne({
            _id: { $ne: id },
            $or: [
                updateData.name ? { name: { $regex: new RegExp(`^${updateData.name}$`, 'i') } } : null,
                updateData.slug ? { slug: { $regex: new RegExp(`^${updateData.slug}$`, 'i') } } : null
            ].filter(Boolean)
        });

        if (existingCategory) {
            throw new ApiError(400, 'Category with this name or slug already exists');
        }
    }

    // Validate parent category if provided
    if (updateData.parentCategory) {
        // Prevent setting self as parent
        if (updateData.parentCategory.toString() === id) {
            throw new ApiError(400, 'Category cannot be its own parent');
        }

        const parentExists = await Category.findById(updateData.parentCategory);
        if (!parentExists) {
            throw new ApiError(400, 'Parent category not found');
        }

        // Check for circular reference
        let parent = parentExists;
        while (parent.parentCategory) {
            if (parent.parentCategory.toString() === id) {
                throw new ApiError(400, 'Circular reference detected in category hierarchy');
            }
            parent = await Category.findById(parent.parentCategory);
        }
    }

    // Update the category
    const updatedCategory = await Category.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
    ).populate('parentCategory', 'name');

    res.status(200).json(new ApiResponse(200, updatedCategory));
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
