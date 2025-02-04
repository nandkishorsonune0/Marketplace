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
    try {
        const { id } = req.params;
        const updateData = req.body;

        console.log('Updating category:', { id, updateData });

        // Find the category first
        const category = await Category.findById(id);
        if (!category) {
            throw new ApiError(404, 'Category not found');
        }

        // Update the category
        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            {
                name: updateData.name,
                description: updateData.description,
                status: updateData.status,
                visibility: updateData.visibility
            },
            { new: true, runValidators: true }
        ).lean();

        // Transform the response
        const transformedCategory = {
            _id: updatedCategory._id.toString(),
            name: updatedCategory.name,
            description: updatedCategory.description || '',
            status: updatedCategory.status || 'active',
            visibility: updatedCategory.visibility || 'public',
            createdAt: updatedCategory.createdAt,
            updatedAt: updatedCategory.updatedAt
        };

        console.log('Updated category:', transformedCategory);

        res.status(200).json({
            success: true,
            data: transformedCategory
        });
    } catch (error) {
        console.error('Error updating category:', error);
        throw new ApiError(500, 'Failed to update category');
    }
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
