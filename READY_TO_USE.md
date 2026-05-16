

---

## 🚀 Access Your Application

### Frontend
```
http://localhost:5000
```

### Backend API
```
http://localhost:5000/api
```

### WebSocket (Real-time Alerts)
```
ws://localhost:5000/ws
```

---

## 📊 What's Available

### 1. Main Dashboard
- Real-time fraud monitoring
- Live transaction feed
- Alert timeline
- CSV batch upload
- Statistics overview

### 2. Advanced Analytics (NEW!)
- Risk score distribution
- Fraud timeline trends
- Top fraudsters ranking
- Risky merchants analysis
- Detection reasons breakdown
- Data export to JSON

### 3. User Profiles (NEW!)
- Search any UPI address
- Detailed user statistics
- Recent transactions
- Fraud tracking
- Risk assessment

### 4. Other Features
- Fraud Detection Center
- Live Monitor
- Threat Analysis
- Prevention & Education

---

## 🎯 Quick Start (5 Minutes)

### Step 1: Upload Sample Data
1. Go to http://localhost:5000
2. Click **"📤 CSV Batch"** tab
3. Drag & drop `comprehensive_transactions.csv`
4. Wait for processing
5. **Dashboard auto-refreshes** ✨

### Step 2: View Analytics
1. Click **"📈 Advanced Analytics"** in menu
2. See beautiful charts and insights
3. Click **"Export Data"** to download

### Step 3: Profile Users
1. Click **"👥 User Profiles"** in menu
2. Enter UPI address (e.g., `user1@upi`)
3. Click **"Search"**
4. View detailed profile

---

## 📁 Sample Data

File: `comprehensive_transactions.csv`

**Contains**:
- 150 realistic UPI transactions
- Mix of normal and fraudulent
- Various fraud patterns
- Different merchants and cities
- 24+ hour time span

**Expected Results**:
- ~12 fraudulent transactions detected
- Risk scores ranging 0-100
- Multiple fraud reasons identified
- Diverse merchant analysis

---

## 🔧 Available Commands

### Development
```bash
npm run dev
```
Starts dev server on port 5000

### Production Build
```bash
npm run build
```
Creates optimized production bundle

### Production Server
```bash
npm run start
```
Runs production server

### Type Check
```bash
npm run check
```
Verifies TypeScript types

### Database
```bash
npm run db:push
```
Syncs database schema

---

## 📊 New Features Summary

### Advanced Analytics
- 📈 Risk Distribution Histogram
- 📉 Fraud Timeline (30 days)
- 🚨 Top Fraudsters (30 days)
- 🏪 Risky Merchants (30 days)
- 🎯 Detection Reasons Breakdown
- 📥 Data Export to JSON

### User Profiling
- 🔍 Search by UPI address
- 📊 Detailed statistics
- 💰 Amount tracking
- 📈 Risk scoring
- 🔐 Fraud detection

### Enhanced CSV Upload
- ✅ Automatic dashboard refresh
- ✅ Unique transaction IDs
- ✅ Rate limiting (10/min)
- ✅ Better error handling
- ✅ Progress indication

---

## 🔗 Navigation Menu

```
📊 Dashboard          → Main fraud detection center
🚨 Fraud Detection    → Fraud analysis tools
📡 Live Monitor       → Real-time monitoring
🛡️ Threat Analysis    → Threat intelligence
📈 Advanced Analytics → NEW! Deep insights
👥 User Profiles      → NEW! User analysis
📚 Prevention & Edu   → Educational content
```

---

## 📚 Documentation

### Quick Start
- `QUICK_START_NEW_FEATURES.md` - 5-minute guide

### Features
- `NEW_FEATURES.md` - All new features
- `IMPROVEMENTS_SUMMARY.md` - What changed

### Technical
- `IMPLEMENTATION_SUMMARY.md` - Architecture
- `FRAUD_DETECTION_GUIDE.md` - Fraud patterns

### Deployment
- `DEPLOYMENT_READY.md` - Deployment guide
- `CHANGELOG.md` - Version history

### Navigation
- `DOCUMENTATION_INDEX.md` - All docs index

---

## 🎯 Common Tasks

### Upload CSV and See Results
1. Go to Dashboard
2. Click "CSV Batch" tab
3. Upload `comprehensive_transactions.csv`
4. Dashboard auto-refreshes
5. View results in transaction feed

### Analyze Fraud Patterns
1. Go to "Advanced Analytics"
2. View risk distribution
3. Check fraud timeline
4. Identify top fraudsters
5. Export data for reports

### Profile Individual Users
1. Go to "User Profiles"
2. Enter UPI address
3. View detailed profile
4. Check recent transactions
5. Monitor fraud statistics

### Export Data
1. Go to "Advanced Analytics"
2. Click "Export Data" button
3. Download JSON file
4. Import into Excel/BI tool
5. Create custom reports

---

## 🔐 Security Features

- ✅ Rate limiting (10 CSV uploads/min per IP)
- ✅ Unique transaction IDs (prevents duplicates)
- ✅ Input validation (all endpoints)
- ✅ Error handling (safe messages)
- ✅ No sensitive data exposure

---

## 📊 API Endpoints

### Analytics (NEW!)
```
GET  /api/analytics/risk-distribution
GET  /api/analytics/fraud-timeline
GET  /api/analytics/top-fraudsters
GET  /api/analytics/merchant-analysis
GET  /api/analytics/detection-breakdown
POST /api/analytics/export
GET  /api/analytics/user-risk-profile/:upi
```

### Existing Endpoints
```
GET  /api/stats/fraud
GET  /api/stats/realtime
GET  /api/stats/hourly
GET  /api/transactions/recent
POST /api/transactions/submit
POST /api/csv-upload
GET  /api/alerts/recent/all
GET  /api/fraud-patterns
POST /api/blacklist/report
```

---

## 🧪 Testing

### Test CSV Upload
```
1. Upload comprehensive_transactions.csv
2. Expected: 150 transactions processed
3. Expected: ~12 fraudulent detected
4. Expected: Dashboard updates automatically
```

### Test Analytics
```
1. Go to Advanced Analytics
2. Expected: All charts load with data
3. Expected: Export button works
4. Expected: Data matches dashboard stats
```

### Test User Profiles
```
1. Search for "user1@upi"
2. Expected: Profile loads with stats
3. Expected: Recent transactions display
4. Expected: Risk score calculated
```

---

## 💡 Tips & Tricks

### For Best Performance
- Use Chrome or Firefox
- Clear browser cache periodically
- Close unused tabs
- Refresh page if data seems stale

### For Large Datasets
- Upload CSV in batches (< 1000 rows)
- Use date filters in analytics
- Export specific date ranges

### For Troubleshooting
- Check browser console for errors
- Verify API endpoints are responding
- Check WebSocket connection status
- Review server logs

---

## ❓ FAQ

**Q: Why did my dashboard refresh after CSV upload?**
A: New feature! Dashboard now auto-refreshes to show new transactions.

**Q: Can I upload the same CSV twice?**
A: Yes, but transactions will have unique IDs so no duplicates.

**Q: How many CSV uploads can I do?**
A: Max 10 per minute per IP address.

**Q: Can I export data?**
A: Yes! Click "Export Data" in Advanced Analytics.

**Q: How far back does analytics go?**
A: Risk Distribution: 7 days, Fraud Timeline: 30 days, Others: 30 days

**Q: Can I search any UPI address?**
A: Yes, go to User Profiles and enter any UPI address.

**Q: What if a user has no transactions?**
A: You'll see "User not found" error.

---

## 🚀 Next Steps

1. ✅ Open http://localhost:5000
2. ✅ Upload `comprehensive_transactions.csv`
3. ✅ Explore "Advanced Analytics"
4. ✅ Try "User Profiles"
5. ✅ Export data
6. ✅ Review documentation

---

## 📞 Support

### For Questions About:
- **Getting Started**: See `QUICK_START_NEW_FEATURES.md`
- **Features**: See `NEW_FEATURES.md`
- **Technical Details**: See `IMPLEMENTATION_SUMMARY.md`
- **Fraud Patterns**: See `FRAUD_DETECTION_GUIDE.md`
- **Deployment**: See `DEPLOYMENT_READY.md`

---

## 🎉 You're All Set!

Your UPI Fraud Guard system is:
- ✅ Fully functional
- ✅ Production ready
- ✅ Well documented
- ✅ Secure and optimized
- ✅ Ready to use

**Start exploring now!** 🚀

---

**Version**: 2.0.0
**Status**: Running ✅
**Date**: December 5, 2025
**Port**: 5000
**URL**: http://localhost:5000
