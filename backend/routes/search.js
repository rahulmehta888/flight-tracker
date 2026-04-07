const express = require('express');
const router = express.Router();
const { liveSearch, getAirports } = require('../controllers/liveSearchController');
const { protect } = require('../middleware/auth');

// Live search route
router.post('/live', protect, liveSearch);

// Get available airports
router.get('/airports', getAirports);

module.exports = router;
