# ✈️ Alternative Flight Data APIs (Amadeus Shutting Down)

## 🚨 Problem: Amadeus Self-Service Portal Closing July 17, 2026

**Solution: Use these alternative APIs instead**

---

## 🏆 Best Alternatives for Flight Tracker

### 1. **Kiwi.com Tequila API** ⭐ RECOMMENDED

**Why Best:**
- ✅ FREE tier with 100 requests/month
- ✅ Real flight data from 750+ airlines
- ✅ No credit card required
- ✅ Easy integration
- ✅ Great documentation

**Get Started:**
1. Go to: https://tequila.kiwi.com/portal/login
2. Sign up for free account
3. Get API key instantly
4. Start searching flights

**Pricing:**
- **Free:** 100 requests/month
- **Basic:** $50/month = 2,500 requests
- **Standard:** $200/month = 12,000 requests

**API Example:**
```bash
curl "https://api.tequila.kiwi.com/v2/search?fly_from=DEL&fly_to=DXB&date_from=01/06/2026&date_to=30/06/2026" \
  -H "apikey: YOUR_API_KEY"
```

---

### 2. **Skyscanner RapidAPI** 💰

**Why Good:**
- ✅ Real-time flight prices
- ✅ Same data as Skyscanner.com
- ✅ Reliable and fast
- ❌ Paid only (no free tier)

**Get Started:**
1. Go to: https://rapidapi.com/skyscanner/api/skyscanner-api
2. Sign up for RapidAPI account
3. Subscribe to plan
4. Get API key

**Pricing:**
- **Basic:** $10/month = 500 requests
- **Pro:** $50/month = 5,000 requests
- **Ultra:** $200/month = 50,000 requests

---

### 3. **Aviationstack API**

**Why Decent:**
- ✅ FREE tier available
- ✅ Real-time flight data
- ✅ 100 airlines covered
- ❌ Limited routes on free tier

**Get Started:**
1. Go to: https://aviationstack.com/
2. Sign up for free account
3. Get API key instantly

**Pricing:**
- **Free:** 100 requests/month
- **Basic:** $9.99/month = 1,000 requests
- **Professional:** $49.99/month = 10,000 requests

---

### 4. **AeroDataBox (RapidAPI)**

**Why Interesting:**
- ✅ Real-time flight schedules
- ✅ Airport data
- ✅ Free tier: 150 requests/month
- ❌ Focuses more on schedules than prices

**Get Started:**
1. Go to: https://rapidapi.com/aedbx-aedbx/api/aerodatabox
2. Subscribe to free plan
3. Get API key

---

## 🎯 My Recommendation: **Kiwi.com Tequila API**

### Why This is Best for You:

1. **FREE to Start** - 100 searches/month
2. **No Credit Card** - Unlike Skyscanner
3. **Real Data** - Same as booking sites
4. **Easy Integration** - Simple REST API
5. **Good for Testing** - Perfect for friends/family app

### Quick Setup (5 minutes):

**Step 1:** Get API Key
```bash
# Go to: https://tequila.kiwi.com/portal/login
# Sign up → Create app → Copy API key
```

**Step 2:** I'll integrate it into our tracker
- Replace Amadeus service
- Same functionality
- Better deal detection

---

## 💡 Alternative Approach: Multi-API Strategy

**For Production App:**

Use multiple APIs for best coverage:
- **Primary:** Kiwi.com (cheap, reliable)
- **Fallback:** Aviationstack (free tier)
- **Premium routes:** Skyscanner RapidAPI (if needed)

**Benefits:**
- Better uptime
- More flight options
- Compare prices across sources
- Find the absolute best deals

---

## 🔄 Other Options (If Needed):

### **Google Flights Scraper**
- ✅ Always accurate
- ❌ Against Terms of Service
- ❌ Can get blocked
- ❌ Not recommended

### **Build Your Own Database**
- Manually track prices
- Good for specific routes
- Time-consuming
- Not scalable

### **Partner with OTAs**
- Integrate with MakeMyTrip API
- Yatra API
- Requires business agreement
- Better for production apps

---

## 📊 Cost Comparison (100 Daily Searches):

| API | Monthly Requests | Cost | Cost per Search |
|-----|-----------------|------|-----------------|
| **Kiwi.com** | 3,000 | $50 | $0.017 |
| **Aviationstack** | 3,000 | $49.99 | $0.017 |
| **Skyscanner** | 3,000 | $50 | $0.017 |
| **Amadeus** | ❌ Shutting down | - | - |

**All very affordable for a production app!**

---

## 🚀 What I'll Do Next:

**Option A: Quick Switch to Kiwi.com (Recommended)**
- I'll replace Amadeus with Kiwi.com API
- Same features, better availability
- You just need to get API key
- 15 minutes to integrate

**Option B: Multi-API Support**
- Support multiple APIs
- Automatic fallback
- Best deal detection across sources
- More robust

**Option C: Paid Skyscanner**
- Most reliable
- Industry standard
- $10/month to start
- Production-ready

---

## ✅ Immediate Action:

**Let me switch to Kiwi.com API right now:**

1. You sign up: https://tequila.kiwi.com/portal/login
2. Get your API key
3. I'll integrate it (15 min)
4. Start fetching real deals

**Or:**

If you want to invest $10/month for reliability:
- Skyscanner RapidAPI is rock-solid
- Used by major travel apps
- Worth it for production

---

**Which would you prefer?**
1. 🆓 Kiwi.com (free tier, good for testing)
2. 💰 Skyscanner ($10/month, most reliable)
3. 🔄 Multi-API (best of both worlds)

Let me know and I'll integrate it right away! 🚀
