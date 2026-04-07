# 🧪 Flight Tracker - Testing Guide

## Current Status
- ✅ Backend dependencies installed
- ✅ Frontend dependencies installed
- ⏳ MongoDB installing...
- ⚠️ API configuration needed

## Quick Test (3 Steps)

### Step 1: Start MongoDB
```bash
# Start MongoDB service
brew services start mongodb-community@8.0

# Verify it's running
brew services list | grep mongodb
```

### Step 2: Start Backend Server
```bash
# In Terminal 1
cd backend
npm run dev
```

The backend should start on **http://localhost:5000**

### Step 3: Start Frontend
```bash
# In Terminal 2 (new terminal window)
cd frontend
npm start
```

The frontend will open automatically at **http://localhost:3000**

## Testing the Application

### 1. Register a New Account
- Go to http://localhost:3000/register
- Fill in:
  - Name: Test User
  - Email: test@example.com
  - Password: test123
- Click "Create Account"

### 2. Login
- You should be redirected to dashboard
- Or manually login at http://localhost:3000/login

### 3. Check Profile
- Click "Profile" in the navigation
- Add preferred airports: DEL, BOM, BLR
- Add destinations: DXB, SIN, LHR
- Enable email notifications
- Save

### 4. View Dashboard
- Check the stats cards
- Try the filters
- Note: Deals will be empty initially (requires Amadeus API setup)

## Without Amadeus API (Limited Testing)

The app will work but won't have real flight deals. You can test:
- ✅ User registration
- ✅ Login/Logout
- ✅ Profile management
- ✅ UI/UX improvements
- ❌ No actual flight deals (needs API)

## With Amadeus API (Full Testing)

### Get Free Amadeus API Key:
1. Go to: https://developers.amadeus.com/register
2. Create free account
3. Create a new app
4. Copy API Key and Secret

### Update backend/.env:
```env
AMADEUS_API_KEY=your-actual-api-key-here
AMADEUS_API_SECRET=your-actual-api-secret-here
```

### Manually Trigger Price Check:
Add this to `backend/server.js` after line 51:
```javascript
// Manual price check for testing (after 10 seconds)
setTimeout(() => {
  const priceTrackerService = require('./services/priceTrackerService');
  priceTrackerService.runOnce();
}, 10000);
```

Restart the backend server and it will fetch deals after 10 seconds.

## Email Testing (Optional)

### Setup Gmail App Password:
1. Enable 2FA on Gmail
2. Go to: https://myaccount.google.com/apppasswords
3. Generate app password for "Mail"

### Update backend/.env:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-digit-app-password
```

## Common Issues

### MongoDB Connection Error
```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Restart MongoDB
brew services restart mongodb-community@8.0
```

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill

# Or change port in backend/.env
PORT=5001
```

### Frontend Build Errors
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

## Stop Everything

```bash
# Stop MongoDB
brew services stop mongodb-community@8.0

# Stop servers: Press Ctrl+C in both terminal windows
```

## What to Test

### UI/UX Improvements ✨
- [ ] Modern gradient backgrounds
- [ ] Smooth animations on cards
- [ ] Hover effects on deals
- [ ] Responsive design on mobile
- [ ] Loading states
- [ ] Form focus states
- [ ] Button hover effects
- [ ] Stats cards with gradients

### Functionality
- [ ] User registration
- [ ] Login/Logout
- [ ] Profile updates
- [ ] Filter deals (when available)
- [ ] Responsive navigation
- [ ] Password validation
- [ ] Email validation

## Next Steps After Testing

Once everything works locally:
1. ✅ Test complete
2. 🚀 Deploy to free hosting
3. 🌐 Share with friends and family

---

**Questions?** Let me know what's not working!
