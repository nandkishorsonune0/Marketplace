const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
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
        default: 0
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    imageUrl: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Create indexes
productSchema.index({ sku: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Product', productSchema);
