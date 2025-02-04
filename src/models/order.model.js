const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true,
        default: () => 'ORD' + Math.random().toString(36).substr(2, 9).toUpperCase()
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        }
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    shippingAddress: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['card', 'cash', 'upi'],
        required: true
    },
    paymentDetails: {
        transactionId: String,
        paymentDate: Date
    }
}, {
    timestamps: true
});

// Calculate total amount before saving
orderSchema.pre('save', async function(next) {
    if (this.isModified('items')) {
        this.totalAmount = this.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }
    next();
});

module.exports = mongoose.model('Order', orderSchema);
