const express = require('express');
const router = express.Router();
const { getUpcomingRaces, getRaceById } = require('../controllers/carreraController');
const { protect } = require('../middleware/authMiddleware');

router.get('/upcoming', protect, getUpcomingRaces);
router.get('/:id', protect, getRaceById);

module.exports = router;