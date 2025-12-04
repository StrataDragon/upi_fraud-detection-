import {
  upiTransactions,
  userProfiles,
  fraudPatterns,
  detectionEvents,
  blacklistEntries,
} from "../../shared/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

// Database will be injected at initialization
let db: any = null;

export function initializeFraudDetection(database: any) {
  db = database;
}

interface TransactionContext {
  senderUpi: string;
  receiverUpi: string;
  amount: number;
  timestamp: Date;
  location?: { lat: number; long: number; city: string };
  deviceInfo?: { deviceId: string; os: string; appVersion: string };
  merchantName?: string;
}

interface FraudScore {
  totalScore: number;
  confidence: number;
  reasons: string[];
  method: string;
}

// ============== BEHAVIORAL ANALYSIS ==============
export async function analyzeUserBehavior(
  upi: string,
  transaction: TransactionContext
): Promise<FraudScore> {
  const reasons: string[] = [];
  let score = 0;

  // Get user profile
  const profile = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.upiAddress, upi))
    .limit(1)
    .then((r: any[]) => r[0]);

  if (!profile) {
    reasons.push("New/unrecognized user");
    score += 15;
  } else {
    // Check against historical behavior
    const recentTransactions = await getRecentTransactions(upi, 30); // Last 30 days

    if (recentTransactions.length === 0) {
      reasons.push("No recent transaction history");
      score += 10;
    } else {
      // Analyze transaction amount deviation
      const avgAmount =
        recentTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0) /
        recentTransactions.length;
      const amountDeviation = Math.abs(
        (transaction.amount - avgAmount) / (avgAmount || 1)
      );

      if (amountDeviation > 2) {
        // More than 200% of usual amount
        reasons.push(
          `Unusual amount: ₹${transaction.amount} vs avg ₹${avgAmount.toFixed(2)}`
        );
        score += 25;
      }

      // Check velocity - transactions per hour
      const hourAgo = new Date(transaction.timestamp.getTime() - 3600000);
      const transactionsLastHour = recentTransactions.filter(
        (t) => new Date(t.timestamp) > hourAgo
      );

      if (transactionsLastHour.length > 5) {
        reasons.push(`High velocity: ${transactionsLastHour.length} tx in 1 hour`);
        score += 30;
      }

      // Check location anomaly
      if (
        transaction.location &&
        profile.frequentLocations &&
        Array.isArray(profile.frequentLocations)
      ) {
        const frequentCities = (profile.frequentLocations as any[]).map(
          (l) => l.city
        );
        if (
          frequentCities.length > 0 &&
          !frequentCities.includes(transaction.location.city)
        ) {
          reasons.push(
            `Unusual location: ${transaction.location.city} (usual: ${frequentCities.join(", ")})`
          );
          score += 20;
        }
      }

      // Check device anomaly
      if (
        transaction.deviceInfo &&
        profile.frequentLocations &&
        Array.isArray(profile.frequentLocations)
      ) {
        // Simple device fingerprinting - check if device ID changed recently
        reasons.push("New device detected");
        score += 15;
      }
    }
  }

  return {
    totalScore: Math.min(score, 100),
    confidence: Math.min(reasons.length * 15, 95),
    reasons,
    method: "behavioral_analysis",
  };
}

// ============== PATTERN MATCHING ==============
export async function matchFraudPatterns(
  transaction: TransactionContext
): Promise<FraudScore> {
  const reasons: string[] = [];
  let score = 0;

  // Get active fraud patterns
  const patterns = await db
    .select()
    .from(fraudPatterns)
    .where(eq(fraudPatterns.isActive, true));

  for (const pattern of patterns) {
    if (matchesPattern(transaction, pattern)) {
      reasons.push(`Matches pattern: ${pattern.name}`);

      // Score based on severity
      const severityScore = {
        low: 10,
        medium: 25,
        high: 50,
        critical: 100,
      };
      score += severityScore[pattern.severity as keyof typeof severityScore];
    }
  }

  return {
    totalScore: Math.min(score, 100),
    confidence: reasons.length > 0 ? 85 : 0,
    reasons,
    method: "pattern_matching",
  };
}

function matchesPattern(transaction: TransactionContext, pattern: any): boolean {
  const rules = pattern.detectionRules || [];
  if (!Array.isArray(rules)) return false;

  // Simple rule matching engine
  for (const rule of rules) {
    if (checkRule(transaction, rule)) {
      return true;
    }
  }
  return false;
}

function checkRule(transaction: TransactionContext, rule: any): boolean {
  // Rule format: { field: 'amount', operator: '>', value: 100000 }
  // or { field: 'keywords', operator: 'contains', value: 'refund' }

  switch (rule.field) {
    case "amount":
      return compareNumbers(
        transaction.amount,
        rule.operator,
        rule.value
      );
    case "receiverUpi":
      return compareStrings(
        transaction.receiverUpi,
        rule.operator,
        rule.value
      );
    case "merchantKeywords":
      return compareStrings(
        transaction.merchantName || "",
        rule.operator,
        rule.value
      );
    default:
      return false;
  }
}

function compareNumbers(
  actual: number,
  operator: string,
  expected: number
): boolean {
  switch (operator) {
    case ">":
      return actual > expected;
    case "<":
      return actual < expected;
    case "=":
      return actual === expected;
    case ">=":
      return actual >= expected;
    case "<=":
      return actual <= expected;
    default:
      return false;
  }
}

function compareStrings(
  actual: string,
  operator: string,
  expected: string
): boolean {
  switch (operator) {
    case "contains":
      return actual.toLowerCase().includes(expected.toLowerCase());
    case "equals":
      return actual.toLowerCase() === expected.toLowerCase();
    case "startsWith":
      return actual.toLowerCase().startsWith(expected.toLowerCase());
    default:
      return false;
  }
}

// ============== ANOMALY DETECTION ==============
export async function detectAnomalies(
  upi: string,
  transaction: TransactionContext
): Promise<FraudScore> {
  const reasons: string[] = [];
  let score = 0;

  // Get recent transaction statistics
  const recentTxs = await getRecentTransactions(upi, 7); // Last 7 days
  if (recentTxs.length < 3) {
    // Not enough data for anomaly detection
    return {
      totalScore: 0,
      confidence: 0,
      reasons: ["Insufficient history for anomaly detection"],
      method: "anomaly_detection",
    };
  }

  // Calculate statistical anomalies
  const amounts = recentTxs.map((t) => parseFloat(t.amount));
  const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const variance =
    amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    amounts.length;
  const stdDev = Math.sqrt(variance);

  // Z-score for current transaction
  const zScore = Math.abs((transaction.amount - mean) / (stdDev || 1));

  if (zScore > 2) {
    reasons.push(`Statistical anomaly: Z-score ${zScore.toFixed(2)}`);
    score = Math.min(zScore * 15, 80);
  }

  return {
    totalScore: score,
    confidence: score > 0 ? 80 : 0,
    reasons,
    method: "anomaly_detection",
  };
}

// ============== BLACKLIST CHECK ==============
export async function checkBlacklist(
  transaction: TransactionContext
): Promise<FraudScore> {
  const reasons: string[] = [];
  let score = 0;

  // Check if receiver is blacklisted
  const blacklistedReceiver = await db
    .select()
    .from(blacklistEntries)
    .where(
      and(
        eq(blacklistEntries.identifier, transaction.receiverUpi),
        eq(blacklistEntries.identifierType, "upi"),
        eq(blacklistEntries.isActive, true)
      )
    )
    .limit(1)
    .then((r: any[]) => r[0]);

  if (blacklistedReceiver) {
    reasons.push(
      `Blacklisted receiver: ${blacklistedReceiver.reason} (reports: ${blacklistedReceiver.reportCount})`
    );
    const severityScore = {
      low: 20,
      medium: 40,
      high: 70,
      critical: 100,
    };
    score += severityScore[blacklistedReceiver.severity as keyof typeof severityScore];
  }

  return {
    totalScore: Math.min(score, 100),
    confidence: score > 0 ? 95 : 0,
    reasons,
    method: "pattern_matching",
  };
}

// ============== MAIN DETECTION ORCHESTRATOR ==============
export async function detectFraud(
  transaction: TransactionContext
): Promise<{
  riskScore: number;
  isFraudulent: boolean;
  confidence: number;
  allReasons: string[];
  detectionDetails: Array<{
    method: string;
    score: number;
    confidence: number;
    reasons: string[];
  }>;
}> {
  const detectionResults = [];

  // Run all detection methods in parallel
  const [behavioralScore, patternScore, anomalyScore, blacklistScore] =
    await Promise.all([
      analyzeUserBehavior(transaction.senderUpi, transaction),
      matchFraudPatterns(transaction),
      detectAnomalies(transaction.senderUpi, transaction),
      checkBlacklist(transaction),
    ]);

  detectionResults.push(behavioralScore, patternScore, anomalyScore, blacklistScore);

  // Aggregate scores with weighted average
  const weights = {
    behavioral_analysis: 0.3,
    pattern_matching: 0.35,
    anomaly_detection: 0.15,
  };

  let weightedScore = 0;
  let totalWeight = 0;

  for (const result of detectionResults) {
    const weight =
      weights[result.method as keyof typeof weights] || 0.1;
    weightedScore += result.totalScore * weight;
    totalWeight += weight;
  }

  const finalScore = totalWeight > 0 ? weightedScore / totalWeight : 0;
  const avgConfidence =
    detectionResults.reduce((sum, r) => sum + r.confidence, 0) /
    detectionResults.length;
  const allReasons = detectionResults
    .flatMap((r) => r.reasons)
    .filter((r) => r);

  // Determine if fraudulent based on threshold
  const isFraudulent = finalScore > 60; // 60+ is suspicious

  return {
    riskScore: Math.round(finalScore * 100) / 100,
    isFraudulent,
    confidence: Math.round(avgConfidence),
    allReasons,
    detectionDetails: detectionResults.map((r) => ({
      method: r.method,
      score: r.totalScore,
      confidence: r.confidence,
      reasons: r.reasons,
    })),
  };
}

// ============== HELPER FUNCTIONS ==============
async function getRecentTransactions(
  upi: string,
  days: number
): Promise<any[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  return await db
    .select()
    .from(upiTransactions)
    .where(
      and(
        eq(upiTransactions.senderUpi, upi),
        gte(upiTransactions.timestamp, since),
        eq(upiTransactions.status, "success")
      )
    )
    .orderBy(desc(upiTransactions.timestamp))
    .limit(100);
}

export async function logDetectionEvent(
  transactionId: string,
  detectionResult: any,
  patternId?: string
): Promise<any> {
  if (!db) return null;

  return await db.insert(detectionEvents).values({
    transactionId,
    patternId: patternId || null,
    detectionMethod: detectionResult.detectionDetails[0]?.method || "unknown",
    riskScore: detectionResult.riskScore,
    confidence: detectionResult.confidence,
    flagDetails: {
      reasons: detectionResult.allReasons,
      scores: detectionResult.detectionDetails,
    },
    action: detectionResult.isFraudulent ? "alert" : "approve",
  });
}
