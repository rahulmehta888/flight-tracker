# 🚀 Quick Start Guide

Get Flight Tracker running in 5 minutes!

## Prerequisites Check
```bash
node --version  # Should be v16+
mongod --version  # Should be v5+
```

## 1️⃣ Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in new terminal)
cd frontend
npm install
```

## 2️⃣ Setup MongoDB

### Option A: Local MongoDB
```bash
# macOS with Homebrew
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

### Option B: Docker
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## 3️⃣ Configure Backend

```bash
cd backend
cp .env.example .env
```

**Edit `.env` with minimum required values:**
```env
MONGODB_URI=mongodb://localhost:27017/flight-tracker
JWT_SECRET=mysecretkey123
AMADEUS_API_KEY=your-key-here
AMADEUS_API_SECRET=your-secret-here
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
```

### Get Amadeus API Credentials (2 minutes)
1. Visit: https://developers.amadeus.com/register
2. Create account → Create new app
3. Copy API Key & Secret to `.env`

### Get Gmail App Password (2 minutes)
1. Enable 2FA on Gmail
2. Visit: https://myaccount.google.com/apppasswords
3. Generate new password → Copy to `.env`

## 4️⃣ Configure Frontend

```bash
cd frontend
cp .env.example .env
```

Content should be:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 5️⃣ Start Everything

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```
✅ Backend running at http://localhost:5000

### Terminal 2 - Frontend
```bash
cd frontend
npm start
```
✅ Frontend opens at http://localhost:3000

## 6️⃣ Test It Out

1. **Register**: Create an account at http://localhost:3000/register
2. **Browse Deals**: View the dashboard (may be empty initially)
3. **Set Preferences**: Go to Profile → Add airports (DEL, BOM, BLR)
4. **Wait for Deals**: The cron job runs every 6 hours

### Manual Test (Optional)
To test immediately without waiting:

```javascript
// In backend/server.js, add at the bottom:
const priceTrackerService = require('./services/priceTrackerService');
setTimeout(() => {
  priceTrackerService.runOnce();
}, 5000);
```

Then restart the backend server.

## 🎯 Common Issues

### MongoDB Connection Failed
```bash
# Check if MongoDB is running
ps aux | grep mongo  # macOS/Linux
tasklist | findstr mongo  # Windows

# Start MongoDB if not running
brew services start mongodb-community  # macOS
```

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill  # macOS/Linux

# Or change port in backend/.env
PORT=5001
```

### Amadeus API Errors
- Make sure you're using the TEST URL: `https://test.api.amadeus.com`
- Check your API key and secret are correct
- Free tier has rate limits (10 requests/second)

### Email Not Sending
- Use Gmail app-specific password, not your regular password
- Make sure 2FA is enabled on Gmail
- Check EMAIL_USER and EMAIL_PASSWORD are correct

## 📊 Quick Data Check

### Check if server is running:
```bash
curl http://localhost:5000/health
```

### Check MongoDB:
```bash
mongosh
use flight-tracker
db.users.find()
```

## 🎉 Next Steps

1. ✅ Create some test users
2. ✅ Set up your preferences
3. ✅ Wait for deals or manually trigger price check
4. ✅ Check email for notifications
5. ✅ Customize the app to your needs!

## 💡 Tips

- **Free Tier Limits**: Amadeus free tier is limited. For production, upgrade.
- **Cron Schedule**: Change `PRICE_CHECK_CRON` in `.env` to check more frequently
- **Test Mode**: Start with a few routes to avoid rate limits
- **Debugging**: Check `backend/logs/` for error logs

## 📚 Full Documentation

For detailed documentation, see [README.md](./README.md)

---

**Need Help?** Open an issue on GitHub or check the main README!
