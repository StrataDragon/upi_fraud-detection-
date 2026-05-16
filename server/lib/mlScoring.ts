/**
 * ML Scoring Module — UPI Fraud Guard
 * Hybrid fraud probability engine using feature engineering.
 *
 * In production, replace the heuristic ml_probability with a trained
 * XGBoost / Random Forest model served via a Python sidecar or ONNX Runtime.
 *
 * Feature engineering follows NPCI / RBI UPI fraud research patterns.
 */

export interface TransactionFeatures {
  amount: number;
  hourOfDay: number;           // 0-23
  dayOfWeek: number;           // 0-6 (0=Sunday)
  isWeekend: boolean;
  isNightTime: boolean;        // 22:00-05:00
  senderTxCount7d: number;     // velocity: last 7 days
  senderTxCount1h: number;     // velocity: last hour
  senderAvgAmount: number;     // historical average
  amountZScore: number;        // statistical deviation
  isNewReceiver: boolean;
  receiverIsBlacklisted: boolean;
  descriptionRiskScore: number; // keyword analysis 0-1
  isRoundAmount: boolean;      // multiples of 1000/500
  amountToAvgRatio: number;
}

/**
 * Extract structured features from raw transaction data.
 */
export function extractFeatures(params: {
  amount: number;
  timestamp: Date;
  senderTxCount7d: number;
  senderTxCount1h: number;
  senderAvgAmount: number;
  amountStdDev: number;
  isNewReceiver: boolean;
  receiverIsBlacklisted: boolean;
  description?: string;
}): TransactionFeatures {
  const {
    amount,
    timestamp,
    senderTxCount7d,
    senderTxCount1h,
    senderAvgAmount,
    amountStdDev,
    isNewReceiver,
    receiverIsBlacklisted,
    description = "",
  } = params;

  const hourOfDay = timestamp.getHours();
  const dayOfWeek = timestamp.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const isNightTime = hourOfDay >= 22 || hourOfDay <= 5;
  const amountZScore =
    amountStdDev > 0 ? Math.abs((amount - senderAvgAmount) / amountStdDev) : 0;
  const amountToAvgRatio =
    senderAvgAmount > 0 ? amount / senderAvgAmount : 1;
  const isRoundAmount =
    amount % 1000 === 0 || amount % 500 === 0 || amount % 100 === 0;

  // Keyword-based risk scoring for description/merchant
  const suspiciousKeywords = [
    "refund", "verify", "otp", "aadhar", "pan", "kyc", "urgent",
    "prize", "lottery", "won", "reward", "claim", "processing fee",
    "loan", "job offer", "work from home", "training fee",
    "delivery pending", "return", "tax", "fine", "penalty",
    "emergency", "help", "accident", "medical", "police",
  ];
  const lowerDesc = description.toLowerCase();
  const keywordHits = suspiciousKeywords.filter((kw) =>
    lowerDesc.includes(kw)
  ).length;
  const descriptionRiskScore = Math.min(keywordHits / 3, 1.0);

  return {
    amount,
    hourOfDay,
    dayOfWeek,
    isWeekend,
    isNightTime,
    senderTxCount7d,
    senderTxCount1h,
    senderAvgAmount,
    amountZScore,
    isNewReceiver,
    receiverIsBlacklisted,
    descriptionRiskScore,
    isRoundAmount,
    amountToAvgRatio,
  };
}

export async function computeMLProbability(features: TransactionFeatures): Promise<{ probability: number; shapReasons: string[] }> {
  try {
    const response = await fetch("http://127.0.0.1:8000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(features),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch from ML sidecar");
    }

    const data = await response.json();
    return {
      probability: data.mlProbability,
      shapReasons: data.shapReasons || [],
    };
  } catch (error) {
    console.error("[ML Sidecar] Error:", error);
    // Fallback to basic heuristics if sidecar is down
    return { probability: 50, shapReasons: ["Model unavailable, defaulting to baseline risk"] };
  }
}

/**
 * Master hybrid scoring formula.
 *
 * final_score = 0.6 * rule_score + 0.4 * ml_probability
 *
 * Both inputs are 0-100. Output is 0-100.
 */
export function computeHybridScore(
  ruleScore: number,
  mlProbability: number
): number {
  const hybrid = 0.6 * ruleScore + 0.4 * mlProbability;
  return Math.min(Math.round(hybrid * 10) / 10, 100);
}

/**
 * Suggest recommended action based on final score.
 */
export function recommendAction(
  finalScore: number
): "approve" | "verify" | "block" | "alert" {
  if (finalScore >= 85) return "block";
  if (finalScore >= 65) return "alert";
  if (finalScore >= 40) return "verify";
  return "approve";
}
