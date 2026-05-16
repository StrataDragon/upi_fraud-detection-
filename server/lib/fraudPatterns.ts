// Standard fraud patterns for UPI scams in India
export const STANDARD_FRAUD_PATTERNS = [
  {
    name: "Refund Scam (OTP Phishing)",
    description: "Victim receives SMS/call pretending to be from their bank/merchant about a refund. They're directed to a fake refund page where they enter their UPI PIN.",
    category: "phishing",
    severity: "critical",
    indicators: ["refund", "verify account", "confirm identity", "otp", "urgent action required"],
    detectionRules: [
      {
        field: "merchantKeywords",
        operator: "contains",
        value: "refund"
      },
      {
        field: "amount",
        operator: "<",
        value: 500  // Often small test amount
      }
    ],
    riskFactors: {
      isSmallVerificationAmount: true,
      followedByLargeTransaction: true
    }
  },

  {
    name: "QR Code Swap at Store",
    description: "Fraudster replaces merchant's legitimate QR code with their own at physical retail locations. Victim scans fake QR thinking they're paying the merchant.",
    category: "social_engineering",
    severity: "critical",
    indicators: ["quick payment", "store", "merchant", "point of sale", "retail"],
    detectionRules: [
      {
        field: "receiverUpi",
        operator: "contains",
        value: "merchant"
      }
    ],
    riskFactors: {
      newUnknownReceiver: true,
      singleHighValueTransaction: true
    }
  },

  {
    name: "Impersonation - Delivery Partner",
    description: "Scammer impersonates delivery partner (Amazon, Flipkart, etc.) claiming there's an issue with COD payment or delivery, asks for UPI transfer.",
    category: "impersonation",
    severity: "high",
    indicators: ["delivery", "flipkart", "amazon", "payment issue", "cod", "courier", "package"],
    detectionRules: [
      {
        field: "merchantKeywords",
        operator: "contains",
        value: "delivery"
      },
      {
        field: "amount",
        operator: ">",
        value: 200
      },
      {
        field: "amount",
        operator: "<",
        value: 50000
      }
    ],
    riskFactors: {
      unknownReceiver: true,
      urgencyIndicators: true
    }
  },

  {
    name: "Impersonation - Bank/RBI Call",
    description: "Fake call claiming to be from victim's bank or RBI about suspicious activity, asking to make a 'test payment' or pay a fine to unlock account.",
    category: "impersonation",
    severity: "critical",
    indicators: ["rbi", "bank", "account locked", "suspicious activity", "compliance", "fine", "penalty"],
    detectionRules: [
      {
        field: "amount",
        operator: ">",
        value: 5000
      },
      {
        field: "amount",
        operator: "<",
        value: 100000
      }
    ],
    riskFactors: {
      unknownReceiver: true,
      largeAmount: true,
      urgencyIndicators: true
    }
  },

  {
    name: "Loan Scam",
    description: "SMS/email offering easy loans with minimal paperwork. Small upfront 'processing fee' payment via UPI. After payment, no loan and no contact.",
    category: "phishing",
    severity: "medium",
    indicators: ["loan", "easy money", "processing fee", "interest", "no documents", "quick disbursal"],
    detectionRules: [
      {
        field: "amount",
        operator: ">",
        value: 500
      },
      {
        field: "amount",
        operator: "<",
        value: 10000
      }
    ],
    riskFactors: {
      unknownReceiver: true,
      lowTrustSender: true
    }
  },

  {
    name: "Prize/Lottery Scam",
    description: "Victim informed they won a lottery/prize they never entered. Asked to pay 'tax' or 'processing fee' via UPI to claim their prize.",
    category: "phishing",
    severity: "medium",
    indicators: ["congratulations", "won", "prize", "lottery", "tax", "processing", "claim", "reward"],
    detectionRules: [
      {
        field: "amount",
        operator: ">",
        value: 1000
      },
      {
        field: "amount",
        operator: "<",
        value: 50000
      }
    ],
    riskFactors: {
      firstTimeTransaction: true,
      unknownReceiver: true
    }
  },

  {
    name: "Verification Transaction Attack",
    description: "Small test transaction sent first to verify account access. If successful, large fraudulent transaction follows immediately after.",
    category: "verification_scam",
    severity: "high",
    indicators: ["test", "verify", "check", "trial"],
    detectionRules: [
      {
        field: "amount",
        operator: ">",
        value: 1
      },
      {
        field: "amount",
        operator: "<",
        value: 100
      }
    ],
    riskFactors: {
      newReceiver: true,
      followedByLargeTransaction: true,
      velocityAnomaly: true
    }
  },

  {
    name: "Fake Customer Support",
    description: "WhatsApp/email posing as customer support from a service (Netflix, Amazon Prime, etc.). Claims subscription issue and asks for payment via UPI.",
    category: "phishing",
    severity: "medium",
    indicators: ["subscription", "billing issue", "payment failed", "update payment", "netflix", "amazon", "prime"],
    detectionRules: [
      {
        field: "amount",
        operator: ">",
        value: 100
      },
      {
        field: "amount",
        operator: "<",
        value: 5000
      }
    ],
    riskFactors: {
      unknownReceiver: true,
      lowTrustSender: true
    }
  },

  {
    name: "Rental Fraud",
    description: "Fake rental/property listing online. Victim asked to pay advance/booking amount via UPI to book property. Property doesn't exist, scammer disappears.",
    category: "identity_theft",
    severity: "high",
    indicators: ["rent", "property", "advance", "booking", "deposit", "house", "apartment"],
    detectionRules: [
      {
        field: "amount",
        operator: ">",
        value: 10000
      }
    ],
    riskFactors: {
      unknownReceiver: true,
      largeAmount: true,
      newAccount: true
    }
  },

  {
    name: "Job Scam",
    description: "Job posting for work-from-home/high-paying job. After 'interview', asked to pay for training materials, ID verification, or setup fee via UPI.",
    category: "phishing",
    severity: "medium",
    indicators: ["job", "work from home", "training", "salary", "recruitment", "verification fee"],
    detectionRules: [
      {
        field: "amount",
        operator: ">",
        value: 500
      },
      {
        field: "amount",
        operator: "<",
        value: 25000
      }
    ],
    riskFactors: {
      unknownReceiver: true,
      firstTimeTransaction: true
    }
  },

  {
    name: "Identity Theft Attack Chain",
    description: "Multiple small transactions to many different receivers within short time span. Sign of compromised account or bot testing stolen credentials.",
    category: "identity_theft",
    severity: "critical",
    indicators: ["rapid", "multiple", "unusual", "bot"],
    detectionRules: [
      // Detected via velocity analysis, not rule-based
    ],
    riskFactors: {
      highVelocity: true,
      multipleUnknownReceivers: true,
      anomalousPattern: true
    }
  },

  {
    name: "Darling Scam (Romantic Fraud)",
    description: "Fake romantic relationship built over time on social media. Eventually asks to send money for emergency (medical bills, travel, etc.) via UPI.",
    category: "social_engineering",
    severity: "high",
    indicators: ["emergency", "help me", "health", "travel", "medical", "accident"],
    detectionRules: [
      {
        field: "amount",
        operator: ">",
        value: 5000
      }
    ],
    riskFactors: {
      unknownReceiver: true,
      largeSuddenAmount: true,
      emotionalTriggers: true
    }
  }
];

// Velocity thresholds for anomaly detection
export const VELOCITY_THRESHOLDS = {
  transactionsPerHour: 10,
  transactionsPerDay: 50,
  amountPerDay: 500000, // ₹5 lakhs
  amountPerMonth: 5000000, // ₹50 lakhs
};

// Risk score multipliers
export const RISK_MULTIPLIERS = {
  newAccount: 1.5,
  unknownReceiver: 1.3,
  firstTimeTransaction: 1.2,
  unusualTime: 1.15,
  foreignLocation: 1.4,
  newDevice: 1.35,
  highAmount: 1.25,
  lowTrustReceiver: 1.3,
  velocity_anomaly: 1.5,
  pattern_match: 2.0,
};

// Whitelist patterns (legitimate common transactions)
export const WHITELIST_PATTERNS = [
  {
    name: "Salary/Stipend Transfer",
    keywords: ["salary", "stipend", "wages", "payment"],
    indicators: {
      regularSchedule: true,
      knownReceiver: true,
      consistentAmount: true,
      monthlyInterval: true
    }
  },
  {
    name: "Bill Payment",
    keywords: ["electricity", "water", "gas", "broadband", "insurance"],
    indicators: {
      regularSchedule: true,
      knownBiller: true,
      consistentAmount: true,
      utility: true
    }
  },
  {
    name: "Family Transfer",
    keywords: ["family", "parent", "spouse", "child"],
    indicators: {
      frequentContact: true,
      knownReceiver: true,
      regularTransactions: true,
      personalRelationship: true
    }
  }
];
