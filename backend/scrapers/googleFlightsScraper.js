/**
 * Google Flights Scraper
 * Scrapes real-time flight prices from Google Flights
 */

const puppeteer = require('puppeteer');
const logger = require('../config/logger');

class GoogleFlightsScraper {
  constructor() {
    this.baseUrl = 'https://www.google.com/travel/flights';
  }

  /**
   * Search flights on Google Flights
   */
  async searchFlights(origin, destination, departureDate, returnDate) {
    let browser;
    try {
      logger.info(`Google Flights: Searching ${origin} → ${destination}`);

      // Launch headless browser
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });

      const page = await browser.newPage();

      // Set viewport and user agent
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');

      // Build Google Flights URL
      const url = `https://www.google.com/travel/flights?q=Flights%20to%20${destination}%20from%20${origin}%20on%20${departureDate}%20through%20${returnDate}`;

      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait for results to load
      await page.waitForTimeout(5000);

      // Extract flight data
      const flights = await page.evaluate(() => {
        const results = [];

        // Google Flights uses specific class names (may change)
        const flightCards = document.querySelectorAll('[jsname="IWWDBc"], .pIav2d');

        flightCards.forEach((card, index) => {
          if (index >= 10) return; // Limit to top 10

          try {
            // Extract price
            const priceElement = card.querySelector('[data-gs], .YMlIz');
            const price = priceElement ? priceElement.textContent.replace(/[₹,]/g, '').trim() : null;

            // Extract airline
            const airlineElement = card.querySelector('.sSHqwe, .Ir0Voe');
            const airline = airlineElement ? airlineElement.textContent.trim() : null;

            // Extract duration
            const durationElement = card.querySelector('.gvkrdb, .Ak5kof');
            const duration = durationElement ? durationElement.textContent.trim() : null;

            // Extract stops
            const stopsElement = card.querySelector('.EfT7Ae, .ogfYpf');
            const stops = stopsElement ? stopsElement.textContent.trim() : 'Non-stop';

            if (price && airline) {
              results.push({
                price: parseInt(price),
                airline: airline,
                duration: duration,
                stops: stops.includes('Non') ? 0 : (stops.match(/\d+/) ? parseInt(stops.match(/\d+/)[0]) : 1),
                source: 'Google Flights'
              });
            }
          } catch (err) {
            // Skip problematic cards
          }
        });

        return results;
      });

      await browser.close();

      if (flights.length === 0) {
        logger.warn(`Google Flights: No flights found for ${origin}-${destination}`);
        return null;
      }

      // Return cheapest flight
      const cheapest = flights.reduce((prev, curr) =>
        curr.price < prev.price ? curr : prev
      );

      logger.info(`Google Flights: Found ${flights.length} flights, cheapest: ₹${cheapest.price}`);

      return {
        ...cheapest,
        origin,
        destination,
        departureDate: new Date(departureDate),
        returnDate: new Date(returnDate),
        allFlights: flights
      };

    } catch (error) {
      logger.error(`Google Flights scraper error (${origin}-${destination}):`, error.message);
      if (browser) await browser.close();
      return null;
    }
  }

  /**
   * Search multiple routes
   */
  async searchMultipleRoutes(routes) {
    const results = [];

    for (const route of routes) {
      const flight = await this.searchFlights(
        route.origin,
        route.destination,
        route.departureDate,
        route.returnDate
      );

      if (flight) {
        results.push(flight);
      }

      // Rate limiting - wait between requests
      await this.delay(3000);
    }

    return results;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new GoogleFlightsScraper();
