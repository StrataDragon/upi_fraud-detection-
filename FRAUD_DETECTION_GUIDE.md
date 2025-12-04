# UPI Fraud Pattern Detection System

## Overview

UPIFraudGuard implements a sophisticated, multi-layered fraud detection system designed specifically for India's UPI ecosystem. The system uses behavioral analysis, pattern matching, and anomaly detection to identify and prevent fraud in real-time.

## System Architecture

### Detection Layers

#### 1. **Behavioral Analysis** (30% weight)
- **User Baseline**: Establishes normal transaction behavior for each UPI address
- **Amount Deviation**: Detects unusual transaction amounts (200%+ of average)
- **Velocity Analysis**: Flags high-frequency transactions (>5/hour)
- **Location Anomaly**: Detects transactions from unusual geographic locations
- **Device Fingerprinting**: Identifies new device usage patterns

#### 2. **Pattern Matching** (35% weight)
- **Known Scam Detection**: Matches transactions against 12 common UPI fraud patterns
- **Keyword Analysis**: Scans merchant names and descriptions for fraud indicators
- **Rule Engine**: Flexible rules for specific fraud scenarios
- **Severity Scoring**: Adjusts risk based on fraud pattern severity (low/medium/high/critical)

#### 3. **Anomaly Detection** (15% weight)
- **Statistical Analysis**: Z-score calculation for amount anomalies
- **Historical Comparison**: Compares current transaction to 7-day history
- **Temporal Patterns**: Identifies unusual transaction times/sequences

#### 4. **Blacklist Checking** (20% weight)
- **UPI Blacklist**: Database of known fraudulent UPI addresses
- **Report Aggregation**: Community-driven reporting with severity escalation
- **Active Filtering**: Real-time blocking of known fraud accounts

## Fraud Patterns Library

### 1. **Refund Scam (OTP Phishing)**
- **Severity**: CRITICAL
- **Mechanism**: Victim directed to fake refund page, enters UPI PIN
- **Detection**: Keywords like "refund", "verify", + small amounts
- **Prevention**: User education on legitimate refund processes

### 2. **QR Code Swap**
- **Severity**: CRITICAL
- **Mechanism**: Fake QR code replaces merchant QR at store
- **Detection**: Unknown receiver, unusual merchant, high amounts
- **Prevention**: Merchant verification, amount validation

### 3. **Impersonation - Delivery Partner**
- **Severity**: HIGH
- **Mechanism**: Scammer pretends to be Flipkart/Amazon delivery
- **Detection**: Delivery keywords + COD-related amounts (₹200-₹50k)
- **Prevention**: Official app verification only

### 4. **Bank/RBI Impersonation**
- **Severity**: CRITICAL
- **Mechanism**: Fake official call about account lock, demands payment
- **Detection**: Large amounts, unknown receiver, urgency keywords
- **Prevention**: Official bank contact verification

### 5. **Loan Scam**
- **Severity**: MEDIUM
- **Mechanism**: Small upfront "processing fee" for easy loan
- **Detection**: Loan keywords + ₹500-₹10k amounts, unknown receiver
- **Prevention**: Awareness about official loan channels

### 6. **Verification Transaction Attack**
- **Severity**: HIGH
- **Mechanism**: Small test transaction followed by large fraud
- **Detection**: <₹100 transaction followed by larger amounts within hours
- **Prevention**: Velocity limits, user confirmation for large amounts

### 7-12. Additional Patterns
- Prize/Lottery Scams
- Fake Customer Support (Netflix, Amazon Prime)
- Rental Fraud
- Job Scams
- Darling Scam (Romantic Fraud)
- Identity Theft Attack Chains

## API Endpoints

### Transaction Processing

```
POST /api/transactions/submit
Request: {
  transactionId: string,
  senderUpi: string,
  receiverUpi: string,
  amount: number,
  timestamp?: ISO8601,
  status: "pending" | "success" | "failed",
  location?: { lat, long, city },
  deviceInfo?: { deviceId, os, appVersion },
  merchantName?: string
}

Response: {
  success: true,
  transaction: {
    id: string,
    riskScore: number (0-100),
    isFraudulent: boolean,
    confidence: number (0-100),
    reasons: string[]
  }
}
```

### Fraud Alerts

```
GET /api/alerts/:userId
GET /api/users/:upi/transactions

PATCH /api/alerts/:alertId
{
  status: "acknowledged" | "resolved" | "false_positive",
  userResponse?: object
}
```

### Fraud Patterns

```
GET /api/fraud-patterns
POST /api/fraud-patterns
{
  name: string,
  category: string,
  severity: "low" | "medium" | "high" | "critical",
  detectionRules: Rule[],
  indicators: string[]
}
```

### Blacklist Management

```
POST /api/blacklist/report
{
  identifier: string,
  identifierType: "upi" | "phone" | "device_id" | "email" | "ip_address",
  reason: string,
  severity: string
}

GET /api/blacklist
```

### Analytics & Statistics

```
GET /api/stats/fraud
Response: {
  totalTransactions: number,
  fraudulentTransactions: number,
  fraudRate: string,
  totalAmount: string,
  fraudAmount: string,
  avgRiskScore: string
}
```

## Risk Scoring Algorithm

### Final Score Calculation
```
weightedScore = 
  (behavioral_score * 0.30) +
  (pattern_score * 0.35) +
  (anomaly_score * 0.15) +
  (blacklist_score * 0.20)

if weightedScore > 60: flagged as potentially fraudulent
if weightedScore > 80: high priority alert for user
```

### Risk Multipliers Applied
- New Account: 1.5x
- Unknown Receiver: 1.3x
- First Transaction: 1.2x
- New Device: 1.35x
- High Amount: 1.25x
- Pattern Match: 2.0x

## Database Schema

### Core Tables
- `upi_transactions`: All submitted transactions
- `user_profiles`: User behavior baselines
- `fraud_patterns`: Known scam patterns database
- `detection_events`: Logs of fraud detection
- `fraud_alerts`: User notifications
- `blacklist_entries`: Known fraudulent entities

## Frontend Dashboard Features

1. **Real-time Monitoring**
   - Live transaction feed with risk scores
   - Color-coded risk levels (red=critical, orange=high, yellow=medium, green=low)
   - One-click alert acknowledgment

2. **Fraud Pattern Library**
   - Educational material on common scams
   - Real-time pattern matching results
   - Historical trend analysis

3. **Analytics & Insights**
   - 30-day fraud statistics
   - Risk score distribution
   - Transaction categorization
   - Fraud rate trends

4. **Alert Management**
   - Chronological alert timeline
   - User feedback on alert accuracy
   - Resolution tracking

## Deployment Considerations

### Database
- PostgreSQL 14+
- Requires migrations for all tables
- Indexing on frequently queried fields (senderUpi, timestamp, isFraudulent)

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Set to "development" or "production"
- `PORT`: Server port (default 5000)

### Performance Optimization
- Detection runs in parallel for all 4 methods
- Database queries cached for 5 minutes
- Real-time alerts through in-memory store

## Future Enhancements

1. **Machine Learning Integration**
   - Gradient Boosting for fraud prediction
   - Deep learning for pattern recognition
   - Automated model retraining

2. **Real-time Features**
   - WebSocket support for live alerts
   - SMS/Email notifications
   - Push notifications to mobile app

3. **Advanced Analytics**
   - Community fraud reporting network
   - Threat intelligence sharing with banks
   - Predictive fraud trends

4. **User Experience**
   - One-time verification codes
   - Transaction blocking with user appeal
   - Educational pop-ups at transaction time

## Testing & Validation

### Sample Test Cases

```typescript
// Refund Scam Detection
POST /api/transactions/submit {
  senderUpi: "user@bank",
  receiverUpi: "refund-scammer@bank",
  amount: 50,
  description: "Refund verification",
  merchantName: "Refund Processing"
}
// Expected: riskScore > 70, flaggedReason contains "refund"

// Large Amount from New Device
POST /api/transactions/submit {
  senderUpi: "user@bank",
  receiverUpi: "unknown@bank",
  amount: 100000,
  deviceInfo: { deviceId: "new-device-123" }
}
// Expected: riskScore > 60, device anomaly detected

// Velocity Attack
[5 transactions submitted within 1 hour]
// Expected: 5th transaction flagged with velocity anomaly
```

## Support & Reporting

For fraud detection accuracy feedback:
- Report false positives/negatives via `/api/alerts/:id` PATCH
- Submit new fraud patterns via `/api/fraud-patterns` POST
- Report fraudulent accounts via `/api/blacklist/report` POST

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Status**: Production Ready
