const axios = require('axios');
const logger = require('../config/logger');

class AmadeusService {
  constructor() {
    this.apiKey = process.env.AMADEUS_API_KEY;
    this.apiSecret = process.env.AMADEUS_API_SECRET;
    this.apiUrl = process.env.AMADEUS_API_URL || 'https://test.api.amadeus.com';
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  // Get OAuth2 access token
  async getAccessToken() {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(
        `${this.apiUrl}/v1/security/oauth2/token`,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.apiKey,
          client_secret: this.apiSecret,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.accessToken = response.data.access_token;
      // Set expiry 1 minute before actual expiry
      this.tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;

      logger.info('Amadeus API token refreshed');
      return this.accessToken;
    } catch (error) {
      logger.error('Failed to get Amadeus access token:', error.message);
      throw new Error('Failed to authenticate with Amadeus API');
    }
  }

  // Search for flight offers
  async searchFlights(params) {
    try {
      const token = await this.getAccessToken();

      const response = await axios.get(
        `${this.apiUrl}/v2/shopping/flight-offers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            originLocationCode: params.origin,
            destinationLocationCode: params.destination,
            departureDate: params.departureDate,
            returnDate: params.returnDate,
            adults: params.adults || 1,
            max: params.max || 50,
            currencyCode: 'INR',
            ...params.additionalParams,
          },
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Flight search error:', error.message);
      throw new Error('Failed to search flights');
    }
  }

  // Get flight price for specific route
  async getFlightPrice(origin, destination, departureDate, returnDate) {
    try {
      const results = await this.searchFlights({
        origin,
        destination,
        departureDate,
        returnDate,
        max: 10,
      });

      if (!results.data || results.data.length === 0) {
        return null;
      }

      // Return cheapest flight
      const cheapestFlight = results.data.reduce((prev, current) => {
        return parseFloat(prev.price.total) < parseFloat(current.price.total) ? prev : current;
      });

      return this.formatFlightData(cheapestFlight);
    } catch (error) {
      logger.error(`Failed to get price for ${origin}-${destination}:`, error.message);
      return null;
    }
  }

  // Format Amadeus flight data to our schema
  formatFlightData(flightOffer) {
    const itineraries = flightOffer.itineraries || [];
    const firstItinerary = itineraries[0] || {};
    const segments = firstItinerary.segments || [];
    const firstSegment = segments[0] || {};

    // Calculate total stops
    const stops = segments.length - 1;

    // Calculate layover duration if there are stops
    let layoverDuration = 0;
    if (stops > 0) {
      for (let i = 0; i < segments.length - 1; i++) {
        const arrival = new Date(segments[i].arrival.at);
        const nextDeparture = new Date(segments[i + 1].departure.at);
        layoverDuration += (nextDeparture - arrival) / (1000 * 60); // in minutes
      }
    }

    // Calculate total duration
    const departure = new Date(firstSegment.departure.at);
    const lastSegment = segments[segments.length - 1];
    const arrival = new Date(lastSegment.arrival.at);
    const duration = (arrival - departure) / (1000 * 60); // in minutes

    return {
      origin: firstSegment.departure.iataCode,
      destination: lastSegment.arrival.iataCode,
      originCity: firstSegment.departure.cityCode || firstSegment.departure.iataCode,
      destinationCity: lastSegment.arrival.cityCode || lastSegment.arrival.iataCode,
      departureDate: new Date(firstSegment.departure.at),
      returnDate: itineraries[1] ? new Date(itineraries[1].segments[0].departure.at) : null,
      airline: firstSegment.carrierCode,
      flightNumber: firstSegment.number,
      price: {
        amount: parseFloat(flightOffer.price.total),
        currency: flightOffer.price.currency,
      },
      cabinClass: segments[0].cabin?.toLowerCase() || 'economy',
      stops,
      layoverDuration,
      duration,
      checkedBaggage: flightOffer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.includedCheckedBags?.quantity > 0,
      bookingUrl: `https://www.google.com/flights#flt=${firstSegment.departure.iataCode}.${lastSegment.arrival.iataCode}.${firstSegment.departure.at.split('T')[0]}`,
    };
  }

  // Get popular Indian airports
  getIndianAirports() {
    return [
      { code: 'DEL', city: 'Delhi', name: 'Indira Gandhi International' },
      { code: 'BOM', city: 'Mumbai', name: 'Chhatrapati Shivaji Maharaj International' },
      { code: 'BLR', city: 'Bengaluru', name: 'Kempegowda International' },
      { code: 'HYD', city: 'Hyderabad', name: 'Rajiv Gandhi International' },
      { code: 'MAA', city: 'Chennai', name: 'Chennai International' },
      { code: 'COK', city: 'Kochi', name: 'Cochin International' },
      { code: 'CCU', city: 'Kolkata', name: 'Netaji Subhas Chandra Bose International' },
    ];
  }

  // Get popular international destinations
  getPopularDestinations() {
    return [
      'DXB', 'SIN', 'BKK', 'KUL', 'HKG', 'LHR', 'JFK', 'LAX',
      'SFO', 'CDG', 'FRA', 'AMS', 'SYD', 'MEL', 'NRT', 'ICN'
    ];
  }
}

module.exports = new AmadeusService();
