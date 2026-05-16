/**
 * CommandPalette — Hidden Demo Mode (Ctrl+K)
 * Allows judges/presenters to trigger scripted fraud scenarios.
 * Scenario 1: "Subtle Anomaly" — single IsoForest-flagged transaction
 * Scenario 2: "Syndicate Explosion" — spawns 5 mule transactions into graph
 */
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Command, Zap, Network, Trash2, FlaskConical, Search, Keyboard } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

async function injectAnomaly() {
  const txId = `TX-DEMO-${Date.now()}`;
  const body = {
    transactionId: txId,
    senderUpi: "anomaly.user@upi",
    receiverUpi: "suspicious.vendor@upi",
    amount: 185000,
    status: "pending",
    description: "Urgent OTP verification required for KYC refund processing",
    merchantName: "Bank Support",
    timestamp: new Date().toISOString(),
  };

  try {
    const res = await fetch("/api/transactions/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return data;
  } catch (e) {
    console.error("Demo inject failed:", e);
    return null;
  }
}

async function spawnMuleRing(addGraphEdge: (s: string, r: string, a: number) => void) {
  const muleId = "mule.collector@upi";
  const mastermind = "mastermind@upi";
  const victims = [
    "victim.a@upi",
    "victim.b@upi",
    "victim.c@upi",
    "victim.d@upi",
    "victim.e@upi",
  ];

  // Step 1: Each victim sends to mule (with delays for cinematic effect)
  for (let i = 0; i < victims.length; i++) {
    const txId = `TX-RING-${Date.now()}-${i}`;
    const amount = 8000 + Math.floor(Math.random() * 4000);

    // Add to graph optimistically
    addGraphEdge(victims[i], muleId, amount);

    // Also push to backend
    fetch("/api/transactions/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transactionId: txId,
        senderUpi: victims[i],
        receiverUpi: muleId,
        amount,
        status: "success",
        description: "Payment transfer",
      }),
    }).catch(() => {});

    // Stagger for visual effect
    await new Promise((r) => setTimeout(r, 400));
  }

  // Step 2: Mule sends to mastermind after a pause
  await new Promise((r) => setTimeout(r, 800));

  addGraphEdge(muleId, mastermind, 45000);

  fetch("/api/transactions/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      transactionId: `TX-RING-${Date.now()}-OUT`,
      senderUpi: muleId,
      receiverUpi: mastermind,
      amount: 45000,
      status: "success",
      description: "Funds consolidation",
    }),
  }).catch(() => {});

  return { muleId, mastermind, victims };
}

export function CommandPalette() {
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    addGraphEdge,
    setCinemaAlert,
    clearGraph,
    setSelectedTx,
    addTransaction,
  } = useAppStore();

  const [isRunning, setIsRunning] = useState(false);

  // Keyboard shortcut: Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === "Escape") {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  const handleInjectAnomaly = async () => {
    setIsRunning(true);
    const result = await injectAnomaly();
    if (result?.transaction) {
      const tx = result.transaction;
      addTransaction({
        id: tx.id,
        transactionId: tx.transactionId,
        senderUpi: "anomaly.user@upi",
        receiverUpi: "suspicious.vendor@upi",
        amount: 185000,
        riskScore: tx.riskScore,
        mlProbability: tx.mlProbability,
        isFraudulent: tx.isFraudulent,
        severity: tx.severity,
        recommendedAction: tx.recommendedAction,
        reasons: tx.reasons || [],
        timestamp: new Date().toISOString(),
      });
      // Auto-select it to trigger XAI panel
      setSelectedTx({
        id: tx.id,
        transactionId: tx.transactionId,
        senderUpi: "anomaly.user@upi",
        receiverUpi: "suspicious.vendor@upi",
        amount: 185000,
        riskScore: tx.riskScore,
        mlProbability: tx.mlProbability,
        isFraudulent: tx.isFraudulent,
        severity: tx.severity,
        recommendedAction: tx.recommendedAction,
        reasons: tx.reasons || [],
        timestamp: new Date().toISOString(),
      });
    }
    setIsRunning(false);
    setCommandPaletteOpen(false);
  };

  const handleSpawnRing = async () => {
    setIsRunning(true);
    setCommandPaletteOpen(false);
    const result = await spawnMuleRing(addGraphEdge);

    // Fire cinematic alert after ring is formed
    setTimeout(() => {
      setCinemaAlert({
        type: "MULE_RING_DETECTED",
        title: "Money Mule Ring Identified",
        message: `A fan-in/fan-out typology has been detected. ${result.victims.length} distinct senders pooled funds into ${result.muleId}, which immediately forwarded ₹45,000 to ${result.mastermind}. This pattern matches known money laundering syndicate behavior.`,
        nodes: [...result.victims, result.muleId, result.mastermind],
        timestamp: new Date().toISOString(),
      });
    }, 1200);

    setIsRunning(false);
  };

  const handleClearGraph = () => {
    clearGraph();
    setCommandPaletteOpen(false);
  };

  const commands = [
    {
      icon: Zap,
      label: "Inject Subtle Anomaly",
      description: "Send a transaction that evades rules but triggers IsoForest",
      action: handleInjectAnomaly,
      color: "text-yellow-400",
    },
    {
      icon: Network,
      label: "Spawn Syndicate Ring",
      description: "Create 5 victim → mule → mastermind chain in real-time",
      action: handleSpawnRing,
      color: "text-red-400",
    },
    {
      icon: Trash2,
      label: "Clear Network Graph",
      description: "Reset the DeepGraph visualization",
      action: handleClearGraph,
      color: "text-white/70",
    },
  ];

  return (
    <AnimatePresence>
      {isCommandPaletteOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[90]"
            initial={{ opacity: 0.2 }}
            animate={{ opacity: 0.2 }}
            exit={{ opacity: 0 }}
            onClick={() => setCommandPaletteOpen(false)}
          />

          {/* Palette */}
          <motion.div
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-[91]"
            initial={{ opacity: 0.2, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <div className="bg-[#0a0a0a] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
              {/* Search header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
                <FlaskConical className="w-5 h-5 text-primary" />
                <p className="flex-1 text-sm font-display uppercase tracking-wider text-white">
                  Demo Command Center
                </p>
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 border border-white/10">
                  <Keyboard className="w-3 h-3 text-white/70" />
                  <span className="text-[10px] font-mono text-white/70">ESC to close</span>
                </div>
              </div>

              {/* Commands */}
              <div className="p-2">
                {commands.map((cmd) => (
                  <button
                    key={cmd.label}
                    onClick={cmd.action}
                    disabled={isRunning}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-left group disabled:opacity-50"
                  >
                    <div className={`p-2 rounded-lg bg-white/5 ${cmd.color} group-hover:bg-white/10 transition-colors`}>
                      <cmd.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white font-medium">{cmd.label}</p>
                      <p className="mt-0.5 text-xs text-white/65">{cmd.description}</p>
                    </div>
                    {isRunning && (
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    )}
                  </button>
                ))}
              </div>

              {/* Footer hint */}
              <div className="px-5 py-3 border-t border-white/5 bg-white/[0.02]">
                <p className="text-center text-[10px] font-mono text-white/55">
                  These commands inject real transactions through the ML pipeline for live demonstration
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
