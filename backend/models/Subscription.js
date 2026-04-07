const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  route: {
    origin: {
      type: String,
      required: true,
      uppercase: true,
    },
    destination: {
      type: String,
      required: true,
      uppercase: true,
    },
  },
  priceAlert: {
    enabled: {
      type: Boolean,
      default: true,
    },
    targetPrice: Number,
  },
  dateRange: {
    start: Date,
    end: Date,
  },
  preferences: {
    maxStops: {
      type: Number,
      default: 1,
    },
    cabinClass: {
      type: String,
      enum: ['economy', 'premium_economy', 'business', 'first', 'any'],
      default: 'any',
    },
    airlines: [String],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Compound index for efficient querying
subscriptionSchema.index({ user: 1, 'route.origin': 1, 'route.destination': 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
