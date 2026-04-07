/**
 * Skyscanner Scraper
 * Scrapes flight prices from Skyscanner.co.in
 */

const puppeteer = require('puppeteer');
const logger = require('../config/logger');

class SkyscannerScraper {
  constructor() {
    this.baseUrl = 'https://www.skyscanner.co.in';
  }

  /**
   * Search flights on Skyscanner
   */
  async searchFlights(origin, destination, departureDate, returnDate) {
    let browser;
    try {
      logger.info(`Skyscanner: Searching ${origin} → ${destination}`);

      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');

      // Format dates (YYMMDD)
      const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        const yy = d.getFullYear().toString().slice(-2);
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yy}${mm}${dd}`;
      };

      const depDate = formatDate(departureDate);
      const retDate = formatDate(returnDate);

      // Build Skyscanner URL
      const url = `${this.baseUrl}/transport/flights/${origin.toLowerCase()}/${destination.toLowerCase()}/${depDate}/${retDate}/?adultsv2=1&cabinclass=economy&childrenv2=&inboundaltsenabled=false&outboundaltsenabled=false&preferdirects=false&ref=home&rtn=1`;

      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait for results
      await page.waitForTimeout(10000);

      // Click "Show more" if available
      try {
        const showMoreBtn = await page.$('[data-testid="show-more-button"]');
        if (showMoreBtn) {
          await showMoreBtn.click();
          await page.waitForTimeout(3000);
        }
      } catch (e) {
        // No show more button
      }

      // Extract flight data
      const flights = await page.evaluate(() => {
        const results = [];

        // Skyscanner flight cards
        const cards = document.querySelectorAll('[data-testid*="itinerary"], [class*="FlightsTicket"]');

        cards.forEach((card, index) => {
          if (index >= 10) return;

          try {
            // Price
            const priceEl = card.querySelector('[data-testid*="price"], [class*="Price"]');
            const price = priceEl ? priceEl.textContent.replace(/[₹,]/g, '').trim() : null;

            // Airline
            const airlineEl = card.querySelector('[data-testid*="carrier-name"], [class*="Carrier"]');
            const airline = airlineEl ? airlineEl.textContent.trim() : null;

            // Duration
            const durationEl = card.querySelector('[data-testid*="duration"], [class*="Duration"]');
            const duration = durationEl ? durationEl.textContent.trim() : null;

            // Stops
            const stopsEl = card.querySelector('[data-testid*="stops"], [class*="Stops"]');
            let stops = 0;
            if (stopsEl) {
              const text = stopsEl.textContent.toLowerCase();
              if (text.includes('direct') || text.includes('non')) stops = 0;
              else if (text.includes('1')) stops = 1;
              else if (text.includes('2')) stops = 2;
            }

            if (price && airline) {
              results.push({
                price: parseInt(price),
                airline: airline,
                duration: duration,
                stops: stops,
                source: 'Skyscanner'
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
        logger.warn(`Skyscanner: No flights found for ${origin}-${destination}`);
        return null;
      }

      const cheapest = flights.reduce((prev, curr) =>
        curr.price < prev.price ? curr : prev
      );

      logger.info(`Skyscanner: Found ${flights.length} flights, cheapest: ₹${cheapest.price}`);

      return {
        ...cheapest,
        origin,
        destination,
        departureDate: new Date(departureDate),
        returnDate: new Date(returnDate),
        allFlights: flights
      };

    } catch (error) {
      logger.error(`Skyscanner scraper error (${origin}-${destination}):`, error.message);
      if (browser) await browser.close();
      return null;
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new SkyscannerScraper();
