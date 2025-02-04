const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    slug: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true
    },
    parentCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    visibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'public'
    },
    metadata: {
        type: Map,
        of: String,
        default: {}
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for child categories
categorySchema.virtual('childCategories', {
    ref: 'Category',
    localField: '_id',
    foreignField: 'parentCategory'
});

// Pre-save hook to generate slug if not provided
categorySchema.pre('save', function(next) {
    if (!this.slug) {
        this.slug = this.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-');
    }
    next();
});

module.exports = mongoose.model('Category', categorySchema);
