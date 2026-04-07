const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
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
  originCity: String,
  destinationCity: String,
  departureDate: {
    type: Date,
    required: true,
  },
  returnDate: Date,
  airline: String,
  flightNumber: String,
  price: {
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
  },
  priceHistory: [{
    price: Number,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
  cabinClass: {
    type: String,
    enum: ['economy', 'premium_economy', 'business', 'first'],
    default: 'economy',
  },
  stops: {
    type: Number,
    default: 0,
  },
  layoverDuration: Number, // in minutes
  duration: Number, // in minutes
  checkedBaggage: {
    type: Boolean,
    default: false,
  },
  bookingUrl: String,
  lastChecked: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for efficient querying
flightSchema.index({ origin: 1, destination: 1, departureDate: 1 });
flightSchema.index({ price: 1 });
flightSchema.index({ lastChecked: 1 });

module.exports = mongoose.model('Flight', flightSchema);
