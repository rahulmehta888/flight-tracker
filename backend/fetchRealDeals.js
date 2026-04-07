#!/usr/bin/env node
/**
 * Real Flight Deals Fetcher
 * Connects to Amadeus API and fetches actual flight prices
 */

require('dotenv').config();
const mongoose = require('mongoose');
const amadeusService = require('./services/amadeusService');
const Flight = require('./models/Flight');
const Deal = require('./models/Deal');
const logger = require('./config/logger');
const DealScorer = require('./utils/dealScoring');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Routes to check (high-traffic, popular deals)
const ROUTES_TO_CHECK = [
  // From Delhi
  { origin: 'DEL', destination: 'DXB', name: 'Delhi → Dubai' },
  { origin: 'DEL', destination: 'SIN', name: 'Delhi → Singapore' },
  { origin: 'DEL', destination: 'BKK', name: 'Delhi → Bangkok' },
  { origin: 'DEL', destination: 'LHR', name: 'Delhi → London' },
  { origin: 'DEL', destination: 'JFK', name: 'Delhi → New York' },

  // From Mumbai
  { origin: 'BOM', destination: 'DXB', name: 'Mumbai → Dubai' },
  { origin: 'BOM', destination: 'SIN', name: 'Mumbai → Singapore' },
  { origin: 'BOM', destination: 'LHR', name: 'Mumbai → London' },
  { origin: 'BOM', destination: 'JFK', name: 'Mumbai → New York' },

  // From Bangalore
  { origin: 'BLR', destination: 'DXB', name: 'Bengaluru → Dubai' },
  { origin: 'BLR', destination: 'SIN', name: 'Bengaluru → Singapore' },
  { origin: 'BLR', destination: 'LHR', name: 'Bengaluru → London' },

  // Budget-friendly Asian routes
  { origin: 'BOM', destination: 'BKK', name: 'Mumbai → Bangkok' },
  { origin: 'BLR', destination: 'KUL', name: 'Bengaluru → Kuala Lumpur' },
  { origin: 'DEL', destination: 'KTM', name: 'Delhi → Kathmandu' },
  { origin: 'MAA', destination: 'SIN', name: 'Chennai → Singapore' },
];

// Date ranges to check (next 2-4 months for best deals)
function getDateRangesToCheck() {
  const ranges = [];
  const today = new Date();

  // Check departure dates every 2 weeks for next 3 months
  for (let weeks = 4; weeks <= 16; weeks += 2) {
    const departureDate = new Date(today);
    departureDate.setDate(departureDate.getDate() + (weeks * 7));

    // Check different trip durations (7, 10, 14 days)
    [7, 10, 14].forEach(duration => {
      const returnDate = new Date(departureDate);
      returnDate.setDate(returnDate.getDate() + duration);

      ranges.push({
        departure: departureDate.toISOString().split('T')[0],
        return: returnDate.toISOString().split('T')[0],
        duration
      });
    });
  }

  return ranges;
}

// Historical price estimates (for deal detection)
const HISTORICAL_PRICES = {
  // Short-haul Asia (< 4 hours)
  'DEL-DXB': 28000, 'BOM-DXB': 26000, 'BLR-DXB': 25000,
  'DEL-BKK': 25000, 'BOM-BKK': 28000, 'DEL-KTM': 15000,
  'BOM-SIN': 32000, 'DEL-SIN': 35000, 'BLR-SIN': 28000,
  'BLR-KUL': 22000, 'MAA-SIN': 30000,

  // Long-haul (> 8 hours)
  'DEL-LHR': 65000, 'BOM-LHR': 70000, 'BLR-LHR': 72000,
  'DEL-JFK': 95000, 'BOM-JFK': 100000,
};

function getHistoricalPrice(origin, destination) {
  const key = `${origin}-${destination}`;
  return HISTORICAL_PRICES[key] || 50000; // Default estimate
}

async function fetchRealDeals() {
  console.log('\n🚀 Starting REAL Flight Deal Fetcher\n');
  console.log('═══════════════════════════════════════════\n');

  // Check API credentials
  if (!process.env.AMADEUS_API_KEY || !process.env.AMADEUS_API_SECRET) {
    console.error('❌ ERROR: Amadeus API credentials not configured!');
    console.log('\n📋 To get FREE Amadeus API credentials:\n');
    console.log('1. Go to: https://developers.amadeus.com/register');
    console.log('2. Create a free account (no credit card required)');
    console.log('3. Create a new app in your dashboard');
    console.log('4. Copy your API Key and API Secret');
    console.log('5. Update backend/.env:');
    console.log('   AMADEUS_API_KEY=your-api-key-here');
    console.log('   AMADEUS_API_SECRET=your-api-secret-here');
    console.log('\n💡 Free tier includes: 2000 API calls/month\n');
    process.exit(1);
  }

  try {
    // Test API connection
    console.log('🔑 Testing Amadeus API connection...');
    await amadeusService.getAccessToken();
    console.log('✅ Connected to Amadeus API\n');

    const dateRanges = getDateRangesToCheck();
    let dealsFound = 0;
    let routesChecked = 0;
    let apiCalls = 0;

    console.log(`🔍 Checking ${ROUTES_TO_CHECK.length} routes × ${dateRanges.length} date combinations\n`);

    for (const route of ROUTES_TO_CHECK) {
      console.log(`\n📍 ${route.name}`);
      console.log('─'.repeat(50));

      let bestPriceForRoute = null;
      let bestDateForRoute = null;

      for (const dateRange of dateRanges) {
        try {
          apiCalls++;

          // Fetch real flight data from Amadeus
          const flightData = await amadeusService.getFlightPrice(
            route.origin,
            route.destination,
            dateRange.departure,
            dateRange.return
          );

          if (!flightData) {
            process.stdout.write('.');
            continue;
          }

          const currentPrice = flightData.price.amount;
          const historicalPrice = getHistoricalPrice(route.origin, route.destination);
          const discount = ((historicalPrice - currentPrice) / historicalPrice) * 100;

          // Track best price for this route
          if (!bestPriceForRoute || currentPrice < bestPriceForRoute.price.amount) {
            bestPriceForRoute = flightData;
            bestDateForRoute = dateRange;
          }

          // Only save deals with 35%+ discount
          if (discount >= 35) {
            // Save or update flight
            let flight = await Flight.findOne({
              origin: flightData.origin,
              destination: flightData.destination,
              departureDate: flightData.departureDate,
            });

            if (flight) {
              flight.priceHistory.push({
                price: currentPrice,
                timestamp: new Date()
              });
              flight.price = flightData.price;
              flight.lastChecked = new Date();
              await flight.save();
            } else {
              flight = await Flight.create({
                ...flightData,
                priceHistory: [{ price: currentPrice, timestamp: new Date() }],
              });
            }

            // Create deal
            const quality = discount >= 70 && flightData.stops <= 1 ? 'exceptional' :
                           discount >= 55 && flightData.stops <= 1 ? 'excellent' : 'good';

            const deal = await Deal.create({
              flight: flight._id,
              title: `${flightData.originCity} to ${flightData.destinationCity}`,
              description: `Round trip flight with ${flightData.stops} ${flightData.stops === 1 ? 'stop' : 'stops'}`,
              discountPercentage: discount,
              originalPrice: historicalPrice,
              dealPrice: currentPrice,
              savings: historicalPrice - currentPrice,
              dealType: discount >= 70 ? 'mistake_fare' : discount >= 60 ? 'flash_sale' : 'regular',
              quality,
              expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              isActive: true,
            });

            dealsFound++;

            console.log(`\n  🔥 DEAL FOUND!`);
            console.log(`     ${Math.round(discount)}% OFF • ₹${currentPrice.toLocaleString('en-IN')}`);
            console.log(`     ${dateRange.departure} to ${dateRange.return}`);
            console.log(`     ${flightData.airline} • ${flightData.stops === 0 ? 'Non-stop' : `${flightData.stops} stop(s)`}`);
          } else {
            process.stdout.write('.');
          }

          // Rate limiting - wait between requests
          await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error) {
          process.stdout.write('x');
          logger.error(`Error checking ${route.name} on ${dateRange.departure}:`, error.message);
        }
      }

      routesChecked++;

      // Show best price found for this route
      if (bestPriceForRoute) {
        const historicalPrice = getHistoricalPrice(route.origin, route.destination);
        const discount = ((historicalPrice - bestPriceForRoute.price.amount) / historicalPrice) * 100;

        console.log(`\n  💰 Best price: ₹${bestPriceForRoute.price.amount.toLocaleString('en-IN')} (${Math.round(discount)}% off)`);
        console.log(`     ${bestDateForRoute.departure} to ${bestDateForRoute.return}`);
      } else {
        console.log(`\n  ❌ No flights found for this route`);
      }
    }

    console.log('\n\n═══════════════════════════════════════════');
    console.log('📊 SUMMARY');
    console.log('═══════════════════════════════════════════');
    console.log(`✅ Routes checked: ${routesChecked}`);
    console.log(`🔍 API calls made: ${apiCalls}`);
    console.log(`🔥 Deals found (35%+ off): ${dealsFound}`);
    console.log(`💰 Free API calls remaining: ~${2000 - apiCalls}/2000`);

    if (dealsFound > 0) {
      console.log(`\n🎉 Success! Refresh your browser to see ${dealsFound} real deals!`);
      console.log(`🌐 http://localhost:3000\n`);
    } else {
      console.log('\n💡 No deals found matching criteria (35%+ discount)');
      console.log('   This is normal - great deals are rare!');
      console.log('   Try running this script daily to catch deals.\n');
    }

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);

    if (error.message.includes('authenticate')) {
      console.log('\n🔑 Authentication failed. Check your API credentials:');
      console.log('   - AMADEUS_API_KEY in backend/.env');
      console.log('   - AMADEUS_API_SECRET in backend/.env');
      console.log('\n   Get free credentials at: https://developers.amadeus.com/register\n');
    }

    process.exit(1);
  }
}

// Run the fetcher
fetchRealDeals();
