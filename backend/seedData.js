const mongoose = require('mongoose');
require('dotenv').config();
const Flight = require('./models/Flight');
const Deal = require('./models/Deal');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedFlights = [
  {
    origin: 'DEL',
    destination: 'DXB',
    originCity: 'New Delhi',
    destinationCity: 'Dubai',
    airline: 'Emirates',
    departureDate: new Date('2026-06-15'),
    returnDate: new Date('2026-06-22'),
    price: { amount: 18500, currency: 'INR' },
    stops: 0,
    duration: 210,
    cabinClass: 'economy',
    checkedBaggage: true,
    bookingUrl: 'https://www.google.com/travel/flights',
    priceHistory: [
      { price: 32000, timestamp: new Date('2026-04-01') },
      { price: 18500, timestamp: new Date() }
    ]
  },
  {
    origin: 'BOM',
    destination: 'SIN',
    originCity: 'Mumbai',
    destinationCity: 'Singapore',
    airline: 'Singapore Airlines',
    departureDate: new Date('2026-07-10'),
    returnDate: new Date('2026-07-17'),
    price: { amount: 22000, currency: 'INR' },
    stops: 0,
    duration: 315,
    cabinClass: 'economy',
    checkedBaggage: true,
    bookingUrl: 'https://www.google.com/travel/flights',
    priceHistory: [
      { price: 45000, timestamp: new Date('2026-03-15') },
      { price: 22000, timestamp: new Date() }
    ]
  },
  {
    origin: 'BLR',
    destination: 'LHR',
    originCity: 'Bengaluru',
    destinationCity: 'London',
    airline: 'British Airways',
    departureDate: new Date('2026-08-05'),
    returnDate: new Date('2026-08-19'),
    price: { amount: 35000, currency: 'INR' },
    stops: 1,
    duration: 600,
    cabinClass: 'economy',
    checkedBaggage: true,
    bookingUrl: 'https://www.google.com/travel/flights',
    priceHistory: [
      { price: 75000, timestamp: new Date('2026-03-01') },
      { price: 35000, timestamp: new Date() }
    ]
  },
  {
    origin: 'DEL',
    destination: 'BKK',
    originCity: 'New Delhi',
    destinationCity: 'Bangkok',
    airline: 'Thai Airways',
    departureDate: new Date('2026-05-20'),
    returnDate: new Date('2026-05-27'),
    price: { amount: 15000, currency: 'INR' },
    stops: 0,
    duration: 270,
    cabinClass: 'economy',
    checkedBaggage: true,
    bookingUrl: 'https://www.google.com/travel/flights',
    priceHistory: [
      { price: 28000, timestamp: new Date('2026-03-20') },
      { price: 15000, timestamp: new Date() }
    ]
  },
  {
    origin: 'HYD',
    destination: 'CDG',
    originCity: 'Hyderabad',
    destinationCity: 'Paris',
    airline: 'Air France',
    departureDate: new Date('2026-09-12'),
    returnDate: new Date('2026-09-26'),
    price: { amount: 28000, currency: 'INR' },
    stops: 1,
    duration: 720,
    cabinClass: 'economy',
    checkedBaggage: true,
    bookingUrl: 'https://www.google.com/travel/flights',
    priceHistory: [
      { price: 82000, timestamp: new Date('2026-02-15') },
      { price: 28000, timestamp: new Date() }
    ]
  },
  {
    origin: 'MAA',
    destination: 'KUL',
    originCity: 'Chennai',
    destinationCity: 'Kuala Lumpur',
    airline: 'AirAsia',
    departureDate: new Date('2026-06-01'),
    returnDate: new Date('2026-06-08'),
    price: { amount: 12000, currency: 'INR' },
    stops: 0,
    duration: 240,
    cabinClass: 'economy',
    checkedBaggage: false,
    bookingUrl: 'https://www.google.com/travel/flights',
    priceHistory: [
      { price: 19000, timestamp: new Date('2026-03-10') },
      { price: 12000, timestamp: new Date() }
    ]
  },
  {
    origin: 'BOM',
    destination: 'JFK',
    originCity: 'Mumbai',
    destinationCity: 'New York',
    airline: 'Air India',
    departureDate: new Date('2026-10-15'),
    returnDate: new Date('2026-10-29'),
    price: { amount: 42000, currency: 'INR' },
    stops: 1,
    duration: 900,
    cabinClass: 'economy',
    checkedBaggage: true,
    bookingUrl: 'https://www.google.com/travel/flights',
    priceHistory: [
      { price: 145000, timestamp: new Date('2026-02-01') },
      { price: 42000, timestamp: new Date() }
    ]
  },
  {
    origin: 'DEL',
    destination: 'IST',
    originCity: 'New Delhi',
    destinationCity: 'Istanbul',
    airline: 'Turkish Airlines',
    departureDate: new Date('2026-07-25'),
    returnDate: new Date('2026-08-02'),
    price: { amount: 24000, currency: 'INR' },
    stops: 0,
    duration: 360,
    cabinClass: 'economy',
    checkedBaggage: true,
    bookingUrl: 'https://www.google.com/travel/flights',
    priceHistory: [
      { price: 55000, timestamp: new Date('2026-03-05') },
      { price: 24000, timestamp: new Date() }
    ]
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...');

    // Clear existing data
    await Flight.deleteMany({});
    await Deal.deleteMany({});
    console.log('✅ Cleared existing data');

    // Insert flights
    const insertedFlights = await Flight.insertMany(seedFlights);
    console.log(`✅ Inserted ${insertedFlights.length} flights`);

    // Create deals from flights
    const deals = [];
    for (const flight of insertedFlights) {
      const originalPrice = flight.priceHistory[0].price;
      const currentPrice = flight.price.amount;
      const discount = ((originalPrice - currentPrice) / originalPrice) * 100;

      let quality = 'good';
      if (discount >= 70 && flight.stops <= 1) quality = 'exceptional';
      else if (discount >= 55 && flight.stops <= 1) quality = 'excellent';

      const deal = {
        flight: flight._id,
        title: `${flight.originCity} to ${flight.destinationCity}`,
        description: `Round trip flight with ${flight.stops} ${flight.stops === 1 ? 'stop' : 'stops'}`,
        discountPercentage: discount,
        originalPrice: originalPrice,
        dealPrice: currentPrice,
        savings: originalPrice - currentPrice,
        dealType: discount >= 70 ? 'mistake_fare' : discount >= 60 ? 'flash_sale' : 'regular',
        quality: quality,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true,
      };

      deals.push(deal);
    }

    const insertedDeals = await Deal.insertMany(deals);
    console.log(`✅ Created ${insertedDeals.length} deals`);

    console.log('');
    console.log('📊 Sample deals created:');
    insertedDeals.forEach(deal => {
      console.log(`  🔥 ${deal.title}: ${deal.discountPercentage.toFixed(0)}% off (${deal.quality})`);
    });

    console.log('');
    console.log('✅ Database seeded successfully!');
    console.log('🚀 Refresh your browser to see the deals');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
