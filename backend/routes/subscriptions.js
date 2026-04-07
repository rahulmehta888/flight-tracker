const express = require('express');
const {
  getSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} = require('../controllers/subscriptionsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(protect, getSubscriptions)
  .post(protect, createSubscription);

router.route('/:id')
  .put(protect, updateSubscription)
  .delete(protect, deleteSubscription);

module.exports = router;
