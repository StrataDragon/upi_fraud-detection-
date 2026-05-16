/**
 * XAI SlideOut Panel — Explainable AI Context Panel
 * Slides in from the right when a transaction is selected.
 * Shows SHAP waterfall, confidence meter, and full reasoning breakdown.
 */
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Brain, Shield, AlertTriangle, Clock, User, ArrowRight } from "lucide-react";
import { useAppStore, LiveTransaction } from "@/store/useAppStore";
import { SHAPWaterfallChart, ConfidenceMeter } from "@/components/visualizations/SHAPWaterfallChart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function parseReasonsToSHAPFactors(reasons: string[]) {
  // Convert reason strings from ML backend into SHAP-like factors
  const factors: Array<{ feature: string; impact: number; label: string }> = [];

  reasons.forEach((reason) => {
    const lower = reason.toLowerCase();

    if (lower.includes("descriptionriskscore") || lower.includes("suspicious keywords")) {
      factors.push({ feature: "descriptionRiskScore", impact: 18, label: reason });
    } else if (lower.includes("amount") && !lower.includes("avg")) {
      factors.push({ feature: "amount", impact: 15, label: reason });
    } else if (lower.includes("newreceiver") || lower.includes("new/unrecognized") || lower.includes("new receiver")) {
      factors.push({ feature: "isNewReceiver", impact: 12, label: reason });
    } else if (lower.includes("velocity") || lower.includes("txcount1h") || lower.includes("sendertxcount")) {
      factors.push({ feature: "senderTxCount1h", impact: 22, label: reason });
    } else if (lower.includes("night") || lower.includes("nighttime")) {
      factors.push({ feature: "isNightTime", impact: 10, label: reason });
    } else if (lower.includes("blacklist")) {
      factors.push({ feature: "receiverIsBlacklisted", impact: 30, label: reason });
    } else if (lower.includes("zscore") || lower.includes("deviation")) {
      factors.push({ feature: "amountZScore", impact: 20, label: reason });
    } else if (lower.includes("weekend")) {
      factors.push({ feature: "isWeekend", impact: 5, label: reason });
    } else if (lower.includes("round")) {
      factors.push({ feature: "isRoundAmount", impact: 4, label: reason });
    } else if (lower.includes("history") || lower.includes("insufficient")) {
      factors.push({ feature: "senderTxCount7d", impact: 8, label: reason });
    } else if (lower.includes("known device") || lower.includes("profile found")) {
      factors.push({ feature: "senderAvgAmount", impact: -5, label: reason });
    } else {
      factors.push({ feature: reason.split(" ").slice(0, 2).join("_"), impact: 8, label: reason });
    }
  });

  // Sort by absolute impact descending
  return factors.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
}

export function XAISlideOutPanel() {
  const { selectedTx, setSelectedTx } = useAppStore();

  return (
    <AnimatePresence>
      {selectedTx && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedTx(null)}
          />

          {/* Panel */}
          <motion.div
            className="fixed top-0 right-0 h-full w-full max-w-lg bg-[#0a0a0a] border-l border-white/10 z-50 overflow-y-auto text-white"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <div className="p-6 space-y-6">
              {/* Close button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-white" />
                  <h2 className="text-sm font-display tracking-widest text-white uppercase">
                    AI Risk Analysis
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTx(null)}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Transaction Summary */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-muted-foreground">
                    TXN: {selectedTx.transactionId}
                  </span>
                  <Badge className={`text-xs ${
                    selectedTx.isFraudulent
                      ? "bg-red-500/20 text-red-300 border-red-500/40"
                      : "bg-green-500/20 text-green-300 border-green-500/40"
                  }`}>
                    {selectedTx.isFraudulent ? "⚠️ FRAUDULENT" : "✅ SAFE"}
                  </Badge>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <User className="w-4 h-4 text-primary/60" />
                    <div>
                      <p className="text-xs font-mono text-white">{selectedTx.senderUpi}</p>
                      <p className="text-[10px] text-muted-foreground">Sender</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <div className="flex items-center gap-2 flex-1">
                    <User className="w-4 h-4 text-orange-400/60" />
                    <div>
                      <p className="text-xs font-mono text-white">{selectedTx.receiverUpi}</p>
                      <p className="text-[10px] text-muted-foreground">Receiver</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div>
                    <p className="text-2xl font-bold text-white">
                      ₹{selectedTx.amount.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {new Date(selectedTx.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <ConfidenceMeter value={selectedTx.riskScore} size={72} />
                </div>
              </div>

              {/* Severity + Action */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[10px] font-mono text-muted-foreground uppercase">Severity</p>
                  <p className={`text-sm font-bold font-mono uppercase mt-1 ${
                    selectedTx.severity === "critical" ? "text-red-400" :
                    selectedTx.severity === "high" ? "text-orange-400" :
                    selectedTx.severity === "medium" ? "text-yellow-400" : "text-green-400"
                  }`}>
                    {selectedTx.severity}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[10px] font-mono text-muted-foreground uppercase">Action</p>
                  <p className={`text-sm font-bold font-mono uppercase mt-1 ${
                    selectedTx.recommendedAction === "block" ? "text-red-400" :
                    selectedTx.recommendedAction === "alert" ? "text-orange-400" :
                    selectedTx.recommendedAction === "verify" ? "text-yellow-400" : "text-green-400"
                  }`}>
                    {selectedTx.recommendedAction}
                  </p>
                </div>
              </div>

              {/* ML Score Bars */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                  Dual Score Analysis
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="text-xs font-mono text-muted-foreground w-20">Rule Score</span>
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-cyan-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedTx.riskScore}%` }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                    <span className="text-xs font-mono text-cyan-400 w-10 text-right">
                      {selectedTx.riskScore.toFixed(0)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Brain className="w-4 h-4 text-purple-400 shrink-0" />
                    <span className="text-xs font-mono text-muted-foreground w-20">ML Prob</span>
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-purple-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedTx.mlProbability}%` }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                      />
                    </div>
                    <span className="text-xs font-mono text-purple-400 w-10 text-right">
                      {selectedTx.mlProbability.toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* SHAP Waterfall — The showpiece */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <SHAPWaterfallChart
                  baselineRisk={10}
                  finalScore={selectedTx.riskScore}
                  factors={parseReasonsToSHAPFactors(selectedTx.reasons)}
                />
              </div>

              {/* Raw reasons */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Detection Reasons ({selectedTx.reasons.length})
                </h4>
                <div className="space-y-1">
                  {selectedTx.reasons.map((reason, i) => (
                    <motion.div
                      key={i}
                      className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.02] hover:bg-white/5 transition-colors"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400/60 mt-1.5 shrink-0" />
                      <p className="text-xs text-muted-foreground font-mono leading-relaxed">
                        {reason}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
