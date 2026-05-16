/**
 * Typology Radar — Full Screen Graph Network Page
 * Immersive 2D force-directed graph of all recent UPI transactions.
 */
import React from "react";
import Layout from "@/components/layout";
import { TypologyForceGraph } from "@/components/visualizations/TypologyForceGraph";
import { useAppStore } from "@/store/useAppStore";
import { Badge } from "@/components/ui/badge";
import { Network, Activity, ShieldAlert } from "lucide-react";

export default function TypologyRadar() {
  const { graphNodes, graphLinks } = useAppStore();
  const muleCount = graphNodes.filter((n) => n.isMule).length;

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold neon-text tracking-widest flex items-center gap-3">
              <Network className="w-7 h-7" />
              TYPOLOGY RADAR
            </h1>
            <p className="text-xs font-mono text-black/70 mt-1">
              Real-time transaction network topology · Force-directed graph visualization
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-white/5 border border-white/10 text-black/70 text-xs font-mono">
              {graphNodes.length} nodes
            </Badge>
            <Badge className="bg-white/5 border border-white/10 text-black/70 text-xs font-mono">
              {graphLinks.length} edges
            </Badge>
            {muleCount > 0 && (
              <Badge className="bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-mono animate-pulse">
                <ShieldAlert className="w-3 h-3 mr-1" />
                {muleCount} mule{muleCount > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </div>

        {/* Full Graph */}
        <TypologyForceGraph height={600} />

        {/* Legend */}
        <div className="flex items-center justify-center gap-8 py-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#00E5FF]" />
            <span className="text-[10px] font-mono text-black/70">Normal Node</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
            <span className="text-[10px] font-mono text-black/70">Suspicious</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#EF4444] shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
            <span className="text-[10px] font-mono text-black/70">Mule Aggregator</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-[#00E5FF]/40" />
            <span className="text-[10px] font-mono text-black/70">Fund Flow</span>
          </div>
        </div>

        {/* Hint */}
        <div className="text-center">
          <p className="text-[10px] font-mono text-white/50">
            Press Ctrl+K to open Demo Mode and inject transactions into the network
          </p>
        </div>
      </div>
    </Layout>
  );
}
