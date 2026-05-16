/**
 * TypologyForceGraph — DeepGraph Network Visualization
 * Renders a 2D force-directed graph showing UPI transaction network topology.
 * Detects and highlights mule ring clusters with cinematic visual effects.
 */
import React, { useRef, useEffect, useCallback } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { useAppStore } from "@/store/useAppStore";
import { Activity, Maximize2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TypologyForceGraphProps {
  width?: number;
  height?: number;
  mini?: boolean; // mini mode for dashboard embed
}

export function TypologyForceGraph({ width, height = 500, mini = false }: TypologyForceGraphProps) {
  const fgRef = useRef<any>();
  const { graphNodes, graphLinks, clearGraph } = useAppStore();

  const graphData = {
    nodes: graphNodes.map((n) => ({ ...n })),
    links: graphLinks.map((l) => ({ ...l })),
  };

  // Custom node rendering
  const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D) => {
    const size = node.val || 2;
    const color = node.color || "#00E5FF";

    // Glow effect for mule nodes
    if (node.isMule) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, size * 3, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(239, 68, 68, 0.15)";
      ctx.fill();

      // Pulsing ring
      ctx.beginPath();
      ctx.arc(node.x, node.y, size * 2.5, 0, 2 * Math.PI);
      ctx.strokeStyle = "rgba(239, 68, 68, 0.4)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Main node circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, size * 1.5, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();

    // Inner highlight
    ctx.beginPath();
    ctx.arc(node.x, node.y, size * 0.8, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.fill();

    // Label (only in full mode)
    if (!mini && node.id) {
      ctx.font = "3px JetBrains Mono, monospace";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fillText(node.id.split("@")[0], node.x, node.y + size * 2.5);
    }
  }, [mini]);

  // Custom link rendering
  const paintLink = useCallback((link: any, ctx: CanvasRenderingContext2D) => {
    const start = link.source;
    const end = link.target;

    if (!start || !end || typeof start.x === "undefined") return;

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = link.color || "rgba(0, 229, 255, 0.3)";
    ctx.lineWidth = link.width || 0.5;
    ctx.stroke();

    // Draw arrow
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const arrowLen = 3;
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;

    ctx.beginPath();
    ctx.moveTo(midX, midY);
    ctx.lineTo(
      midX - arrowLen * Math.cos(angle - Math.PI / 6),
      midY - arrowLen * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      midX - arrowLen * Math.cos(angle + Math.PI / 6),
      midY - arrowLen * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fillStyle = link.color || "rgba(0, 229, 255, 0.5)";
    ctx.fill();
  }, []);

  // Auto-zoom to fit on data change
  useEffect(() => {
    if (fgRef.current && graphNodes.length > 0) {
      setTimeout(() => {
        fgRef.current?.zoomToFit(400, 40);
      }, 500);
    }
  }, [graphNodes.length]);

  const handleReset = () => {
    clearGraph();
  };

  const handleFit = () => {
    fgRef.current?.zoomToFit(400, 40);
  };

  const isEmpty = graphNodes.length === 0;

  return (
    <div className={`relative bg-black/60 rounded-2xl border border-white/10 overflow-hidden ${mini ? "" : "glass-panel"}`}
         style={{ height }}>
      {/* Header overlay */}
      <div className="absolute top-3 left-4 z-10 pointer-events-none">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-primary animate-pulse" />
          <h3 className="text-primary font-display tracking-widest text-xs uppercase">
            {mini ? "Network" : "DeepGraph Typology Radar"}
          </h3>
        </div>
        {!mini && (
          <p className="text-[10px] font-mono text-muted-foreground mt-1">
            {graphNodes.length} nodes · {graphLinks.length} edges · Force-directed layout
          </p>
        )}
      </div>

      {/* Controls */}
      {!mini && (
        <div className="absolute top-3 right-4 z-10 flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFit}
            className="h-7 px-2 text-xs bg-white/5 hover:bg-white/10 border border-white/10"
          >
            <Maximize2 className="w-3 h-3 mr-1" /> Fit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-7 px-2 text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-red-400 hover:text-red-300"
          >
            <RotateCcw className="w-3 h-3 mr-1" /> Clear
          </Button>
        </div>
      )}

      {/* Empty state */}
      {isEmpty && (
        <div className="absolute inset-0 flex items-center justify-center z-5">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
              <Activity className="w-6 h-6 text-muted-foreground/30" />
            </div>
            <p className="text-sm font-mono text-muted-foreground/50">No graph data yet</p>
            <p className="text-[10px] text-muted-foreground/30 mt-1">
              Submit transactions or use Demo Mode (Ctrl+K)
            </p>
          </div>
        </div>
      )}

      {/* Force Graph */}
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        width={width}
        height={height}
        backgroundColor="transparent"
        nodeCanvasObject={paintNode}
        linkCanvasObject={paintLink}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={1.5}
        linkDirectionalParticleColor={() => "#00E5FF"}
        d3VelocityDecay={0.3}
        d3AlphaDecay={0.02}
        warmupTicks={50}
        cooldownTicks={100}
        onNodeClick={(node: any) => {
          if (!mini) {
            fgRef.current?.centerAt(node.x, node.y, 1000);
            fgRef.current?.zoom(6, 1000);
          }
        }}
      />

      {/* Mule count indicator */}
      {graphNodes.filter((n) => n.isMule).length > 0 && (
        <div className="absolute bottom-3 left-4 z-10">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/40">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-mono text-red-300 font-bold">
              {graphNodes.filter((n) => n.isMule).length} MULE NODE{graphNodes.filter((n) => n.isMule).length > 1 ? "S" : ""} DETECTED
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
