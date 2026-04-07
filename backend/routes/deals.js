const express = require('express');
const {
  getDeals,
  getDeal,
  trackClick,
  getDealStats,
} = require('../controllers/dealsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getDeals);
router.get('/stats', protect, getDealStats);
router.get('/:id', protect, getDeal);
router.post('/:id/click', protect, trackClick);

module.exports = router;
