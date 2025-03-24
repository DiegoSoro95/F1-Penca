const express = require('express');
const router = express.Router();
const { createBet, getUserBets } = require('../controllers/apuestaController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createBet);
router.get('/user', protect, getUserBets);

module.exports = router;