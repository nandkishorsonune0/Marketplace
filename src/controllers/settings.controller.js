const Settings = require('../models/settings.model');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');
const asyncHandler = require('../middleware/asyncHandler');

// Get all settings
const getSettings = asyncHandler(async (req, res) => {
    try {
        let settings = await Settings.findOne({ user: req.user._id });
        
        if (!settings) {
            // Create default settings if none exist
            settings = await Settings.create({
                user: req.user._id,
                general: {
                    storeName: '',
                    storeEmail: '',
                    storePhone: '',
                    storeAddress: '',
                    currency: 'USD',
                    timezone: 'UTC'
                },
                notifications: {
                    emailNotifications: true,
                    orderUpdates: true,
                    newProducts: true,
                    promotions: true
                },
                security: {
                    twoFactorAuth: false,
                    passwordExpiry: 90,
                    sessionTimeout: 30
                },
                appearance: {
                    theme: 'light',
                    primaryColor: '#4F46E5',
                    logo: null
                }
            });
        }

        res.status(200).json(new ApiResponse(200, settings));
    } catch (error) {
        console.error('Error in getSettings:', error);
        throw new ApiError(500, 'Error fetching settings');
    }
});

// Update settings by section
const updateSettings = asyncHandler(async (req, res) => {
    try {
        const { section } = req.params;
        const updateData = req.body;

        // Validate section
        const validSections = ['general', 'notifications', 'security', 'appearance'];
        if (!validSections.includes(section)) {
            throw new ApiError(400, 'Invalid settings section');
        }

        // Find and update settings
        let settings = await Settings.findOne({ user: req.user._id });
        
        if (!settings) {
            throw new ApiError(404, 'Settings not found');
        }

        // Update the specific section
        settings[section] = {
            ...settings[section],
            ...updateData
        };

        await settings.save();

        res.status(200).json(new ApiResponse(200, settings, 'Settings updated successfully'));
    } catch (error) {
        console.error('Error in updateSettings:', error);
        throw new ApiError(500, 'Error updating settings');
    }
});

// Upload logo
const uploadLogo = asyncHandler(async (req, res) => {
    try {
        if (!req.file) {
            throw new ApiError(400, 'No logo file provided');
        }

        const logoUrl = `/uploads/${req.file.filename}`;

        // Update settings with new logo URL
        let settings = await Settings.findOne({ user: req.user._id });
        
        if (!settings) {
            throw new ApiError(404, 'Settings not found');
        }

        settings.appearance.logo = logoUrl;
        await settings.save();

        res.status(200).json(new ApiResponse(200, { logoUrl }, 'Logo uploaded successfully'));
    } catch (error) {
        console.error('Error in uploadLogo:', error);
        throw new ApiError(500, 'Error uploading logo');
    }
});

module.exports = {
    getSettings,
    updateSettings,
    uploadLogo
}; 