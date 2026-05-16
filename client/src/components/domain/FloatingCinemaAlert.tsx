/**
 * FloatingCinemaAlert — Full-screen takeover alert for critical events
 * Used when DeepGraph detects a mule ring / syndicate layering.
 * Creates the cinematic "wow" moment for judges.
 */
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { ShieldAlert, X, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FloatingCinemaAlert() {
  const { cinemaAlert, setCinemaAlert } = useAppStore();

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    if (cinemaAlert) {
      const timer = setTimeout(() => setCinemaAlert(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [cinemaAlert, setCinemaAlert]);

  return (
    <AnimatePresence>
      {cinemaAlert && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Black overlay with red tint */}
          <motion.div
            className="absolute inset-0 bg-red/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Scanning lines effect */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute left-0 right-0 h-px bg-red-500/20"
                initial={{ top: "-10%" }}
                animate={{ top: "110%" }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.25,
                  ease: "linear",
                }}
              />
            ))}
          </div>

          {/* Main alert card */}
          <motion.div
            className="relative z-10 w-full max-w-xl mx-4"
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -30 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Pulsing border glow */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-orange-500 opacity-30 blur-xl animate-pulse" />

            <div className="relative bg-[#0a0a0a] rounded-2xl border-2 border-red-500/60 p-8 space-y-5">
              {/* Close */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCinemaAlert(null)}
                className="absolute top-3 right-3 h-8 w-8 p-0 text-red-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>

              {/* Icon + Type */}
              <div className="flex items-center gap-3">
                <motion.div
                  className="p-3 rounded-xl bg-red-500/20 border border-red-500/40"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ShieldAlert className="w-8 h-8 text-red-400" />
                </motion.div>
                <div>
                  <motion.p
                    className="text-red-400 font-display font-bold text-xl tracking-[0.3em] uppercase"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {cinemaAlert.type === "MULE_RING_DETECTED"
                      ? "MULE RING DETECTED"
                      : "SYNDICATE LAYERING DETECTED"}
                  </motion.p>
                  <div className="flex items-center gap-2 mt-1">
                    <Radio className="w-3 h-3 text-red-400 animate-pulse" />
                    <span className="text-xs font-mono text-white/70">
                      THREAT CLUSTER IDENTIFIED AT {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Title */}
              <motion.h2
                className="text-white font-display text-2xl font-bold tracking-wide"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {cinemaAlert.title}
              </motion.h2>

              {/* Message */}
              <motion.p
                className="text-white/80 text-sm leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {cinemaAlert.message}
              </motion.p>

              {/* Nodes involved */}
              {cinemaAlert.nodes.length > 0 && (
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <p className="text-xs font-mono text-white/70 uppercase tracking-widest">
                    Linked Entities ({cinemaAlert.nodes.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {cinemaAlert.nodes.map((node, i) => (
                      <motion.span
                        key={node}
                        className="px-3 py-1 rounded-full text-xs font-mono bg-red-500/10 border border-red-500/30 text-white"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7 + i * 0.1 }}
                      >
                        {node}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Timer bar */}
              <motion.div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-red-500"
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 8, ease: "linear" }}
                />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
