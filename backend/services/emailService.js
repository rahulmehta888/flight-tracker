const nodemailer = require('nodemailer');
const User = require('../models/User');
const logger = require('../config/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Send new deal notification to all eligible users
  async notifyNewDeal(deal) {
    try {
      // Populate flight data
      await deal.populate('flight');

      // Find users who should receive this notification
      const users = await User.find({
        emailNotifications: true,
      });

      logger.info(`Sending deal notification to ${users.length} users`);

      let sentCount = 0;
      for (const user of users) {
        // Check if user is interested in this route
        if (this.isUserInterestedInDeal(user, deal)) {
          await this.sendDealEmail(user, deal);
          sentCount++;
        }
      }

      // Update notification count
      deal.notificationsSent = sentCount;
      await deal.save();

      logger.info(`Deal notifications sent: ${sentCount}`);
    } catch (error) {
      logger.error('Error sending deal notifications:', error.message);
    }
  }

  // Check if user is interested in this deal
  isUserInterestedInDeal(user, deal) {
    const flight = deal.flight;

    // If user has preferred airports, check if origin matches
    if (user.preferredAirports && user.preferredAirports.length > 0) {
      if (!user.preferredAirports.includes(flight.origin)) {
        return false;
      }
    }

    // If user has preferred destinations, check if destination matches
    if (user.preferredDestinations && user.preferredDestinations.length > 0) {
      if (!user.preferredDestinations.includes(flight.destination)) {
        return false;
      }
    }

    return true;
  }

  // Send deal email to a specific user
  async sendDealEmail(user, deal) {
    try {
      const flight = deal.flight;

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: `🔥 ${deal.discountPercentage.toFixed(0)}% Off: ${flight.originCity} to ${flight.destinationCity}`,
        html: this.generateDealEmailHTML(user, deal, flight),
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Deal email sent to ${user.email}`);
    } catch (error) {
      logger.error(`Failed to send email to ${user.email}:`, error.message);
    }
  }

  // Generate HTML for deal email
  generateDealEmailHTML(user, deal, flight) {
    const departureDate = new Date(flight.departureDate).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .deal-badge { background: #ff6b6b; padding: 10px 20px; border-radius: 20px; display: inline-block; font-weight: bold; font-size: 24px; }
    .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .route { font-size: 28px; font-weight: bold; margin: 20px 0; color: #667eea; }
    .details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e9ecef; }
    .detail-label { font-weight: bold; }
    .price-section { text-align: center; margin: 30px 0; }
    .old-price { text-decoration: line-through; color: #999; font-size: 18px; }
    .new-price { color: #28a745; font-size: 36px; font-weight: bold; }
    .savings { color: #ff6b6b; font-size: 20px; font-weight: bold; margin-top: 10px; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 30px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="deal-badge">🔥 ${deal.discountPercentage.toFixed(0)}% OFF</div>
      <h1 style="margin: 20px 0 10px;">Amazing Flight Deal Alert!</h1>
      <p>Hi ${user.name}, we found an incredible deal for you!</p>
    </div>

    <div class="content">
      <div class="route">
        ${flight.originCity} ✈️ ${flight.destinationCity}
      </div>

      <div class="details">
        <div class="detail-row">
          <span class="detail-label">Departure:</span>
          <span>${departureDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Airline:</span>
          <span>${flight.airline}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Stops:</span>
          <span>${flight.stops} ${flight.stops === 1 ? 'stop' : 'stops'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Class:</span>
          <span>${flight.cabinClass.charAt(0).toUpperCase() + flight.cabinClass.slice(1)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Checked Baggage:</span>
          <span>${flight.checkedBaggage ? '✅ Included' : '❌ Not included'}</span>
        </div>
      </div>

      <div class="price-section">
        <div class="old-price">₹${deal.originalPrice.toLocaleString('en-IN')}</div>
        <div class="new-price">₹${deal.dealPrice.toLocaleString('en-IN')}</div>
        <div class="savings">Save ₹${deal.savings.toLocaleString('en-IN')}!</div>
      </div>

      <div style="text-align: center;">
        <a href="${flight.bookingUrl}" class="cta-button">Book Now on Google Flights</a>
      </div>

      <p style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #f8f9fa; color: #666;">
        <strong>⚡ Act Fast!</strong> This deal expires in 7 days or until sold out.
        Flight prices can change at any time.
      </p>
    </div>

    <div class="footer">
      <p>You're receiving this email because you're subscribed to Flight Tracker alerts.</p>
      <p>To manage your preferences, log in to your account.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  // Send welcome email to new users
  async sendWelcomeEmail(user) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: 'Welcome to Flight Tracker! 🛫',
        html: `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #667eea;">Welcome to Flight Tracker!</h1>
    <p>Hi ${user.name},</p>
    <p>Thank you for joining Flight Tracker! We're excited to help you discover amazing flight deals.</p>
    <h2>What's Next?</h2>
    <ul>
      <li>Complete your profile and set your preferred airports</li>
      <li>Add destinations you're interested in visiting</li>
      <li>Start receiving personalized deal alerts</li>
    </ul>
    <p>We'll notify you when we find deals with at least 40% savings!</p>
    <p>Happy travels! ✈️</p>
  </div>
</body>
</html>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Welcome email sent to ${user.email}`);
    } catch (error) {
      logger.error(`Failed to send welcome email to ${user.email}:`, error.message);
    }
  }
}

module.exports = new EmailService();
