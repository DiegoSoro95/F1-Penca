const express = require('express');
const router = express.Router();
const { register, login, getCurrentUser, updatePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getCurrentUser);
router.post('/updatePassword', protect, updatePassword);

module.exports = router;