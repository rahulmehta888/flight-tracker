const cron = require('node-cron');
const Flight = require('../models/Flight');
const Deal = require('../models/Deal');
const amadeusService = require('./amadeusService');
const emailService = require('./emailService');
const logger = require('../config/logger');

class PriceTrackerService {
  constructor() {
    this.isRunning = false;
    this.cronJob = null;
  }

  // Start the price tracking cron job
  start() {
    if (this.isRunning) {
      logger.info('Price tracker is already running');
      return;
    }

    // Run every 6 hours by default (can be configured in .env)
    const schedule = process.env.PRICE_CHECK_CRON || '0 */6 * * *';

    this.cronJob = cron.schedule(schedule, async () => {
      logger.info('Starting price check cycle');
      await this.checkPrices();
    });

    this.isRunning = true;
    logger.info(`Price tracker started with schedule: ${schedule}`);
  }

  // Stop the price tracking
  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.isRunning = false;
      logger.info('Price tracker stopped');
    }
  }

  // Main price checking logic
  async checkPrices() {
    try {
      const airports = amadeusService.getIndianAirports();
      const destinations = amadeusService.getPopularDestinations();

      // Check prices for all origin-destination combinations
      for (const airport of airports) {
        for (const destination of destinations) {
          await this.checkRoute(airport.code, destination);
          // Add delay to avoid rate limiting
          await this.delay(2000);
        }
      }

      logger.info('Price check cycle completed');
    } catch (error) {
      logger.error('Error in price check cycle:', error.message);
    }
  }

  // Check prices for a specific route
  async checkRoute(origin, destination) {
    try {
      // Get departure dates (check for next 3 months)
      const departureDates = this.getUpcomingDates(90);

      for (const departureDate of departureDates) {
        const returnDate = this.addDays(departureDate, 7); // 7-day trip

        const flightData = await amadeusService.getFlightPrice(
          origin,
          destination,
          this.formatDate(departureDate),
          this.formatDate(returnDate)
        );

        if (flightData) {
          await this.processFlightData(flightData);
        }
      }
    } catch (error) {
      logger.error(`Error checking route ${origin}-${destination}:`, error.message);
    }
  }

  // Process flight data and detect deals
  async processFlightData(flightData) {
    try {
      // Find existing flight record
      let flight = await Flight.findOne({
        origin: flightData.origin,
        destination: flightData.destination,
        departureDate: flightData.departureDate,
      });

      const currentPrice = flightData.price.amount;

      if (flight) {
        // Update existing flight
        const previousPrice = flight.price.amount;

        // Add to price history
        flight.priceHistory.push({
          price: currentPrice,
          timestamp: new Date(),
        });

        flight.price = flightData.price;
        flight.lastChecked = new Date();
        await flight.save();

        // Check if this is a deal
        if (previousPrice > currentPrice) {
          const discount = ((previousPrice - currentPrice) / previousPrice) * 100;
          await this.evaluateDeal(flight, discount, previousPrice);
        }
      } else {
        // Create new flight record
        flight = await Flight.create({
          ...flightData,
          priceHistory: [{
            price: currentPrice,
            timestamp: new Date(),
          }],
        });

        logger.info(`New flight tracked: ${flight.origin}-${flight.destination}`);
      }
    } catch (error) {
      logger.error('Error processing flight data:', error.message);
    }
  }

  // Evaluate if a price drop qualifies as a deal
  async evaluateDeal(flight, discountPercentage, originalPrice) {
    try {
      const minDiscount = parseInt(process.env.MIN_DISCOUNT_PERCENTAGE) || 40;
      const maxLayoverHours = parseInt(process.env.MAX_LAYOVER_HOURS) || 4;

      // Check if it meets deal criteria
      if (discountPercentage < minDiscount) {
        return;
      }

      // Filter out flights with long layovers
      if (flight.layoverDuration && flight.layoverDuration > maxLayoverHours * 60) {
        logger.info(`Flight ${flight.origin}-${flight.destination} excluded: layover too long`);
        return;
      }

      // Check if deal already exists
      const existingDeal = await Deal.findOne({
        flight: flight._id,
        isActive: true,
      });

      if (existingDeal) {
        // Update existing deal if price is better
        if (flight.price.amount < existingDeal.dealPrice) {
          existingDeal.dealPrice = flight.price.amount;
          existingDeal.discountPercentage = discountPercentage;
          existingDeal.savings = originalPrice - flight.price.amount;
          await existingDeal.save();
          logger.info(`Updated deal: ${flight.origin}-${flight.destination} (${discountPercentage.toFixed(0)}% off)`);
        }
      } else {
        // Create new deal
        const dealQuality = this.determineDealQuality(discountPercentage, flight);

        const deal = await Deal.create({
          flight: flight._id,
          title: `${flight.originCity} to ${flight.destinationCity}`,
          description: `Round trip flight with ${flight.stops} ${flight.stops === 1 ? 'stop' : 'stops'}`,
          discountPercentage,
          originalPrice,
          dealPrice: flight.price.amount,
          savings: originalPrice - flight.price.amount,
          dealType: discountPercentage >= 70 ? 'mistake_fare' : 'regular',
          quality: dealQuality,
          expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        });

        logger.info(`🔥 New deal created: ${flight.origin}-${flight.destination} (${discountPercentage.toFixed(0)}% off)`);

        // Send notifications
        await emailService.notifyNewDeal(deal);
      }
    } catch (error) {
      logger.error('Error evaluating deal:', error.message);
    }
  }

  // Determine deal quality based on discount and flight characteristics
  determineDealQuality(discount, flight) {
    if (discount >= 70 && flight.stops <= 1) return 'exceptional';
    if (discount >= 55 && flight.stops <= 1) return 'excellent';
    return 'good';
  }

  // Utility functions
  getUpcomingDates(days) {
    const dates = [];
    const today = new Date();

    // Sample 10 dates in the next 'days' period
    for (let i = 14; i < days; i += 7) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }

    return dates;
  }

  addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  formatDate(date) {
    return date.toISOString().split('T')[0];
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Manual trigger for testing
  async runOnce() {
    logger.info('Running price check manually');
    await this.checkPrices();
  }
}

module.exports = new PriceTrackerService();
