const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative']
    },
    image: {
        type: String,
        default: null
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Product category is required']
    },
    sku: {
        type: String,
        unique: true,
        sparse: true // This allows multiple documents to have no SKU while enforcing uniqueness for those that do
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
    stock: {
        type: Number,
        default: 0,
        min: [0, 'Stock cannot be negative']
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Seller information is required']
    }
}, {
    timestamps: true
});

// Create indexes
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ sku: 1 }, { unique: true, sparse: true });
productSchema.index({ category: 1 });
productSchema.index({ seller: 1 });

module.exports = mongoose.model('Product', productSchema);
