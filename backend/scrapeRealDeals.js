#!/usr/bin/env node
/**
 * Multi-Source Flight Deal Scraper
 * Scrapes Google Flights, Kayak, and Skyscanner
 * Aggregates results and finds best deals
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Flight = require('./models/Flight');
const Deal = require('./models/Deal');
const logger = require('./config/logger');
const DealScorer = require('./utils/dealScoring');
const { getPopularRoutes } = require('./config/routes');

// Import scrapers
const googleFlightsScraper = require('./scrapers/googleFlightsScraper');
const kayakScraper = require('./scrapers/kayakScraper');
const skyscannerScraper = require('./scrapers/skyscannerScraper');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Get popular routes (50 most searched routes)
const ROUTES = getPopularRoutes();

// Historical price estimates for deal detection
const HISTORICAL_PRICES = {
  'DEL-DXB': 28000, 'BOM-DXB': 26000, 'BLR-DXB': 25000,
  'DEL-BKK': 25000, 'BOM-BKK': 28000, 'DEL-KTM': 15000,
  'BOM-SIN': 32000, 'DEL-SIN': 35000, 'BLR-SIN': 28000,
  'BLR-KUL': 22000, 'MAA-SIN': 30000,
  'DEL-LHR': 65000, 'BOM-LHR': 70000, 'BLR-LHR': 72000,
  'DEL-JFK': 95000, 'BOM-JFK': 100000,
};

function getHistoricalPrice(origin, destination) {
  const key = `${origin}-${destination}`;
  return HISTORICAL_PRICES[key] || 50000;
}

// Get date ranges to check
function getDateRanges() {
  const ranges = [];
  const today = new Date();

  // Check 3 different departure dates (4 weeks, 8 weeks, 12 weeks out)
  [28, 56, 84].forEach(days => {
    const departureDate = new Date(today);
    departureDate.setDate(departureDate.getDate() + days);

    // Check 7-day trip
    const returnDate = new Date(departureDate);
    returnDate.setDate(returnDate.getDate() + 7);

    ranges.push({
      departure: departureDate.toISOString().split('T')[0],
      return: returnDate.toISOString().split('T')[0],
      duration: 7
    });
  });

  return ranges;
}

// Delay utility
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Aggregate results from multiple scrapers
function aggregateResults(googleResult, kayakResult, skyscannerResult) {
  const results = [googleResult, kayakResult, skyscannerResult].filter(r => r);

  if (results.length === 0) return null;

  // Find cheapest across all sources
  const cheapest = results.reduce((prev, curr) =>
    curr.price < prev.price ? curr : prev
  );

  // Add metadata
  cheapest.scrapedFrom = results.map(r => r.source).join(', ');
  cheapest.priceComparison = {
    google: googleResult?.price || null,
    kayak: kayakResult?.price || null,
    skyscanner: skyscannerResult?.price || null,
    cheapestSource: cheapest.source
  };

  return cheapest;
}

// Main scraping function
async function scrapeDeals() {
  console.log('\n🚀 Multi-Source Flight Deal Scraper\n');
  console.log('═══════════════════════════════════════════\n');
  console.log('📡 Sources: Google Flights, Kayak, Skyscanner');
  console.log('🔄 Scraping every 4 hours (safe rate)');
  console.log('🆓 100% FREE - No API keys needed!\n');

  try {
    const dateRanges = getDateRanges();
    let dealsFound = 0;
    let routesChecked = 0;
    let totalScrapes = 0;

    console.log(`🔍 Checking ${ROUTES.length} popular routes × ${dateRanges.length} dates`);
    console.log(`📊 Total coverage: ${ROUTES.length * dateRanges.length} searches`);
    console.log(`🌍 Destinations: UAE, Singapore, Thailand, UK, USA, Japan, and more!\n`);

    for (const route of ROUTES) {
      console.log(`\n📍 ${route.originCity} → ${route.destinationCity}`);
      console.log('─'.repeat(50));

      let bestDealForRoute = null;

      for (const dateRange of dateRanges) {
        try {
          console.log(`  📅 ${dateRange.departure} to ${dateRange.return}`);

          // Scrape from all sources in parallel
          const [googleResult, kayakResult, skyscannerResult] = await Promise.allSettled([
            googleFlightsScraper.searchFlights(
              route.origin,
              route.destination,
              dateRange.departure,
              dateRange.return
            ),
            kayakScraper.searchFlights(
              route.origin,
              route.destination,
              dateRange.departure,
              dateRange.return
            ),
            skyscannerScraper.searchFlights(
              route.origin,
              route.destination,
              dateRange.departure,
              dateRange.return
            )
          ]);

          totalScrapes += 3;

          // Extract successful results
          const google = googleResult.status === 'fulfilled' ? googleResult.value : null;
          const kayak = kayakResult.status === 'fulfilled' ? kayakResult.value : null;
          const skyscanner = skyscannerResult.status === 'fulfilled' ? skyscannerResult.value : null;

          // Aggregate results
          const bestPrice = aggregateResults(google, kayak, skyscanner);

          if (!bestPrice) {
            console.log('     ❌ No results from any source');
            continue;
          }

          const historicalPrice = getHistoricalPrice(route.origin, route.destination);
          const discount = ((historicalPrice - bestPrice.price) / historicalPrice) * 100;

          console.log(`     💰 Best: ₹${bestPrice.price.toLocaleString('en-IN')} from ${bestPrice.source}`);
          if (google) console.log(`        Google: ₹${google.price.toLocaleString('en-IN')}`);
          if (kayak) console.log(`        Kayak: ₹${kayak.price.toLocaleString('en-IN')}`);
          if (skyscanner) console.log(`        Skyscanner: ₹${skyscanner.price.toLocaleString('en-IN')}`);

          // Track best deal for this route
          if (!bestDealForRoute || bestPrice.price < bestDealForRoute.price) {
            bestDealForRoute = { ...bestPrice, dateRange, discount, historicalPrice };
          }

          // Save deals with 35%+ discount
          if (discount >= 35) {
            // Create/update flight record
            let flight = await Flight.findOne({
              origin: route.origin,
              destination: route.destination,
              departureDate: new Date(dateRange.departure),
            });

            if (flight) {
              flight.priceHistory.push({ price: bestPrice.price, timestamp: new Date() });
              flight.price = { amount: bestPrice.price, currency: 'INR' };
              flight.lastChecked = new Date();
              await flight.save();
            } else {
              flight = await Flight.create({
                origin: route.origin,
                destination: route.destination,
                originCity: route.originCity,
                destinationCity: route.destinationCity,
                departureDate: new Date(dateRange.departure),
                returnDate: new Date(dateRange.return),
                airline: bestPrice.airline || 'Multiple',
                price: { amount: bestPrice.price, currency: 'INR' },
                stops: bestPrice.stops || 0,
                duration: bestPrice.duration ? parseInt(bestPrice.duration.replace(/\D/g, '')) : 360,
                cabinClass: 'economy',
                checkedBaggage: true,
                bookingUrl: `https://www.google.com/flights#flt=${route.origin}.${route.destination}.${dateRange.departure}`,
                priceHistory: [{ price: bestPrice.price, timestamp: new Date() }],
              });
            }

            // Create deal
            const quality = discount >= 70 && bestPrice.stops <= 1 ? 'exceptional' :
                           discount >= 55 && bestPrice.stops <= 1 ? 'excellent' : 'good';

            await Deal.create({
              flight: flight._id,
              title: `${route.originCity} to ${route.destinationCity}`,
              description: `Round trip via ${bestPrice.source}`,
              discountPercentage: discount,
              originalPrice: historicalPrice,
              dealPrice: bestPrice.price,
              savings: historicalPrice - bestPrice.price,
              dealType: discount >= 70 ? 'mistake_fare' : discount >= 60 ? 'flash_sale' : 'regular',
              quality,
              expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              isActive: true,
            });

            dealsFound++;
            console.log(`     🔥 DEAL SAVED! ${Math.round(discount)}% OFF`);
          }

          // Rate limiting - wait between date checks
          await delay(5000);

        } catch (error) {
          logger.error(`Error checking ${route.origin}-${route.destination}:`, error.message);
        }
      }

      routesChecked++;

      if (bestDealForRoute) {
        console.log(`\n  ✨ BEST DEAL: ₹${bestDealForRoute.price.toLocaleString('en-IN')} (${Math.round(bestDealForRoute.discount)}% off)`);
        console.log(`     ${bestDealForRoute.dateRange.departure} • ${bestDealForRoute.source}`);
      }

      // Wait between routes to avoid being blocked
      await delay(3000);
    }

    console.log('\n\n═══════════════════════════════════════════');
    console.log('📊 SCRAPING COMPLETE');
    console.log('═══════════════════════════════════════════');
    console.log(`✅ Routes checked: ${routesChecked}`);
    console.log(`🔍 Total scrapes: ${totalScrapes}`);
    console.log(`🔥 Deals found (35%+ off): ${dealsFound}`);

    if (dealsFound > 0) {
      console.log(`\n🎉 Success! Found ${dealsFound} amazing deals!`);
      console.log(`🌐 Refresh your browser: http://localhost:3000\n`);
    } else {
      console.log('\n💡 No deals found this time (35%+ threshold)');
      console.log('   This is normal - try again in 4 hours!');
      console.log('   Great deals are rare but worth waiting for.\n');
    }

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    logger.error('Scraper fatal error:', error);
    process.exit(1);
  }
}

// Run scraper
console.log('⏳ Starting scrapers... (this takes 5-10 minutes)\n');
scrapeDeals();
