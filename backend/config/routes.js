/**
 * Comprehensive Route Configuration
 * Major Indian cities to all popular international destinations
 */

// Major Indian Origin Cities
const INDIAN_CITIES = [
  { code: 'DEL', city: 'Delhi', name: 'Indira Gandhi International Airport' },
  { code: 'BOM', city: 'Mumbai', name: 'Chhatrapati Shivaji Maharaj International Airport' },
  { code: 'BLR', city: 'Bengaluru', name: 'Kempegowda International Airport' },
  { code: 'HYD', city: 'Hyderabad', name: 'Rajiv Gandhi International Airport' },
  { code: 'MAA', city: 'Chennai', name: 'Chennai International Airport' },
  { code: 'CCU', city: 'Kolkata', name: 'Netaji Subhas Chandra Bose International Airport' },
  { code: 'COK', city: 'Kochi', name: 'Cochin International Airport' },
  { code: 'PNQ', city: 'Pune', name: 'Pune Airport' },
  { code: 'AMD', city: 'Ahmedabad', name: 'Sardar Vallabhbhai Patel International Airport' },
  { code: 'GOI', city: 'Goa', name: 'Dabolim Airport' },
];

// International Destinations by Region
const DESTINATIONS = {
  // SOUTHEAST ASIA
  singapore: [
    { code: 'SIN', city: 'Singapore', country: 'Singapore' }
  ],
  thailand: [
    { code: 'BKK', city: 'Bangkok', country: 'Thailand' },
    { code: 'HKT', city: 'Phuket', country: 'Thailand' },
    { code: 'CNX', city: 'Chiang Mai', country: 'Thailand' }
  ],
  malaysia: [
    { code: 'KUL', city: 'Kuala Lumpur', country: 'Malaysia' },
    { code: 'PEN', city: 'Penang', country: 'Malaysia' }
  ],
  indonesia: [
    { code: 'DPS', city: 'Bali', country: 'Indonesia' },
    { code: 'CGK', city: 'Jakarta', country: 'Indonesia' }
  ],
  vietnam: [
    { code: 'SGN', city: 'Ho Chi Minh City', country: 'Vietnam' },
    { code: 'HAN', city: 'Hanoi', country: 'Vietnam' }
  ],
  philippines: [
    { code: 'MNL', city: 'Manila', country: 'Philippines' }
  ],

  // EAST ASIA
  japan: [
    { code: 'NRT', city: 'Tokyo (Narita)', country: 'Japan' },
    { code: 'HND', city: 'Tokyo (Haneda)', country: 'Japan' },
    { code: 'KIX', city: 'Osaka', country: 'Japan' },
    { code: 'FUK', city: 'Fukuoka', country: 'Japan' },
    { code: 'CTS', city: 'Sapporo', country: 'Japan' }
  ],
  korea: [
    { code: 'ICN', city: 'Seoul (Incheon)', country: 'South Korea' },
    { code: 'GMP', city: 'Seoul (Gimpo)', country: 'South Korea' },
    { code: 'PUS', city: 'Busan', country: 'South Korea' }
  ],
  china: [
    { code: 'PEK', city: 'Beijing', country: 'China' },
    { code: 'PVG', city: 'Shanghai (Pudong)', country: 'China' },
    { code: 'SHA', city: 'Shanghai (Hongqiao)', country: 'China' },
    { code: 'CAN', city: 'Guangzhou', country: 'China' },
    { code: 'SZX', city: 'Shenzhen', country: 'China' }
  ],
  hongkong: [
    { code: 'HKG', city: 'Hong Kong', country: 'Hong Kong' }
  ],
  taiwan: [
    { code: 'TPE', city: 'Taipei', country: 'Taiwan' }
  ],

  // MIDDLE EAST
  uae: [
    { code: 'DXB', city: 'Dubai', country: 'UAE' },
    { code: 'AUH', city: 'Abu Dhabi', country: 'UAE' }
  ],
  qatar: [
    { code: 'DOH', city: 'Doha', country: 'Qatar' }
  ],
  turkey: [
    { code: 'IST', city: 'Istanbul', country: 'Turkey' },
    { code: 'SAW', city: 'Istanbul (Sabiha)', country: 'Turkey' },
    { code: 'AYT', city: 'Antalya', country: 'Turkey' }
  ],
  oman: [
    { code: 'MCT', city: 'Muscat', country: 'Oman' }
  ],
  bahrain: [
    { code: 'BAH', city: 'Bahrain', country: 'Bahrain' }
  ],

  // SOUTH ASIA
  nepal: [
    { code: 'KTM', city: 'Kathmandu', country: 'Nepal' }
  ],
  srilanka: [
    { code: 'CMB', city: 'Colombo', country: 'Sri Lanka' }
  ],
  maldives: [
    { code: 'MLE', city: 'Male', country: 'Maldives' }
  ],

  // EUROPE
  uk: [
    { code: 'LHR', city: 'London (Heathrow)', country: 'UK' },
    { code: 'LGW', city: 'London (Gatwick)', country: 'UK' },
    { code: 'MAN', city: 'Manchester', country: 'UK' }
  ],
  france: [
    { code: 'CDG', city: 'Paris', country: 'France' },
    { code: 'ORY', city: 'Paris (Orly)', country: 'France' }
  ],
  germany: [
    { code: 'FRA', city: 'Frankfurt', country: 'Germany' },
    { code: 'MUC', city: 'Munich', country: 'Germany' },
    { code: 'BER', city: 'Berlin', country: 'Germany' }
  ],
  netherlands: [
    { code: 'AMS', city: 'Amsterdam', country: 'Netherlands' }
  ],
  switzerland: [
    { code: 'ZRH', city: 'Zurich', country: 'Switzerland' }
  ],
  italy: [
    { code: 'FCO', city: 'Rome', country: 'Italy' },
    { code: 'MXP', city: 'Milan', country: 'Italy' }
  ],
  spain: [
    { code: 'MAD', city: 'Madrid', country: 'Spain' },
    { code: 'BCN', city: 'Barcelona', country: 'Spain' }
  ],

  // NORTH AMERICA
  usa_east: [
    { code: 'JFK', city: 'New York', country: 'USA' },
    { code: 'EWR', city: 'Newark', country: 'USA' },
    { code: 'BOS', city: 'Boston', country: 'USA' },
    { code: 'IAD', city: 'Washington DC', country: 'USA' },
    { code: 'MIA', city: 'Miami', country: 'USA' },
    { code: 'ORD', city: 'Chicago', country: 'USA' }
  ],
  usa_west: [
    { code: 'SFO', city: 'San Francisco', country: 'USA' },
    { code: 'LAX', city: 'Los Angeles', country: 'USA' },
    { code: 'SEA', city: 'Seattle', country: 'USA' },
    { code: 'LAS', city: 'Las Vegas', country: 'USA' }
  ],
  usa_south: [
    { code: 'DFW', city: 'Dallas', country: 'USA' },
    { code: 'IAH', city: 'Houston', country: 'USA' },
    { code: 'ATL', city: 'Atlanta', country: 'USA' }
  ],
  canada: [
    { code: 'YYZ', city: 'Toronto', country: 'Canada' },
    { code: 'YVR', city: 'Vancouver', country: 'Canada' }
  ],

  // OCEANIA
  australia: [
    { code: 'SYD', city: 'Sydney', country: 'Australia' },
    { code: 'MEL', city: 'Melbourne', country: 'Australia' },
    { code: 'PER', city: 'Perth', country: 'Australia' }
  ],
  newzealand: [
    { code: 'AKL', city: 'Auckland', country: 'New Zealand' }
  ],

  // AFRICA
  kenya: [
    { code: 'NBO', city: 'Nairobi', country: 'Kenya' }
  ],
  southafrica: [
    { code: 'JNB', city: 'Johannesburg', country: 'South Africa' },
    { code: 'CPT', city: 'Cape Town', country: 'South Africa' }
  ],
  mauritius: [
    { code: 'MRU', city: 'Mauritius', country: 'Mauritius' }
  ],
  seychelles: [
    { code: 'SEZ', city: 'Seychelles', country: 'Seychelles' }
  ]
};

// Flatten all destinations
const getAllDestinations = () => {
  const all = [];
  Object.values(DESTINATIONS).forEach(region => {
    all.push(...region);
  });
  return all;
};

// Generate all possible routes
const generateAllRoutes = () => {
  const routes = [];
  const destinations = getAllDestinations();

  INDIAN_CITIES.forEach(origin => {
    destinations.forEach(destination => {
      routes.push({
        origin: origin.code,
        destination: destination.code,
        originCity: origin.city,
        destinationCity: destination.city,
        destinationCountry: destination.country
      });
    });
  });

  return routes;
};

// Get popular routes (for batch scraping)
const getPopularRoutes = () => {
  return [
    // Most searched routes
    ...generateRoutesForDestinations(DESTINATIONS.uae),
    ...generateRoutesForDestinations(DESTINATIONS.singapore),
    ...generateRoutesForDestinations(DESTINATIONS.thailand),
    ...generateRoutesForDestinations(DESTINATIONS.uk),
    ...generateRoutesForDestinations(DESTINATIONS.usa_east.slice(0, 2)), // NYC, Newark
    ...generateRoutesForDestinations(DESTINATIONS.usa_west.slice(0, 2)), // SFO, LAX
  ].slice(0, 50); // Top 50 most popular
};

function generateRoutesForDestinations(destinations) {
  const routes = [];
  // Use top 3 Indian cities for popular routes
  const topCities = INDIAN_CITIES.slice(0, 3); // DEL, BOM, BLR

  topCities.forEach(origin => {
    destinations.forEach(destination => {
      routes.push({
        origin: origin.code,
        destination: destination.code,
        originCity: origin.city,
        destinationCity: destination.city,
        destinationCountry: destination.country
      });
    });
  });

  return routes;
}

// Search functionality
const findRoute = (origin, destination) => {
  const originCity = INDIAN_CITIES.find(c => c.code === origin.toUpperCase());
  const allDestinations = getAllDestinations();
  const destCity = allDestinations.find(d => d.code === destination.toUpperCase());

  if (!originCity || !destCity) return null;

  return {
    origin: originCity.code,
    destination: destCity.code,
    originCity: originCity.city,
    destinationCity: destCity.city,
    destinationCountry: destCity.country
  };
};

module.exports = {
  INDIAN_CITIES,
  DESTINATIONS,
  getAllDestinations,
  generateAllRoutes,
  getPopularRoutes,
  findRoute
};
