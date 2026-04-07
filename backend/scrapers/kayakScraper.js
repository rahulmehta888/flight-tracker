/**
 * Kayak Scraper
 * Scrapes flight prices from Kayak.co.in
 */

const puppeteer = require('puppeteer');
const logger = require('../config/logger');

class KayakScraper {
  constructor() {
    this.baseUrl = 'https://www.kayak.co.in';
  }

  /**
   * Search flights on Kayak
   */
  async searchFlights(origin, destination, departureDate, returnDate) {
    let browser;
    try {
      logger.info(`Kayak: Searching ${origin} → ${destination}`);

      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');

      // Format dates for Kayak (YYYY-MM-DD)
      const depDate = departureDate.split('-').join('-');
      const retDate = returnDate.split('-').join('-');

      // Build Kayak URL
      const url = `${this.baseUrl}/flights/${origin}-${destination}/${depDate}/${retDate}?sort=bestflight_a`;

      await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      // Wait for results
      await page.waitForTimeout(8000);

      // Extract flight data
      const flights = await page.evaluate(() => {
        const results = [];

        // Kayak result containers
        const flightDivs = document.querySelectorAll('[class*="resultWrapper"], [class*="result-"]');

        flightDivs.forEach((div, index) => {
          if (index >= 10) return;

          try {
            // Price
            const priceEl = div.querySelector('[class*="price-text"], .f8F1-price-text');
            const price = priceEl ? priceEl.textContent.replace(/[₹,]/g, '').trim() : null;

            // Airline
            const airlineEl = div.querySelector('[class*="codeshares-airline-names"]');
            const airline = airlineEl ? airlineEl.textContent.split(',')[0].trim() : null;

            // Duration
            const durationEl = div.querySelector('[class*="duration"]');
            const duration = durationEl ? durationEl.textContent.trim() : null;

            // Stops
            const stopsEl = div.querySelector('[class*="stops"]');
            let stops = 0;
            if (stopsEl) {
              const text = stopsEl.textContent.toLowerCase();
              if (text.includes('nonstop') || text.includes('direct')) stops = 0;
              else if (text.includes('1')) stops = 1;
              else if (text.includes('2')) stops = 2;
            }

            if (price && airline) {
              results.push({
                price: parseInt(price),
                airline: airline,
                duration: duration,
                stops: stops,
                source: 'Kayak'
              });
            }
          } catch (err) {
            // Skip
          }
        });

        return results;
      });

      await browser.close();

      if (flights.length === 0) {
        logger.warn(`Kayak: No flights found for ${origin}-${destination}`);
        return null;
      }

      const cheapest = flights.reduce((prev, curr) =>
        curr.price < prev.price ? curr : prev
      );

      logger.info(`Kayak: Found ${flights.length} flights, cheapest: ₹${cheapest.price}`);

      return {
        ...cheapest,
        origin,
        destination,
        departureDate: new Date(departureDate),
        returnDate: new Date(returnDate),
        allFlights: flights
      };

    } catch (error) {
      logger.error(`Kayak scraper error (${origin}-${destination}):`, error.message);
      if (browser) await browser.close();
      return null;
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new KayakScraper();
