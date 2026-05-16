/**
 * Fraud Detection Page — Transaction Submission & Live ML Decision
 * Allows users to manually submit transactions through the full ML pipeline
 * and see real-time fraud decisions with SHAP explanation trigger.
 */
import React, { useState } from "react";
import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, ShieldX, Brain, Zap, IndianRupee,
  AlertTriangle, CheckCircle2, Clock, Send, RotateCcw,
  User, ArrowRight, Info,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

interface SubmitResult {
  transaction: {
    id: string;
    transactionId: string;
    riskScore: number;
    mlProbability: number;
    isFraudulent: boolean;
    severity: "low" | "medium" | "high" | "critical";
    recommendedAction: string;
    flaggedReason?: string;
  };
  fraudDetection: {
    isFraudulent: boolean;
    riskScore: number;
    reasons: string[];
    action: string;
  };
}

const ACTION_META: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  approve:  { label: "APPROVED",   color: "text-green-400",  bg: "bg-green-500/10 border-green-500/30",  icon: CheckCircle2 },
  verify:   { label: "VERIFY",     color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30", icon: AlertTriangle },
  alert:    { label: "ALERT",      color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30", icon: AlertTriangle },
  block:    { label: "BLOCKED",    color: "text-red-400",    bg: "bg-red-500/10 border-red-500/30",       icon: ShieldX },
};

const SEVERITY_COLOR: Record<string, string> = {
  low:      "text-green-400",
  medium:   "text-yellow-400",
  high:     "text-orange-400",
  critical: "text-red-400",
};

const PRESET_TRANSACTIONS = [
  {
    label: "Night Velocity Attack",
    color: "text-red-400",
    data: {
      transactionId: "",
      senderUpi: "velocity.attacker@ybl",
      receiverUpi: "suspicious.vendor@oksbi",
      amount: 49500,
      status: "pending",
      description: "urgent OTP refund processing required",
      merchantName: "UPI Support",
    },
  },
  {
    label: "Normal Transfer",
    color: "text-green-400",
    data: {
      transactionId: "",
      senderUpi: "normal.user@upi",
      receiverUpi: "merchant.shop@paytm",
      amount: 350,
      status: "pending",
      description: "Grocery payment",
      merchantName: "Local Grocery",
    },
  },
  {
    label: "Blacklist Probe",
    color: "text-orange-400",
    data: {
      transactionId: "",
      senderUpi: "scammer.bot@upi",
      receiverUpi: "known.fraud@hdfc",
      amount: 99000,
      status: "pending",
      description: "Investment scheme — guaranteed returns",
      merchantName: "InvestMax Corp",
    },
  },
  {
    label: "Mule Aggregator",
    color: "text-purple-400",
    data: {
      transactionId: "",
      senderUpi: "victim.user@upi",
      receiverUpi: "mule.collector@upi",
      amount: 8500,
      status: "success",
      description: "Reimbursement payment",
      merchantName: "",
    },
  },
];

export default function FraudPage() {
  const { setSelectedTx, addTransaction, addGraphEdge } = useAppStore();

  const [form, setForm] = useState({
    senderUpi: "",
    receiverUpi: "",
    amount: "",
    description: "",
    merchantName: "",
    status: "pending",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);
    setError(null);

    try {
      const body = {
        transactionId: `TX-MANUAL-${Date.now()}`,
        senderUpi: form.senderUpi,
        receiverUpi: form.receiverUpi,
        amount: parseFloat(form.amount),
        status: form.status,
        description: form.description,
        merchantName: form.merchantName,
        timestamp: new Date().toISOString(),
      };

      const res = await fetch("/api/transactions/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data: SubmitResult = await res.json();
      setResult(data);

      const reasons = data.fraudDetection?.reasons || [];

      // Sync to global store
      addTransaction({
        id: data.transaction.id,
        transactionId: data.transaction.transactionId,
        senderUpi: form.senderUpi,
        receiverUpi: form.receiverUpi,
        amount: parseFloat(form.amount),
        riskScore: data.transaction.riskScore,
        mlProbability: data.transaction.mlProbability,
        isFraudulent: data.transaction.isFraudulent,
        severity: data.transaction.severity,
        recommendedAction: data.transaction.recommendedAction,
        reasons,
        timestamp: new Date().toISOString(),
      });
      addGraphEdge(form.senderUpi, form.receiverUpi, parseFloat(form.amount));

    } catch (err: any) {
      setError(err.message || "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadPreset = (preset: typeof PRESET_TRANSACTIONS[0]) => {
    setForm({
      senderUpi: preset.data.senderUpi,
      receiverUpi: preset.data.receiverUpi,
      amount: String(preset.data.amount),
      description: preset.data.description,
      merchantName: preset.data.merchantName,
      status: preset.data.status,
    });
    setResult(null);
    setError(null);
  };

  const handleExplainAI = () => {
    if (!result) return;
    const reasons = result.fraudDetection?.reasons || [];
    setSelectedTx({
      id: result.transaction.id,
      transactionId: result.transaction.transactionId,
      senderUpi: form.senderUpi,
      receiverUpi: form.receiverUpi,
      amount: parseFloat(form.amount),
      riskScore: result.transaction.riskScore,
      mlProbability: result.transaction.mlProbability,
      isFraudulent: result.transaction.isFraudulent,
      severity: result.transaction.severity,
      recommendedAction: result.transaction.recommendedAction,
      reasons,
      timestamp: new Date().toISOString(),
    });
  };

  const actionMeta = result ? (ACTION_META[result.transaction.recommendedAction] || ACTION_META.approve) : null;
  const riskScore = result?.transaction.riskScore ?? 0;

  return (
    <Layout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold neon-text tracking-widest flex items-center gap-3">
            <Brain className="w-8 h-8" />
            FRAUD SIMULATION LAB
          </h1>
          <p className="text-xs font-mono text-muted-foreground mt-1">
            Submit transactions through the live ML pipeline — IsoForest + SHAP explainability
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-5">
          {/* Left: Form */}
          <div className="md:col-span-3 space-y-4">
            {/* Preset buttons */}
            <div className="space-y-2">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Quick Scenarios</p>
              <div className="flex flex-wrap gap-2">
                {PRESET_TRANSACTIONS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => loadPreset(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono border border-white/10 bg-white/5 hover:bg-white/10 transition-colors ${p.color}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <Card className="glass-panel border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-display tracking-wider">Transaction Details</CardTitle>
                <CardDescription className="font-mono text-xs">
                  All fields are passed to the full 4-layer + ML fraud detection engine
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* UPI row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                        Sender UPI
                      </label>
                      <input
                        value={form.senderUpi}
                        onChange={(e) => setForm({ ...form, senderUpi: e.target.value })}
                        placeholder="sender@upi"
                        required
                        className="w-full bg-black/30 border border-white/10 text-white text-sm px-3 py-2 rounded-lg font-mono focus:outline-none focus:border-primary/60 placeholder:text-muted-foreground/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                        Receiver UPI
                      </label>
                      <input
                        value={form.receiverUpi}
                        onChange={(e) => setForm({ ...form, receiverUpi: e.target.value })}
                        placeholder="receiver@upi"
                        required
                        className="w-full bg-black/30 border border-white/10 text-white text-sm px-3 py-2 rounded-lg font-mono focus:outline-none focus:border-primary/60 placeholder:text-muted-foreground/50"
                      />
                    </div>
                  </div>

                  {/* Amount + Status */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                        Amount (₹)
                      </label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                        <input
                          type="number"
                          value={form.amount}
                          onChange={(e) => setForm({ ...form, amount: e.target.value })}
                          placeholder="0.00"
                          required
                          min={1}
                          className="w-full bg-black/30 border border-white/10 text-white text-sm pl-8 pr-3 py-2 rounded-lg font-mono focus:outline-none focus:border-primary/60 placeholder:text-muted-foreground/50"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                        Status
                      </label>
                      <select
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                        className="w-full bg-black/30 border border-white/10 text-white text-sm px-3 py-2 rounded-lg font-mono focus:outline-none focus:border-primary/60"
                      >
                        <option value="pending">pending</option>
                        <option value="success">success</option>
                        <option value="failed">failed</option>
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                      Description (affects keyword scoring)
                    </label>
                    <input
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Payment for services..."
                      className="w-full bg-black/30 border border-white/10 text-white text-sm px-3 py-2 rounded-lg font-mono focus:outline-none focus:border-primary/60 placeholder:text-muted-foreground/50"
                    />
                  </div>

                  {/* Merchant */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                      Merchant Name
                    </label>
                    <input
                      value={form.merchantName}
                      onChange={(e) => setForm({ ...form, merchantName: e.target.value })}
                      placeholder="Merchant Inc."
                      className="w-full bg-black/30 border border-white/10 text-white text-sm px-3 py-2 rounded-lg font-mono focus:outline-none focus:border-primary/60 placeholder:text-muted-foreground/50"
                    />
                  </div>

                  {/* Submit */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-primary/20 border border-primary/40 text-primary hover:bg-primary/30 font-mono tracking-widest"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                          ANALYZING...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          SUBMIT TO ML ENGINE
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => { setResult(null); setError(null); setForm({ senderUpi: "", receiverUpi: "", amount: "", description: "", merchantName: "", status: "pending" }); }}
                      className="text-muted-foreground border border-white/10"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right: Result */}
          <div className="md:col-span-2">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm font-mono"
                >
                  ❌ {error}
                </motion.div>
              )}

              {!result && !error && !isSubmitting && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center py-12"
                >
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-3">
                    <Brain className="w-7 h-7 text-muted-foreground/30" />
                  </div>
                  <p className="text-sm font-mono text-muted-foreground/50">
                    ML Decision will appear here
                  </p>
                  <p className="text-xs text-muted-foreground/30 mt-1">
                    Select a preset or fill the form
                  </p>
                </motion.div>
              )}

              {isSubmitting && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center py-12"
                >
                  <div className="relative w-16 h-16 mb-3">
                    <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Brain className="w-7 h-7 text-primary animate-pulse" />
                    </div>
                  </div>
                  <p className="text-sm font-mono text-primary">Running ML pipeline...</p>
                  <p className="text-xs text-muted-foreground mt-1">IsoForest · SHAP · 4-Layer Rules</p>
                </motion.div>
              )}

              {result && !isSubmitting && actionMeta && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="space-y-3"
                >
                  {/* Decision Banner */}
                  <div className={`p-5 rounded-2xl border ${actionMeta.bg} text-center relative overflow-hidden`}>
                    {result.transaction.isFraudulent && (
                      <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none" />
                    )}
                    <div className="flex items-center justify-center mb-2">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.1 }}
                      >
                        {result.transaction.isFraudulent ? (
                          <ShieldX className="w-10 h-10 text-red-400" />
                        ) : (
                          <ShieldCheck className="w-10 h-10 text-green-400" />
                        )}
                      </motion.div>
                    </div>
                    <p className={`text-2xl font-bold font-display tracking-[0.2em] ${actionMeta.color}`}>
                      {actionMeta.label}
                    </p>
                    <p className="text-xs font-mono text-muted-foreground mt-1">
                      {result.transaction.transactionId}
                    </p>
                  </div>

                  {/* Score bars */}
                  <Card className="glass-panel border-white/10">
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-muted-foreground w-20">Rule Score</span>
                        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${riskScore >= 70 ? "bg-red-500" : riskScore >= 40 ? "bg-yellow-500" : "bg-green-500"}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${riskScore}%` }}
                            transition={{ duration: 0.8 }}
                          />
                        </div>
                        <span className={`text-sm font-mono font-bold w-10 text-right ${riskScore >= 70 ? "text-red-400" : riskScore >= 40 ? "text-yellow-400" : "text-green-400"}`}>
                          {riskScore.toFixed(0)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-muted-foreground w-20">ML Prob</span>
                        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-purple-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${result.transaction.mlProbability}%` }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                          />
                        </div>
                        <span className="text-sm font-mono font-bold w-10 text-right text-purple-400">
                          {result.transaction.mlProbability.toFixed(0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-white/5">
                        <span className="text-[10px] font-mono text-muted-foreground">Severity</span>
                        <span className={`text-xs font-bold font-mono uppercase ${SEVERITY_COLOR[result.transaction.severity]}`}>
                          {result.transaction.severity}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Reasons */}
                  {result.fraudDetection?.reasons?.length > 0 && (
                    <Card className="glass-panel border-white/10">
                      <CardContent className="pt-4 space-y-1.5">
                        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">
                          Detection Triggers
                        </p>
                        {result.fraudDetection.reasons.slice(0, 5).map((reason, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + i * 0.06 }}
                            className="flex items-start gap-2"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-red-400/60 mt-1.5 shrink-0" />
                            <p className="text-xs text-muted-foreground font-mono leading-relaxed">{reason}</p>
                          </motion.div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* XAI Button */}
                  <Button
                    onClick={handleExplainAI}
                    className="w-full bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 font-mono tracking-widest text-xs"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    EXPLAIN AI DECISION (SHAP)
                  </Button>

                  {/* Flow summary */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5 text-xs font-mono text-muted-foreground">
                    <User className="w-3 h-3 text-primary/50" />
                    <span className="truncate">{form.senderUpi}</span>
                    <ArrowRight className="w-3 h-3 shrink-0" />
                    <span className="truncate">{form.receiverUpi}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Info bar */}
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-primary/5 border border-primary/20 text-xs font-mono text-muted-foreground">
          <Info className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
          <span>
            Transactions are processed through the full 4-layer heuristic engine
            (Behavioral · Pattern · Anomaly · Blacklist) and forwarded to the Python ML sidecar
            (IsoForest). Results are persisted to the database and broadcast via WebSocket.
            Press <kbd className="px-1 py-0.5 rounded bg-white/10 text-primary">Ctrl+K</kbd> to run scripted demo scenarios.
          </span>
        </div>
      </div>
    </Layout>
  );
}
