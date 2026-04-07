/**
 * Live Flight Search Controller
 * Real-time flight search across multiple sources
 */

const googleFlightsScraper = require('../scrapers/googleFlightsScraper');
const kayakScraper = require('../scrapers/kayakScraper');
const skyscannerScraper = require('../scrapers/skyscannerScraper');
const DealScorer = require('../utils/dealScoring');
const logger = require('../config/logger');
const { findRoute, INDIAN_CITIES, getAllDestinations } = require('../config/routes');

// @desc    Live flight search
// @route   POST /api/search/live
// @access  Private
exports.liveSearch = async (req, res) => {
  try {
    const { origin, destination, departureDate, returnDate } = req.body;

    // Validate inputs
    if (!origin || !destination || !departureDate || !returnDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide origin, destination, departure date, and return date'
      });
    }

    // Validate route
    const route = findRoute(origin, destination);
    if (!route) {
      return res.status(400).json({
        success: false,
        message: 'Invalid origin or destination airport code'
      });
    }

    logger.info(`Live search: ${origin} → ${destination} on ${departureDate}`);

    // Search all sources in parallel
    const searchPromises = [
      googleFlightsScraper.searchFlights(origin, destination, departureDate, returnDate)
        .catch(err => {
          logger.error('Google Flights error:', err.message);
          return null;
        }),
      kayakScraper.searchFlights(origin, destination, departureDate, returnDate)
        .catch(err => {
          logger.error('Kayak error:', err.message);
          return null;
        }),
      skyscannerScraper.searchFlights(origin, destination, departureDate, returnDate)
        .catch(err => {
          logger.error('Skyscanner error:', err.message);
          return null;
        })
    ];

    const [googleResult, kayakResult, skyscannerResult] = await Promise.all(searchPromises);

    // Aggregate results
    const results = [googleResult, kayakResult, skyscannerResult].filter(r => r);

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No flights found for this route'
      });
    }

    // Find cheapest
    const cheapest = results.reduce((prev, curr) =>
      curr.price < prev.price ? curr : prev
    );

    // Historical price estimate (you can improve this with real data)
    const historicalPrice = estimateHistoricalPrice(origin, destination);
    const discount = ((historicalPrice - cheapest.price) / historicalPrice) * 100;

    // Build enhanced result
    const enhancedResult = {
      origin: route.originCity,
      destination: route.destinationCity,
      destinationCountry: route.destinationCountry,
      departureDate,
      returnDate,
      cheapestPrice: cheapest.price,
      cheapestSource: cheapest.source,
      priceComparison: {
        google: googleResult?.price || null,
        kayak: kayakResult?.price || null,
        skyscanner: skyscannerResult?.price || null
      },
      allResults: results.map(r => ({
        source: r.source,
        price: r.price,
        airline: r.airline,
        duration: r.duration,
        stops: r.stops
      })),
      savings: Math.max(0, historicalPrice - cheapest.price),
      discountPercentage: Math.max(0, discount),
      isDeal: discount >= 35,
      bookingUrl: cheapest.source === 'Google Flights'
        ? `https://www.google.com/flights#flt=${origin}.${destination}.${departureDate}`
        : `https://www.kayak.com/flights/${origin}-${destination}/${departureDate}/${returnDate}`
    };

    // Add AI scoring if it's a deal
    if (enhancedResult.isDeal) {
      // Create temporary flight object for scoring
      const tempFlight = {
        origin,
        destination,
        airline: cheapest.airline || 'Multiple',
        stops: cheapest.stops || 0,
        duration: cheapest.duration || 360,
        departureDate: new Date(departureDate),
        checkedBaggage: true
      };

      const tempDeal = {
        flight: tempFlight,
        discountPercentage: discount,
        originalPrice: historicalPrice,
        dealPrice: cheapest.price,
        savings: historicalPrice - cheapest.price,
        dealType: discount >= 70 ? 'mistake_fare' : discount >= 60 ? 'flash_sale' : 'regular',
        quality: discount >= 70 ? 'exceptional' : discount >= 55 ? 'excellent' : 'good',
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };

      enhancedResult.aiScore = DealScorer.calculateScore(tempDeal);
      enhancedResult.priceContext = DealScorer.getPriceContext(historicalPrice, cheapest.price);
      enhancedResult.trueCost = DealScorer.calculateTrueCost(tempFlight, cheapest.price);
    }

    res.status(200).json({
      success: true,
      data: enhancedResult
    });

  } catch (error) {
    logger.error('Live search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error performing live search',
      error: error.message
    });
  }
};

// @desc    Get available airports
// @route   GET /api/search/airports
// @access  Public
exports.getAirports = async (req, res) => {
  try {
    const { type } = req.query;

    if (type === 'origins') {
      return res.status(200).json({
        success: true,
        data: INDIAN_CITIES
      });
    }

    if (type === 'destinations') {
      return res.status(200).json({
        success: true,
        data: getAllDestinations()
      });
    }

    // Return both
    res.status(200).json({
      success: true,
      data: {
        origins: INDIAN_CITIES,
        destinations: getAllDestinations()
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching airports'
    });
  }
};

// Helper: Estimate historical price based on route
function estimateHistoricalPrice(origin, destination) {
  // Simple distance-based estimation (can be improved with real data)
  const priceMap = {
    // Short-haul Asia (< 4 hours)
    'DEL-DXB': 28000, 'BOM-DXB': 26000, 'BLR-DXB': 25000,
    'DEL-BKK': 25000, 'BOM-BKK': 28000, 'DEL-KTM': 15000,
    'BOM-SIN': 32000, 'DEL-SIN': 35000, 'BLR-SIN': 28000,
    'BLR-KUL': 22000, 'MAA-SIN': 30000, 'DEL-HKG': 35000,

    // Medium-haul (4-8 hours)
    'DEL-IST': 45000, 'BOM-IST': 48000,
    'DEL-DOH': 35000, 'BOM-DOH': 33000,

    // Long-haul Europe (8-12 hours)
    'DEL-LHR': 65000, 'BOM-LHR': 70000, 'BLR-LHR': 72000,
    'DEL-CDG': 68000, 'BOM-CDG': 73000,
    'DEL-FRA': 70000, 'BOM-FRA': 75000,
    'DEL-AMS': 72000,

    // Long-haul USA (12-18 hours)
    'DEL-JFK': 95000, 'BOM-JFK': 100000,
    'DEL-SFO': 90000, 'BOM-SFO': 95000,
    'DEL-LAX': 88000, 'BOM-LAX': 93000,

    // East Asia
    'DEL-NRT': 55000, 'BOM-NRT': 58000, 'BLR-NRT': 60000,
    'DEL-ICN': 52000, 'BOM-ICN': 55000,
    'DEL-PEK': 48000, 'BOM-PEK': 50000,

    // Africa
    'DEL-NBO': 55000, 'BOM-NBO': 52000,
    'DEL-JNB': 70000, 'BOM-JNB': 68000,
  };

  const key = `${origin}-${destination}`;
  if (priceMap[key]) return priceMap[key];

  // Fallback: estimate by region
  const dest = destination.toUpperCase();

  // Southeast Asia
  if (['SIN', 'BKK', 'KUL', 'HKT', 'DPS', 'SGN', 'HAN', 'MNL'].includes(dest)) return 30000;

  // East Asia
  if (['NRT', 'HND', 'ICN', 'PEK', 'PVG', 'HKG', 'TPE'].includes(dest)) return 55000;

  // Middle East
  if (['DXB', 'DOH', 'IST', 'MCT', 'BAH'].includes(dest)) return 35000;

  // Europe
  if (['LHR', 'CDG', 'FRA', 'AMS', 'FCO', 'MAD', 'BCN'].includes(dest)) return 70000;

  // USA
  if (['JFK', 'SFO', 'LAX', 'ORD', 'IAD', 'BOS'].includes(dest)) return 95000;

  // Africa
  if (['NBO', 'JNB', 'CPT', 'MRU'].includes(dest)) return 60000;

  // Australia
  if (['SYD', 'MEL', 'PER'].includes(dest)) return 75000;

  return 50000; // Default
}

module.exports = exports;
