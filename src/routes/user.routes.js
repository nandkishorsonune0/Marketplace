const express = require('express');
const router = express.Router();
const { 
    authenticateUser, 
    authorizeRole 
} = require('../middleware/auth.middleware');
const {
    getUsers,
    getUserById,
    updateUser,
    deleteUser
} = require('../controllers/user.controller');

// Admin routes - require authentication and admin role
router.get('/', authenticateUser, authorizeRole('admin'), getUsers);
router.get('/:id', authenticateUser, authorizeRole('admin'), getUserById);
router.put('/:id', authenticateUser, authorizeRole('admin'), updateUser);
router.delete('/:id', authenticateUser, authorizeRole('admin'), deleteUser);

module.exports = router;
