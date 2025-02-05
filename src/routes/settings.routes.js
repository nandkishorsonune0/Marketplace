const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth.middleware');
const upload = require('../middleware/multer.middleware');
const {
    getSettings,
    updateSettings,
    uploadLogo
} = require('../controllers/settings.controller');

// All settings routes require authentication
router.use(authenticateUser);

// Settings routes
router.get('/', getSettings);
router.put('/:section', updateSettings);
router.post('/logo', upload.single('logo'), uploadLogo);

module.exports = router; 