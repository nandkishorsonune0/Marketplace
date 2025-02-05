const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    general: {
        storeName: {
            type: String,
            trim: true
        },
        storeEmail: {
            type: String,
            trim: true
        },
        storePhone: {
            type: String,
            trim: true
        },
        storeAddress: {
            type: String,
            trim: true
        },
        currency: {
            type: String,
            default: 'USD'
        },
        timezone: {
            type: String,
            default: 'UTC'
        }
    },
    notifications: {
        emailNotifications: {
            type: Boolean,
            default: true
        },
        orderUpdates: {
            type: Boolean,
            default: true
        },
        newProducts: {
            type: Boolean,
            default: true
        },
        promotions: {
            type: Boolean,
            default: true
        }
    },
    security: {
        twoFactorAuth: {
            type: Boolean,
            default: false
        },
        passwordExpiry: {
            type: Number,
            default: 90
        },
        sessionTimeout: {
            type: Number,
            default: 30
        }
    },
    appearance: {
        theme: {
            type: String,
            enum: ['light', 'dark'],
            default: 'light'
        },
        primaryColor: {
            type: String,
            default: '#4F46E5'
        },
        logo: {
            type: String,
            default: null
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema); 