# 🚀 GitHub Publishing Guide for UPI Fraud Guard

## Prerequisites
- Git installed on your machine
- GitHub account
- GitHub Desktop (optional, easier for Windows users)

## Quick Setup Steps

### Option 1: Using Git Command Line

1. **Install Git** (if not already installed)
   - Download from: https://git-scm.com/download/win
   - Run installer and complete setup

2. **Initialize Git Repository** (if not done)
   ```powershell
   cd "C:\Users\Kishan DV\OneDrive\Desktop\UPIFraudGuard-1\UPIFraudGuard-1"
   git init
   ```

3. **Configure Git**
   ```powershell
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

4. **Add All Files**
   ```powershell
   git add .
   ```

5. **Commit Changes**
   ```powershell
   git commit -m "Add CSV upload feature for batch fraud analysis"
   ```

6. **Create GitHub Repository**
   - Go to https://github.com/new
   - Repository name: `UPI-Fraud-Guard`
   - Description: "UPI Fraud Detection System with AI-powered analysis and batch CSV processing"
   - Set to Public
   - Click "Create Repository"

7. **Add Remote and Push**
   ```powershell
   git remote add origin https://github.com/YOUR_USERNAME/UPI-Fraud-Guard.git
   git branch -M main
   git push -u origin main
   ```

---

### Option 2: Using GitHub Desktop (Recommended for Windows)

1. **Download GitHub Desktop**
   - Go to: https://desktop.github.com/
   - Install and launch

2. **Sign in to GitHub**
   - Click "File" → "Options"
   - Sign in with your GitHub account

3. **Add Local Repository**
   - Click "File" → "Add Local Repository"
   - Browse to: `C:\Users\Kishan DV\OneDrive\Desktop\UPIFraudGuard-1\UPIFraudGuard-1`
   - Click "Add Repository"

4. **Publish Repository**
   - Click "Publish repository" button
   - Name: `UPI-Fraud-Guard`
   - Description: "UPI Fraud Detection System with AI-powered analysis"
   - Set to "Public"
   - Click "Publish Repository"

5. **Done!** Your repo is now on GitHub

---

## What Gets Published

### Core Features 🎯
- ✅ Multi-layer fraud detection engine
- ✅ 12+ known UPI scam patterns
- ✅ Real-time transaction monitoring
- ✅ **NEW: CSV batch upload & analysis**
- ✅ React dashboard with visualizations
- ✅ PostgreSQL database schema
- ✅ RESTful API endpoints

### Key Files
```
UPI-Fraud-Guard/
├── server/
│   ├── lib/fraudDetection.ts (4-layer detection)
│   ├── lib/fraudPatterns.ts (12 scam patterns)
│   ├── routes.ts (API endpoints including CSV upload)
│   └── index.ts (Express server)
├── client/
│   ├── components/csv-upload.tsx (NEW!)
│   ├── components/fraud-dashboard.tsx (updated)
│   └── pages/
├── shared/
│   └── schema.ts (database schema)
├── package.json
├── tsconfig.json
└── README.md
```

---

## After Publishing

### Add to README.md
Create/Update `README.md` in root:

```markdown
# 🛡️ UPI Fraud Guard - Fraud Detection System

Enterprise-grade fraud detection system for UPI transactions with AI-powered analysis.

## Features

- ✅ **Multi-Layer Detection**: Behavioral, Pattern, Anomaly, Blacklist analysis
- ✅ **CSV Batch Upload**: Analyze multiple transactions at once
- ✅ **12+ Scam Patterns**: Comprehensive coverage of known UPI frauds
- ✅ **Real-Time Dashboard**: Interactive monitoring with risk visualization
- ✅ **Risk Scoring**: Advanced algorithm with 0-100 score range

## Quick Start

```bash
npm install
npm run dev
```

Visit: http://localhost:5000

## Tech Stack

- Frontend: React 19 + TypeScript + Tailwind CSS
- Backend: Express.js + Node.js
- Database: PostgreSQL + Drizzle ORM
- Charts: Recharts

## CSV Upload Format

Your CSV should include:
- `senderUpi` (required)
- `receiverUpi` (required)
- `amount` (required)
- `timestamp` (optional)
- `description` (optional)
- `merchantName` (optional)
- `city` (optional)

## API Endpoints

- `POST /api/transactions/submit` - Analyze single transaction
- `POST /api/csv-upload` - Batch analyze CSV file
- `GET /api/alerts/:userId` - Get fraud alerts
- `GET /api/fraud-patterns` - Get pattern library
- `GET /api/stats/fraud` - Get statistics
```

---

## Sharing Your Project

Once published, share the link:
- **GitHub URL**: `https://github.com/YOUR_USERNAME/UPI-Fraud-Guard`
- **Clone Command**: `git clone https://github.com/YOUR_USERNAME/UPI-Fraud-Guard.git`

---

## Troubleshooting

**Git command not found:**
- Install Git from https://git-scm.com/download/win
- Restart terminal after installation

**Authentication error:**
- Use GitHub Personal Access Token instead of password
- Generate at: https://github.com/settings/tokens

**Large file warning:**
- Your CSV upload feature handles large files (up to 50MB)
- Make sure to add `node_modules/` to `.gitignore`

---

## Next Steps

1. ✅ Commit & Push to GitHub
2. Add `.gitignore` (already exists)
3. Add comprehensive README
4. Add sample CSV file to repo
5. Share link with team/portfolio

Enjoy! 🚀
