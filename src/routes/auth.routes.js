const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth.middleware');
const {
    register,
    login,
    getProfile,
    updateProfile
} = require('../controllers/auth.controller');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', authenticateUser, getProfile);
router.put('/profile', authenticateUser, updateProfile);

module.exports = router;
