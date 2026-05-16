/**
 * SHAPWaterfallChart — Explainable AI Visualization
 * Renders a horizontal waterfall bar chart showing how each feature
 * contributed to the fraud score, making ML decisions transparent.
 */
import React from "react";
import { motion } from "framer-motion";

interface SHAPFactor {
  feature: string;
  impact: number; // positive = pushes toward fraud, negative = pushes toward safe
  label: string;
}

interface SHAPWaterfallChartProps {
  baselineRisk: number;
  finalScore: number;
  factors: SHAPFactor[];
}

const featureDisplayNames: Record<string, string> = {
  amount: "Transaction Amount",
  hourOfDay: "Time of Day",
  isNightTime: "Night Time (22:00-05:00)",
  senderTxCount1h: "Velocity (Txns/Hour)",
  senderTxCount7d: "Weekly Frequency",
  amountZScore: "Statistical Deviation",
  amountToAvgRatio: "Amount vs Average",
  isNewReceiver: "New Receiver",
  receiverIsBlacklisted: "Blacklisted Receiver",
  descriptionRiskScore: "Suspicious Keywords",
  isRoundAmount: "Round Amount Pattern",
  isWeekend: "Weekend Transaction",
  senderAvgAmount: "Sender Avg Amount",
  dayOfWeek: "Day of Week",
};

export function SHAPWaterfallChart({ baselineRisk, finalScore, factors }: SHAPWaterfallChartProps) {
  const maxImpact = Math.max(...factors.map((f) => Math.abs(f.impact)), 1);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
            AI DECISION WATERFALL
          </h4>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5">
            How each feature contributed to the risk score
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-mono text-muted-foreground">Final Score</p>
          <p className={`text-2xl font-bold font-mono ${
            finalScore >= 70 ? "text-red-400" : finalScore >= 40 ? "text-yellow-400" : "text-green-400"
          }`}>
            {finalScore.toFixed(1)}
          </p>
        </div>
      </div>

      {/* Baseline */}
      <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 border border-white/5">
        <span className="text-xs font-mono text-muted-foreground w-40 shrink-0">Base Risk</span>
        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-blue-500/50"
            initial={{ width: 0 }}
            animate={{ width: `${(baselineRisk / 100) * 100}%` }}
            transition={{ duration: 0.6, delay: 0.1 }}
          />
        </div>
        <span className="text-xs font-mono text-blue-400 w-12 text-right">{baselineRisk.toFixed(0)}%</span>
      </div>

      {/* Factor bars */}
      <div className="space-y-1">
        {factors.map((factor, i) => {
          const isPositive = factor.impact > 0; // positive = pushes toward fraud
          const barWidth = (Math.abs(factor.impact) / maxImpact) * 100;
          const displayName = featureDisplayNames[factor.feature] || factor.feature;

          return (
            <motion.div
              key={factor.feature}
              className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors group"
              initial={{ opacity: 0, x: isPositive ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              {/* Feature name */}
              <span className="text-xs font-mono text-muted-foreground w-40 shrink-0 truncate group-hover:text-white transition-colors">
                {displayName}
              </span>

              {/* Bar */}
              <div className="flex-1 flex items-center">
                {isPositive ? (
                  <div className="w-full flex items-center">
                    <motion.div
                      className="h-3 rounded-r-sm bg-gradient-to-r from-red-600/60 to-red-400/80 border-r border-red-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${barWidth}%` }}
                      transition={{ duration: 0.5, delay: 0.2 + i * 0.08 }}
                    />
                  </div>
                ) : (
                  <div className="w-full flex items-center justify-end">
                    <motion.div
                      className="h-3 rounded-l-sm bg-gradient-to-l from-emerald-600/60 to-emerald-400/80 border-l border-emerald-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${barWidth}%` }}
                      transition={{ duration: 0.5, delay: 0.2 + i * 0.08 }}
                    />
                  </div>
                )}
              </div>

              {/* Impact value */}
              <span className={`text-xs font-mono w-14 text-right font-bold ${
                isPositive ? "text-red-400" : "text-emerald-400"
              }`}>
                {isPositive ? "+" : ""}{factor.impact.toFixed(1)}%
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 pt-2 border-t border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-red-500/60" />
          <span className="text-[10px] font-mono text-muted-foreground">Pushes Toward Fraud</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-emerald-500/60" />
          <span className="text-[10px] font-mono text-muted-foreground">Pushes Toward Safe</span>
        </div>
      </div>
    </div>
  );
}

/**
 * ConfidenceMeter — Circular gauge showing ML confidence
 */
export function ConfidenceMeter({ value, size = 80 }: { value: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 70 ? "#EF4444" : value >= 40 ? "#F59E0B" : "#10B981";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={4}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold font-mono" style={{ color }}>{value.toFixed(0)}</span>
        <span className="text-[8px] font-mono text-muted-foreground uppercase">Risk</span>
      </div>
    </div>
  );
}
