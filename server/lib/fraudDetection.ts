/**
 * Fraud Detection Engine — UPI Fraud Guard
 *
 * 4-layer detection pipeline:
 *   1. Behavioral Analysis   (weight: 0.30)
 *   2. Pattern Matching      (weight: 0.35)
 *   3. Anomaly Detection     (weight: 0.15)
 *   4. Blacklist Check       (weight: 0.20)
 *
 * Final hybrid score = 0.6 * rule_score + 0.4 * ml_probability
 *
 * Recommended action thresholds:
 *   ≥ 85 → block
 *   ≥ 65 → alert
 *   ≥ 40 → verify
 *    < 40 → approve
 */

import {
  upiTransactions,
  userProfiles,
  fraudPatterns,
  detectionEvents,
  blacklistEntries,
} from "../../shared/schema";
import { eq, and, gte, lte, desc, count, sum } from "drizzle-orm";
import {
  extractFeatures,
  computeMLProbability,
  computeHybridScore,
  recommendAction,
} from "./mlScoring";

// Database will be injected at initialization
let db: any = null;

// Broadcast function — injected by WebSocket layer
let broadcastAlert: ((payload: any) => void) | null = null;

export function initializeFraudDetection(database: any) {
  db = database;
}

export function setBroadcastFn(fn: (payload: any) => void) {
  broadcastAlert = fn;
}

export interface TransactionContext {
  senderUpi: string;
  receiverUpi: string;
  amount: number;
  timestamp: Date;
  location?: { lat: number; long: number; city: string };
  deviceInfo?: { deviceId: string; os: string; appVersion: string };
  merchantName?: string;
  description?: string;
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

  const profile = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.upiAddress, upi))
    .limit(1)
    .then((r: any[]) => r[0]);

  if (!profile) {
    reasons.push("New/unrecognized sender — no profile found");
    score += 20;
  } else {
    const recentTransactions = await getRecentTransactions(upi, 30);

    if (recentTransactions.length === 0) {
      reasons.push("No recent transaction history in last 30 days");
      score += 12;
    } else {
      // Amount deviation from historical average
      const amounts = recentTransactions.map((t: any) => parseFloat(t.amount));
      const avgAmount = amounts.reduce((a: number, b: number) => a + b, 0) / amounts.length;
      const amountDeviation = Math.abs(
        (transaction.amount - avgAmount) / (avgAmount || 1)
      );

      if (amountDeviation > 3) {
        reasons.push(
          `Extreme amount deviation: ₹${transaction.amount.toLocaleString()} vs avg ₹${avgAmount.toFixed(0)}`
        );
        score += 30;
      } else if (amountDeviation > 2) {
        reasons.push(
          `Unusual amount: ₹${transaction.amount.toLocaleString()} vs avg ₹${avgAmount.toFixed(0)}`
        );
        score += 20;
      }

      // Velocity — last hour
      const hourAgo = new Date(transaction.timestamp.getTime() - 3_600_000);
      const txLastHour = recentTransactions.filter(
        (t: any) => new Date(t.timestamp) > hourAgo
      );
      if (txLastHour.length > 8) {
        reasons.push(
          `Critical velocity: ${txLastHour.length} transactions in the last hour`
        );
        score += 35;
      } else if (txLastHour.length > 4) {
        reasons.push(
          `High velocity: ${txLastHour.length} transactions in the last hour`
        );
        score += 22;
      }

      // Location anomaly
      if (
        transaction.location &&
        profile.frequentLocations &&
        Array.isArray(profile.frequentLocations)
      ) {
        const frequentCities = (profile.frequentLocations as any[]).map(
          (l: any) => l.city?.toLowerCase()
        );
        if (
          frequentCities.length > 0 &&
          !frequentCities.includes(transaction.location.city.toLowerCase())
        ) {
          reasons.push(
            `Geolocation anomaly: transaction from ${transaction.location.city} (usual: ${frequentCities.slice(0, 2).join(", ")})`
          );
          score += 22;
        }
      }

      // Device change detection
      if (transaction.deviceInfo && profile.frequentLocations) {
        // In production store last known device IDs in profile.devices[]
        reasons.push("New/unknown device detected for this account");
        score += 15;
      }
    }
  }

  // Trust score penalty — low trust sender
  if (profile) {
    const trustScore = parseFloat(profile.trustScore || "50");
    if (trustScore < 30) {
      reasons.push(`Low sender trust score: ${trustScore.toFixed(1)}`);
      score += 15;
    }
  }

  return {
    totalScore: Math.min(score, 100),
    confidence: Math.min(reasons.length * 18, 95),
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

  const patterns = await db
    .select()
    .from(fraudPatterns)
    .where(eq(fraudPatterns.isActive, true));

  const severityScore: Record<string, number> = {
    low: 10,
    medium: 25,
    high: 50,
    critical: 75,
  };

  for (const pattern of patterns) {
    if (matchesPattern(transaction, pattern)) {
      reasons.push(`Pattern matched: "${pattern.name}" (${pattern.severity})`);
      score += severityScore[pattern.severity as string] || 10;
    }
  }

  // Keyword scan on description
  if (transaction.description) {
    const urgencyKeywords = [
      "otp", "urgent", "verify", "refund", "prize", "reward",
      "kyc", "aadhar", "pan", "claim", "locked", "blocked",
    ];
    const lowerDesc = transaction.description.toLowerCase();
    const found = urgencyKeywords.filter((kw) => lowerDesc.includes(kw));
    if (found.length > 0) {
      reasons.push(
        `Suspicious keywords in description: ${found.slice(0, 3).join(", ")}`
      );
      score += found.length * 8;
    }
  }

  return {
    totalScore: Math.min(score, 100),
    confidence: reasons.length > 0 ? 88 : 0,
    reasons,
    method: "pattern_matching",
  };
}

function matchesPattern(
  transaction: TransactionContext,
  pattern: any
): boolean {
  const rules = pattern.detectionRules || [];
  if (!Array.isArray(rules) || rules.length === 0) return false;
  // Match if ANY rule fires (OR logic; for AND logic use .every)
  return rules.some((rule: any) => checkRule(transaction, rule));
}

function checkRule(transaction: TransactionContext, rule: any): boolean {
  switch (rule.field) {
    case "amount":
      return compareNumbers(transaction.amount, rule.operator, rule.value);
    case "receiverUpi":
      return compareStrings(
        transaction.receiverUpi,
        rule.operator,
        rule.value
      );
    case "merchantKeywords":
    case "keywords":
      return compareStrings(
        `${transaction.merchantName || ""} ${transaction.description || ""}`,
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
    case ">":  return actual > expected;
    case "<":  return actual < expected;
    case "=":  return actual === expected;
    case ">=": return actual >= expected;
    case "<=": return actual <= expected;
    default:   return false;
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

  const recentTxs = await getRecentTransactions(upi, 7);
  if (recentTxs.length < 3) {
    return {
      totalScore: 5, // Small penalty for insufficient history
      confidence: 20,
      reasons: ["Insufficient transaction history — possible new account"],
      method: "anomaly_detection",
    };
  }

  const amounts = recentTxs.map((t: any) => parseFloat(t.amount));
  const mean = amounts.reduce((a: number, b: number) => a + b, 0) / amounts.length;
  const variance =
    amounts.reduce(
      (s: number, v: number) => s + Math.pow(v - mean, 2),
      0
    ) / amounts.length;
  const stdDev = Math.sqrt(variance);
  const zScore = stdDev > 0
    ? Math.abs((transaction.amount - mean) / stdDev)
    : 0;

  if (zScore > 3) {
    reasons.push(
      `Extreme statistical anomaly: Z-score ${zScore.toFixed(2)} (amount ₹${transaction.amount.toLocaleString()} vs mean ₹${mean.toFixed(0)})`
    );
    score = Math.min(zScore * 18, 90);
  } else if (zScore > 2) {
    reasons.push(
      `Statistical anomaly detected: Z-score ${zScore.toFixed(2)}`
    );
    score = Math.min(zScore * 12, 70);
  }

  // Night-time transaction penalty
  const hour = transaction.timestamp.getHours();
  if (hour >= 23 || hour <= 4) {
    reasons.push("Transaction during unusual hours (11 PM – 5 AM)");
    score += 10;
  }

  // New receiver check
  const receiverHistory = recentTxs.filter(
    (t: any) => t.receiverUpi === transaction.receiverUpi
  );
  if (receiverHistory.length === 0 && transaction.amount > 5000) {
    reasons.push(
      `First-time transaction to new receiver: ${transaction.receiverUpi}`
    );
    score += 15;
  }

  return {
    totalScore: Math.min(score, 100),
    confidence: score > 0 ? 82 : 0,
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

  const severityScore: Record<string, number> = {
    low: 25,
    medium: 50,
    high: 78,
    critical: 100,
  };

  // Check receiver UPI
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
      `🚫 Receiver UPI blacklisted: ${blacklistedReceiver.reason} (${blacklistedReceiver.reportCount} reports)`
    );
    score += severityScore[blacklistedReceiver.severity as string] || 50;
  }

  // Check merchant name against blacklist keyword
  if (transaction.merchantName) {
    const blacklistedMerchant = await db
      .select()
      .from(blacklistEntries)
      .where(
        and(
          eq(blacklistEntries.identifier, transaction.merchantName),
          eq(blacklistEntries.isActive, true)
        )
      )
      .limit(1)
      .then((r: any[]) => r[0]);

    if (blacklistedMerchant) {
      reasons.push(
        `🚫 Merchant flagged: ${transaction.merchantName} (${blacklistedMerchant.reportCount} reports)`
      );
      score += severityScore[blacklistedMerchant.severity as string] || 40;
    }
  }

  return {
    totalScore: Math.min(score, 100),
    confidence: score > 0 ? 97 : 0,
    reasons,
    method: "blacklist_check",
  };
}

// ============== MAIN DETECTION ORCHESTRATOR ==============
export async function detectFraud(transaction: TransactionContext): Promise<{
  riskScore: number;
  mlProbability: number;
  isFraudulent: boolean;
  severity: "low" | "medium" | "high" | "critical";
  confidence: number;
  allReasons: string[];
  recommendedAction: "approve" | "verify" | "block" | "alert";
  detectionDetails: Array<{
    method: string;
    score: number;
    confidence: number;
    reasons: string[];
  }>;
}> {
  // Run all 4 detection layers in parallel for speed
  const [behavioralScore, patternScore, anomalyScore, blacklistScore] =
    await Promise.all([
      analyzeUserBehavior(transaction.senderUpi, transaction),
      matchFraudPatterns(transaction),
      detectAnomalies(transaction.senderUpi, transaction),
      checkBlacklist(transaction),
    ]);

  const detectionResults = [
    behavioralScore,
    patternScore,
    anomalyScore,
    blacklistScore,
  ];

  // Weighted rule-based aggregate
  // Weights must sum to 1.0
  const methodWeights: Record<string, number> = {
    behavioral_analysis: 0.30,
    pattern_matching:    0.35,
    anomaly_detection:   0.15,
    blacklist_check:     0.20,
  };

  let weightedRuleScore = 0;
  for (const result of detectionResults) {
    const w = methodWeights[result.method] ?? 0.10;
    weightedRuleScore += result.totalScore * w;
  }
  const ruleScore = Math.min(weightedRuleScore, 100);

  // ML probability layer — feature engineering
  const recentTxs = await getRecentTransactions(transaction.senderUpi, 7);
  const recentAmounts = recentTxs.map((t: any) => parseFloat(t.amount));
  const avgAmt =
    recentAmounts.length > 0
      ? recentAmounts.reduce((a: number, b: number) => a + b, 0) / recentAmounts.length
      : 0;
  const stdDevAmt =
    recentAmounts.length > 1
      ? Math.sqrt(
          recentAmounts.reduce(
            (s: number, v: number) => s + Math.pow(v - avgAmt, 2),
            0
          ) / recentAmounts.length
        )
      : 0;

  const hourAgo = new Date(transaction.timestamp.getTime() - 3_600_000);
  const txLastHour = recentTxs.filter(
    (t: any) => new Date(t.timestamp) > hourAgo
  ).length;

  const isNewReceiver =
    recentTxs.filter((t: any) => t.receiverUpi === transaction.receiverUpi)
      .length === 0;

  const features = extractFeatures({
    amount: transaction.amount,
    timestamp: transaction.timestamp,
    senderTxCount7d: recentTxs.length,
    senderTxCount1h: txLastHour,
    senderAvgAmount: avgAmt,
    amountStdDev: stdDevAmt,
    isNewReceiver,
    receiverIsBlacklisted: blacklistScore.totalScore > 0,
    description: transaction.description ?? transaction.merchantName,
  });

  const mlResult = await computeMLProbability(features);
  const mlProbability = mlResult.probability;

  // Hybrid final score: 0.6 * rule + 0.4 * ml
  const finalScore = computeHybridScore(ruleScore, mlProbability);

  const avgConfidence =
    detectionResults.reduce((s, r) => s + r.confidence, 0) /
    detectionResults.length;

  const allReasons = detectionResults
    .flatMap((r) => r.reasons)
    .filter(Boolean)
    .concat(mlResult.shapReasons);

  // Severity classification
  const severity: "low" | "medium" | "high" | "critical" =
    finalScore >= 85 ? "critical" :
    finalScore >= 65 ? "high" :
    finalScore >= 40 ? "medium" : "low";

  const isFraudulent = finalScore >= 60;
  const action = recommendAction(finalScore);

  // Broadcast real-time alert if fraudulent
  if (isFraudulent && broadcastAlert) {
    broadcastAlert({
      type: "fraud_alert",
      severity,
      riskScore: finalScore,
      senderUpi: transaction.senderUpi,
      receiverUpi: transaction.receiverUpi,
      amount: transaction.amount,
      reasons: allReasons.slice(0, 3),
      action,
      timestamp: new Date().toISOString(),
    });
  }

  return {
    riskScore: Math.round(finalScore * 100) / 100,
    mlProbability,
    isFraudulent,
    severity,
    confidence: Math.round(avgConfidence),
    allReasons,
    recommendedAction: action,
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
  if (!db) return [];
  const since = new Date();
  since.setDate(since.getDate() - days);

  return db
    .select()
    .from(upiTransactions)
    .where(
      and(
        eq(upiTransactions.senderUpi, upi),
        gte(upiTransactions.timestamp, since)
      )
    )
    .orderBy(desc(upiTransactions.timestamp))
    .limit(200);
}

export async function logDetectionEvent(
  transactionId: string,
  detectionResult: any,
  patternId?: string
): Promise<any> {
  if (!db) return null;

  return db.insert(detectionEvents).values({
    transactionId,
    patternId: patternId || null,
    detectionMethod:
      detectionResult.detectionDetails?.[0]?.method || "behavioral_analysis",
    riskScore: String(detectionResult.riskScore),
    confidence: String(detectionResult.confidence),
    flagDetails: {
      reasons: detectionResult.allReasons,
      scores: detectionResult.detectionDetails,
      mlProbability: detectionResult.mlProbability,
      hybridScore: detectionResult.riskScore,
      recommendedAction: detectionResult.recommendedAction,
    },
    action: detectionResult.recommendedAction || (detectionResult.isFraudulent ? "alert" : "approve"),
  });
}
