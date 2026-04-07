const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
  flight: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flight',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  discountPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  originalPrice: {
    type: Number,
    required: true,
  },
  dealPrice: {
    type: Number,
    required: true,
  },
  savings: {
    type: Number,
    required: true,
  },
  dealType: {
    type: String,
    enum: ['regular', 'mistake_fare', 'flash_sale', 'seasonal'],
    default: 'regular',
  },
  quality: {
    type: String,
    enum: ['good', 'excellent', 'exceptional'],
    default: 'good',
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  expiryDate: Date,
  isActive: {
    type: Boolean,
    default: true,
  },
  notificationsSent: {
    type: Number,
    default: 0,
  },
  clickCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Index for efficient querying
dealSchema.index({ isActive: 1, expiryDate: 1 });
dealSchema.index({ discountPercentage: -1 });
dealSchema.index({ dealType: 1 });

module.exports = mongoose.model('Deal', dealSchema);
