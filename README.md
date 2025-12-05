# 🛡️ UPI Fraud Guard - Enterprise Fraud Detection System

> **AI-Powered UPI Transaction Monitoring with Real-Time Risk Analysis & Batch Processing**

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)

## 📋 Overview

**UPI Fraud Guard** is a comprehensive fraud detection system designed to protect against sophisticated UPI scams in India. It features a 4-layer detection engine, real-time monitoring dashboard, and **new batch CSV processing** capability.
|---------|-------------|
**DEMO_VID**
(https://drive.google.com/file/d/1gc4_USQ63f9TYW9PB9EGVB_xRUlwcdRe/view?usp=sharing)
### 🎯 Key Capabilities

| Feature | Description |
|---------|-------------|
| **4-Layer Detection** | Behavioral + Pattern + Anomaly + Blacklist analysis |
| **12+ Scam Patterns** | Coverage for all major UPI fraud tactics |
| **Real-Time Dashboard** | Interactive monitoring with risk visualization |
| **Batch CSV Upload** | Analyze multiple transactions simultaneously |
| **Risk Scoring** | Advanced algorithm (0-100 scale) |
| **Alert Management** | Actionable fraud notifications |
| **Analytics** | 30-day statistics and trends |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/UPI-Fraud-Guard.git
cd UPI-Fraud-Guard

# Install dependencies
npm install

# Start development server
npm run dev
```

**Access Application**: http://localhost:5000

---

## 📊 Features in Detail

### 1. **Multi-Layer Fraud Detection Engine**

```
Risk Score = 
  (Behavioral × 0.30) + 
  (Pattern × 0.35) + 
  (Anomaly × 0.15) + 
  (Blacklist × 0.20)
```

**Detection Layers:**
- 🧠 **Behavioral Analysis**: User baselines, velocity, amounts
- 🎯 **Pattern Matching**: 12+ known scam patterns
- 📈 **Anomaly Detection**: Statistical Z-score analysis
- 🚫 **Blacklist Checking**: Real-time fraud database

### 2. **12 Known UPI Fraud Patterns**

| # | Pattern | Severity | Category |
|---|---------|----------|----------|
| 1 | Refund Scam (OTP Phishing) | CRITICAL | Phishing |
| 2 | QR Code Swap | CRITICAL | Physical Fraud |
| 3 | Bank/RBI Impersonation | CRITICAL | Impersonation |
| 4 | Verification Transaction Attack | HIGH | Testing |
| 5 | Delivery Partner Impersonation | HIGH | Social Engineering |
| 6 | Rental Fraud | HIGH | Financial |
| 7 | Loan Scam | MEDIUM | Financial |
| 8 | Prize/Lottery Scam | MEDIUM | Phishing |
| 9 | Fake Customer Support | MEDIUM | Phishing |
| 10 | Job Scam | MEDIUM | Employment |
| 11 | Identity Theft Chain | CRITICAL | Account Takeover |
| 12 | Darling Scam (Romance) | HIGH | Social Engineering |

### 3. **CSV Batch Upload** ✨ NEW!

**Submit multiple transactions for analysis:**

```csv
senderUpi,receiverUpi,amount,timestamp,description,merchantName,city
user1@upi,merchant@upi,5000,2025-12-05T10:30:00Z,Online purchase,Amazon,Delhi
user2@upi,unknown@upi,50000,2025-12-05T10:35:00Z,Refund verification,Support,Mumbai
```

**Features:**
- Drag & drop interface
- Automatic CSV parsing
- Parallel fraud analysis
- Detailed results table
- Summary statistics

### 4. **Real-Time Dashboard**

**Tabs:**
- 📊 Recent Transactions - Live monitoring with risk scores
- 📤 CSV Upload - Batch analysis interface
- 🚨 Alerts - Fraud notifications timeline
- 🎯 Fraud Patterns - Pattern library reference
- 📈 Analytics - Charts and statistics

---

## 🛠️ Tech Stack

### Frontend
```
React 19 • TypeScript • Tailwind CSS 4
Radix UI • Recharts • React Query • Framer Motion
```

### Backend
```
Express.js • Node.js • PostgreSQL
Drizzle ORM • Zod Validation • Passport Auth
```

### DevTools
```
Vite • ESBuild • TSX • Drizzle Kit
```

---

## 📡 API Endpoints

### Transactions
```
POST   /api/transactions/submit      - Analyze single transaction
GET    /api/transactions/:id          - Get transaction details
GET    /api/users/:upi/transactions   - User transaction history
```

### CSV Batch Processing
```
POST   /api/csv-upload                - Analyze CSV file (NEW!)
```

### Alerts
```
GET    /api/alerts/:userId            - Get user alerts
PATCH  /api/alerts/:alertId           - Update alert status
```

### Fraud Management
```
GET    /api/fraud-patterns            - Get pattern library
POST   /api/fraud-patterns            - Add custom pattern
GET    /api/blacklist                 - Get blacklist entries
POST   /api/blacklist/report          - Report fraudster
```

### Analytics
```
GET    /api/stats/fraud               - Get 30-day statistics
```

---

## 📁 Project Structure

```
UPI-Fraud-Guard/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── csv-upload.tsx ✨ NEW
│   │   │   ├── fraud-dashboard.tsx (updated)
│   │   │   ├── layout.tsx
│   │   │   └── ui/ (Radix UI components)
│   │   ├── pages/
│   │   ├── lib/
│   │   └── App.tsx
│   └── index.html
├── server/
│   ├── lib/
│   │   ├── fraudDetection.ts (4-layer engine)
│   │   ├── fraudPatterns.ts (12 patterns)
│   │   └── ...
│   ├── routes.ts (API + CSV upload)
│   ├── index.ts (Express server)
│   └── storage.ts
├── shared/
│   └── schema.ts (DB schema - 6 tables)
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## 🗄️ Database Schema

### Tables (6 optimized tables)
- `upiTransactions` - Transaction ledger
- `userProfiles` - User behavioral baselines
- `fraudPatterns` - Scam pattern repository
- `detectionEvents` - Fraud detection audit log
- `fraudAlerts` - User notifications
- `blacklistEntries` - Community fraud database

---

## 🚨 Risk Score Interpretation

| Score | Status | Color | Action |
|-------|--------|-------|--------|
| 0-40 | ✅ Approved | 🟢 Green | Allow transaction |
| 40-60 | ⚠️ Monitor | 🟡 Yellow | Watch for patterns |
| 60-80 | 🔴 Alert User | 🟠 Orange | Verification needed |
| 80-100 | 🛑 Critical | 🔴 Red | Recommend block |

---

## 💾 Sample CSV Format

**Required Columns:**
- `senderUpi` - Sender's UPI address
- `receiverUpi` - Receiver's UPI address
- `amount` - Transaction amount

**Optional Columns:**
- `timestamp` - Transaction time
- `description` - Transaction remarks
- `merchantName` - Merchant identifier
- `city` - Transaction location

**Example:**
```csv
senderUpi,receiverUpi,amount,description,merchantName,city
user1@upi,merchant@upi,5000,Online purchase,Amazon,Delhi
user2@upi,scammer@upi,50000,Urgent money transfer,Unknown,Mumbai
```

---

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm run dev              # Runs on port 5000

# Build for production
npm build              # Creates dist/

# Start production server
npm start              # Uses dist/

# Type checking
npm check              # TypeScript validation

# Database migration
npm run db:push        # Apply schema changes
```

---

## 📈 Performance

- **Detection Time**: < 100ms per transaction
- **Batch Processing**: 100-1000 transactions/minute
- **CSV Upload Limit**: 50MB per file
- **Database Queries**: Optimized with indexes
- **API Response**: < 200ms average

---

## 🔐 Security Features

- ✅ Zod input validation
- ✅ Passport authentication
- ✅ SQL injection prevention
- ✅ Rate limiting ready
- ✅ Session management
- ✅ CORS enabled

---

## 📝 License

MIT License - See LICENSE file for details

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

---

## 📞 Support

- 📧 Email: support@upifraudguard.com
- 🐛 Issues: GitHub Issues
- 💬 Discussions: GitHub Discussions

---

## 🎯 Roadmap

- [ ] Machine learning model integration
- [ ] Real-time WebSocket updates
- [ ] SMS/Email alert notifications
- [ ] Mobile app
- [ ] Integration with UPI providers
- [ ] Advanced analytics dashboard

---

**Built with ❤️ for fraud prevention in India**

```
Version: 1.0.0
Last Updated: December 2025
Status: Production Ready ✅
```
