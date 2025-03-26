const express = require('express');
const router = express.Router();
const { getUpcomingRaces, getRaceById, fetchRaceResults,fetchAllRaceResults } = require('../controllers/carreraController');
const { protect } = require('../middleware/authMiddleware');

router.get('/check_results', protect, fetchAllRaceResults);
router.get('/upcoming', protect, getUpcomingRaces);
router.get('/:id', protect, getRaceById);
router.get('/results/:id', protect, fetchRaceResults);

module.exports = router;