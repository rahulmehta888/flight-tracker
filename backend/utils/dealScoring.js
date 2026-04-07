/**
 * AI Deal Scoring System
 * Rates deals 1-100 based on multiple factors
 */

class DealScorer {
  /**
   * Calculate comprehensive deal score
   * @param {Object} deal - Deal object with populated flight
   * @returns {Object} - Score and breakdown
   */
  static calculateScore(deal) {
    const flight = deal.flight;
    const scores = {};

    // 1. Price Score (40 points) - Based on discount percentage
    scores.price = this.calculatePriceScore(deal.discountPercentage);

    // 2. Airline Quality (15 points) - Based on airline reputation
    scores.airline = this.calculateAirlineScore(flight.airline);

    // 3. Flight Timing (15 points) - Avoid red-eyes, prefer daytime
    scores.timing = this.calculateTimingScore(flight.departureDate);

    // 4. Stops/Duration (15 points) - Non-stop is best
    scores.convenience = this.calculateConvenienceScore(flight.stops, flight.duration);

    // 5. Baggage & Perks (10 points)
    scores.perks = this.calculatePerksScore(flight.checkedBaggage);

    // 6. Booking Urgency (5 points) - How soon you need to book
    scores.urgency = this.calculateUrgencyScore(deal.expiryDate, flight.departureDate);

    // Calculate total
    const total = Object.values(scores).reduce((sum, score) => sum + score, 0);

    // Generate explanation
    const explanation = this.generateExplanation(scores, deal, flight);

    // Determine rating category
    const rating = this.getRating(total);

    return {
      total: Math.round(total),
      breakdown: scores,
      rating,
      explanation,
      badges: this.getBadges(total, deal, flight)
    };
  }

  static calculatePriceScore(discountPercentage) {
    // 40-49% = 25 points
    // 50-59% = 30 points
    // 60-69% = 35 points
    // 70%+ = 40 points
    if (discountPercentage >= 70) return 40;
    if (discountPercentage >= 60) return 35;
    if (discountPercentage >= 50) return 30;
    if (discountPercentage >= 40) return 25;
    return 20;
  }

  static calculateAirlineScore(airline) {
    const airlineRatings = {
      'Emirates': 15,
      'Singapore Airlines': 15,
      'Qatar Airways': 15,
      'Etihad Airways': 14,
      'British Airways': 13,
      'Air France': 13,
      'Lufthansa': 13,
      'Turkish Airlines': 12,
      'Thai Airways': 12,
      'Air India': 10,
      'IndiGo': 9,
      'AirAsia': 8,
      'SpiceJet': 7,
    };
    return airlineRatings[airline] || 10;
  }

  static calculateTimingScore(departureDate) {
    const hour = new Date(departureDate).getHours();

    // Best: 8am-11am (15 points)
    if (hour >= 8 && hour < 11) return 15;

    // Good: 11am-5pm (12 points)
    if (hour >= 11 && hour < 17) return 12;

    // Okay: 5pm-9pm (10 points)
    if (hour >= 17 && hour < 21) return 10;

    // Red-eye: 9pm-6am (5 points)
    return 5;
  }

  static calculateConvenienceScore(stops, duration) {
    let score = 0;

    // Stops penalty
    if (stops === 0) score += 10;
    else if (stops === 1) score += 6;
    else score += 2;

    // Duration bonus (shorter is better, up to 5 points)
    if (duration < 300) score += 5; // Under 5 hours
    else if (duration < 420) score += 4; // Under 7 hours
    else if (duration < 600) score += 3; // Under 10 hours
    else score += 2;

    return Math.min(score, 15);
  }

  static calculatePerksScore(hasCheckedBaggage) {
    return hasCheckedBaggage ? 10 : 5;
  }

  static calculateUrgencyScore(expiryDate, departureDate) {
    const now = new Date();
    const daysUntilExpiry = Math.ceil((new Date(expiryDate) - now) / (1000 * 60 * 60 * 24));
    const daysUntilDeparture = Math.ceil((new Date(departureDate) - now) / (1000 * 60 * 60 * 24));

    // Expiring soon = book now!
    if (daysUntilExpiry < 1) return 5;
    if (daysUntilExpiry < 3) return 4;

    // Sweet spot: 2-3 months before departure
    if (daysUntilDeparture >= 60 && daysUntilDeparture <= 90) return 5;
    if (daysUntilDeparture >= 45 && daysUntilDeparture <= 120) return 4;

    return 3;
  }

  static getRating(score) {
    if (score >= 90) return 'Exceptional';
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Very Good';
    if (score >= 60) return 'Good';
    return 'Fair';
  }

  static generateExplanation(scores, deal, flight) {
    const parts = [];

    if (scores.price >= 35) {
      parts.push(`${deal.discountPercentage.toFixed(0)}% off - incredible savings!`);
    } else {
      parts.push(`${deal.discountPercentage.toFixed(0)}% off`);
    }

    if (scores.airline >= 13) {
      parts.push(`${flight.airline} - premium carrier`);
    }

    if (flight.stops === 0) {
      parts.push('non-stop flight');
    }

    if (scores.timing >= 12) {
      parts.push('great departure time');
    }

    if (flight.checkedBaggage) {
      parts.push('baggage included');
    }

    return parts.join(', ');
  }

  static getBadges(score, deal, flight) {
    const badges = [];

    if (score >= 90) badges.push({ text: '🏆 Best Deal', color: '#10b981' });
    if (deal.discountPercentage >= 70) badges.push({ text: '🔥 Mistake Fare', color: '#ef4444' });
    if (flight.stops === 0) badges.push({ text: '✈️ Non-Stop', color: '#667eea' });
    if (flight.checkedBaggage) badges.push({ text: '🧳 Baggage', color: '#f59e0b' });
    if (deal.dealType === 'flash_sale') badges.push({ text: '⚡ Flash Sale', color: '#ec4899' });

    return badges;
  }

  /**
   * Calculate historical price context
   */
  static getPriceContext(originalPrice, currentPrice) {
    const avgPrice = originalPrice; // In real app, calculate from historical data
    const percentBelow = ((avgPrice - currentPrice) / avgPrice) * 100;

    let context = '';
    if (percentBelow >= 60) context = '🔥 WAY below average';
    else if (percentBelow >= 40) context = '💰 Well below average';
    else if (percentBelow >= 20) context = '👍 Below average';
    else context = '📊 Average price';

    return {
      context,
      avgPrice,
      percentBelow: percentBelow.toFixed(0)
    };
  }

  /**
   * Calculate true cost including typical additional fees
   */
  static calculateTrueCost(flight, dealPrice) {
    let trueCost = dealPrice;
    const addons = [];

    // Baggage
    if (!flight.checkedBaggage) {
      trueCost += 2000; // Typical checked bag cost
      addons.push({ item: 'Checked bag', cost: 2000 });
    }

    // Seat selection (optional)
    const seatCost = 1500;
    addons.push({ item: 'Seat selection (optional)', cost: seatCost });

    // Meal (long-haul)
    if (flight.duration > 360) {
      const mealCost = 800;
      addons.push({ item: 'Meals (optional)', cost: mealCost });
    }

    return {
      advertisedPrice: dealPrice,
      trueCost: trueCost,
      potentialAddons: addons,
      minCost: trueCost,
      maxCost: trueCost + addons.reduce((sum, addon) => sum + (addon.item.includes('optional') ? addon.cost : 0), 0)
    };
  }
}

module.exports = DealScorer;
