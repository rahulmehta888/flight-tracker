# ✈️ Flight Tracker

A comprehensive flight deal monitoring and notification system inspired by Zomunk.com. Track international flight prices from major Indian airports and get notified when amazing deals (40%+ savings) are found.

## 🌟 Features

### Core Functionality
- **🔍 Automated Price Monitoring**: Continuously scans flight prices from major Indian airports
- **🎯 Deal Detection**: Identifies deals with minimum 40% savings
- **📧 Email Notifications**: Get instant alerts when new deals are found
- **💳 Membership Tiers**: Free (economy deals) and Premium (all deals + mistake fares)
- **🎨 Modern Dashboard**: Beautiful React-based UI to browse deals
- **🔐 Secure Authentication**: JWT-based user authentication
- **⚙️ Smart Filters**: Filter deals by origin, destination, discount, and type

### Deal Quality Criteria (Like Zomunk)
- ✅ Minimum 40% discount required
- ✅ Maximum 4-hour layovers
- ✅ Only non-stop or single-stop flights prioritized
- ✅ Checked baggage information included
- ✅ Quality ratings: Good, Excellent, Exceptional

## 🏗️ Architecture

### Backend Stack
- **Node.js + Express**: REST API server
- **MongoDB**: Database for users, flights, deals
- **Amadeus Flight API**: Real-time flight data
- **JWT**: Authentication
- **Nodemailer**: Email notifications
- **Node-Cron**: Scheduled price checks

### Frontend Stack
- **React 18**: Modern UI framework
- **React Router**: Navigation
- **Axios**: HTTP client
- **React Icons**: Icon library
- **date-fns**: Date formatting
- **React Toastify**: Notifications

## 📁 Project Structure

```
flight-tracker/
├── backend/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   └── logger.js            # Winston logger setup
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── dealsController.js   # Deal management
│   │   └── subscriptionsController.js
│   ├── middleware/
│   │   ├── auth.js              # JWT verification
│   │   └── errorHandler.js      # Error handling
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── Flight.js            # Flight data schema
│   │   ├── Deal.js              # Deal schema
│   │   └── Subscription.js      # User subscriptions
│   ├── routes/
│   │   ├── auth.js              # Auth routes
│   │   ├── deals.js             # Deal routes
│   │   └── subscriptions.js     # Subscription routes
│   ├── services/
│   │   ├── amadeusService.js    # Flight API integration
│   │   ├── priceTrackerService.js # Price monitoring
│   │   └── emailService.js      # Email notifications
│   ├── .env.example
│   ├── package.json
│   └── server.js                # Main entry point
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.js        # Navigation bar
    │   │   └── DealCard.js      # Deal display card
    │   ├── pages/
    │   │   ├── Dashboard.js     # Main deals page
    │   │   ├── Login.js         # Login page
    │   │   ├── Register.js      # Registration page
    │   │   └── Profile.js       # User profile
    │   ├── services/
    │   │   └── api.js           # API client
    │   ├── styles/
    │   │   └── App.css          # Global styles
    │   ├── utils/
    │   │   └── AuthContext.js   # Auth state management
    │   ├── App.js               # Main app component
    │   └── index.js             # React entry point
    ├── .env.example
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (v5 or higher)
- **Amadeus API Account** (free tier available)
- **Gmail Account** (for email notifications)

### 1. Clone the Repository
```bash
cd /Users/pawan.mehta/Desktop/Cursor/flight-tracker
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env
```

#### Configure Environment Variables
Edit `backend/.env`:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/flight-tracker

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d

# Amadeus API (Get from https://developers.amadeus.com/)
AMADEUS_API_KEY=your-amadeus-api-key
AMADEUS_API_SECRET=your-amadeus-api-secret
AMADEUS_API_URL=https://test.api.amadeus.com

# Email (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=Flight Tracker <noreply@flighttracker.com>

# Cron (every 6 hours)
PRICE_CHECK_CRON=0 */6 * * *

# Deal Settings
MIN_DISCOUNT_PERCENTAGE=40
MAX_LAYOVER_HOURS=4
```

#### Get Amadeus API Credentials
1. Go to [https://developers.amadeus.com/](https://developers.amadeus.com/)
2. Create a free account
3. Create a new app
4. Copy your API Key and API Secret
5. Use `https://test.api.amadeus.com` for testing

#### Setup Gmail App Password
1. Enable 2-Factor Authentication on your Gmail account
2. Go to Google Account Settings > Security > 2-Step Verification
3. Scroll to "App passwords"
4. Generate a new app password for "Mail"
5. Use this password in your `.env` file

#### Start MongoDB
```bash
# Using Homebrew (macOS)
brew services start mongodb-community

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### Start Backend Server
```bash
npm run dev
# Server runs on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Edit `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

#### Start Frontend
```bash
npm start
# App opens at http://localhost:3000
```

## 📖 Usage Guide

### 1. Register an Account
- Go to http://localhost:3000/register
- Choose Free or Premium membership
- Create your account

### 2. Set Preferences
- Navigate to Profile
- Add preferred departure airports (e.g., DEL, BOM, BLR)
- Add preferred destinations (e.g., DXB, SIN, LHR)
- Enable email notifications

### 3. Browse Deals
- View all active deals on the Dashboard
- Use filters to find specific routes
- Click on deals to view full details
- Click "Book on Google Flights" to complete booking

### 4. Receive Notifications
- Get email alerts when new deals match your preferences
- Emails include full deal details and booking links

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `PUT /api/auth/profile` - Update profile (protected)

### Deals
- `GET /api/deals` - Get all deals (protected)
- `GET /api/deals/:id` - Get single deal (protected)
- `GET /api/deals/stats` - Get deal statistics (protected)
- `POST /api/deals/:id/click` - Track deal click (protected)

### Subscriptions
- `GET /api/subscriptions` - Get user subscriptions (protected)
- `POST /api/subscriptions` - Create subscription (protected)
- `PUT /api/subscriptions/:id` - Update subscription (protected)
- `DELETE /api/subscriptions/:id` - Delete subscription (protected)

## 🎯 How It Works

### Price Tracking Process
1. **Scheduled Scanning**: Cron job runs every 6 hours (configurable)
2. **Route Checking**: Checks all combinations of Indian airports to popular destinations
3. **Price Comparison**: Compares current prices with historical data
4. **Deal Detection**: Identifies price drops of 40%+
5. **Quality Filtering**: Filters out long layovers, complex routes
6. **Deal Creation**: Creates deal records in database
7. **Notification**: Emails users who match deal preferences

### Deal Quality Determination
```javascript
- Exceptional: 70%+ discount, ≤1 stop
- Excellent: 55%+ discount, ≤1 stop
- Good: 40%+ discount
```

## 🧪 Testing

### Manual Price Check (Testing)
You can manually trigger a price check cycle:

```javascript
// In backend/server.js, add:
const priceTrackerService = require('./services/priceTrackerService');

// Run once for testing
priceTrackerService.runOnce();
```

### Test Email Service
```javascript
// In backend, test email:
const emailService = require('./services/emailService');
emailService.sendWelcomeEmail({ name: 'Test', email: 'test@example.com' });
```

## 🛠️ Production Deployment

### Backend Deployment (Heroku Example)
```bash
# Install Heroku CLI and login
heroku create flight-tracker-api

# Set environment variables
heroku config:set MONGODB_URI=your-mongodb-atlas-uri
heroku config:set JWT_SECRET=your-secret
# ... set all other env vars

# Deploy
git push heroku main
```

### Frontend Deployment (Vercel Example)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel

# Set environment variable
vercel env add REACT_APP_API_URL production
```

### Database (MongoDB Atlas)
1. Create account at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string
4. Update `MONGODB_URI` in backend env

## 🔐 Security Considerations

- ✅ Passwords hashed with bcrypt
- ✅ JWT tokens for authentication
- ✅ Environment variables for sensitive data
- ✅ CORS configured
- ✅ Input validation with Joi
- ✅ MongoDB injection protection
- ✅ Rate limiting recommended for production

## 📝 Environment Variables Reference

### Backend
| Variable | Description | Required |
|----------|-------------|----------|
| PORT | Server port | No (default: 5000) |
| MONGODB_URI | MongoDB connection string | Yes |
| JWT_SECRET | JWT signing secret | Yes |
| AMADEUS_API_KEY | Amadeus API key | Yes |
| AMADEUS_API_SECRET | Amadeus API secret | Yes |
| EMAIL_USER | Gmail address | Yes |
| EMAIL_PASSWORD | Gmail app password | Yes |
| MIN_DISCOUNT_PERCENTAGE | Minimum deal discount | No (default: 40) |

### Frontend
| Variable | Description | Required |
|----------|-------------|----------|
| REACT_APP_API_URL | Backend API URL | Yes |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for learning or building your own flight tracker!

## 🙏 Acknowledgments

- Inspired by [Zomunk.com](https://zomunk.com)
- Flight data powered by [Amadeus Travel API](https://developers.amadeus.com/)
- Icons by [React Icons](https://react-icons.github.io/react-icons/)

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Email: support@flighttracker.com (example)

## 🎉 Features Coming Soon

- [ ] Mobile app (React Native)
- [ ] SMS notifications
- [ ] Price prediction using ML
- [ ] Multi-city route support
- [ ] Travel date flexibility search
- [ ] Social sharing of deals
- [ ] Deal history and analytics
- [ ] Browser extension

---

**Happy Deal Hunting!** ✈️🎉
