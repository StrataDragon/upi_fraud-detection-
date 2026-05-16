/**
 * useAppStore — Zustand global state for the SOC Dashboard
 * Holds live transactions, graph nodes/links, selected transaction, and demo mode state.
 */
import { create } from "zustand";

export interface LiveTransaction {
  id: string;
  transactionId: string;
  senderUpi: string;
  receiverUpi: string;
  amount: number;
  riskScore: number;
  mlProbability: number;
  isFraudulent: boolean;
  severity: "low" | "medium" | "high" | "critical";
  recommendedAction: string;
  reasons: string[];
  timestamp: string;
  flaggedReason?: string;
}

export interface GraphNode {
  id: string;
  val: number;
  color: string;
  label?: string;
  isMule?: boolean;
}

export interface GraphLink {
  source: string;
  target: string;
  amount: number;
  color?: string;
  width?: number;
}

interface CinemaAlert {
  type: "MULE_RING_DETECTED" | "SYNDICATE_LAYERING";
  title: string;
  message: string;
  nodes: string[];
  timestamp: string;
}

interface AppState {
  // Live transaction stream (bounded to 200)
  transactions: LiveTransaction[];
  addTransaction: (tx: LiveTransaction) => void;
  setTransactions: (txs: LiveTransaction[]) => void;

  // Selected transaction for XAI slide-out
  selectedTx: LiveTransaction | null;
  setSelectedTx: (tx: LiveTransaction | null) => void;

  // Graph data for DeepGraph
  graphNodes: GraphNode[];
  graphLinks: GraphLink[];
  addGraphEdge: (sender: string, receiver: string, amount: number) => void;
  clearGraph: () => void;

  // Cinema alerts (full screen takeover)
  cinemaAlert: CinemaAlert | null;
  setCinemaAlert: (alert: CinemaAlert | null) => void;

  // Demo mode
  isDemoMode: boolean;
  setDemoMode: (v: boolean) => void;

  // Command palette
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (v: boolean) => void;
}

const NODE_COLORS = {
  normal: "#00E5FF",
  suspicious: "#F59E0B",
  mule: "#EF4444",
  mastermind: "#FF2A5F",
};

export const useAppStore = create<AppState>((set, get) => ({
  transactions: [],
  addTransaction: (tx) =>
    set((state) => ({
      transactions: [tx, ...state.transactions].slice(0, 200),
    })),
  setTransactions: (txs) => set({ transactions: txs }),

  selectedTx: null,
  setSelectedTx: (tx) => set({ selectedTx: tx }),

  graphNodes: [],
  graphLinks: [],
  addGraphEdge: (sender, receiver, amount) =>
    set((state) => {
      const nodes = [...state.graphNodes];
      const links = [...state.graphLinks];

      // Add sender node if not exists
      if (!nodes.find((n) => n.id === sender)) {
        nodes.push({ id: sender, val: 2, color: NODE_COLORS.normal });
      }
      // Add receiver node if not exists
      if (!nodes.find((n) => n.id === receiver)) {
        nodes.push({ id: receiver, val: 2, color: NODE_COLORS.normal });
      }

      // Check if receiver is becoming a mule (high in-degree)
      const inDegree = links.filter((l) => {
        const target = typeof l.target === "object" ? (l.target as any).id : l.target;
        return target === receiver;
      }).length + 1; // +1 for this new link

      if (inDegree >= 3) {
        const nodeIdx = nodes.findIndex((n) => n.id === receiver);
        if (nodeIdx >= 0) {
          nodes[nodeIdx] = { ...nodes[nodeIdx], color: NODE_COLORS.mule, val: 5, isMule: true };
        }
      }

      // Add link
      const existingLink = links.find((l) => {
        const src = typeof l.source === "object" ? (l.source as any).id : l.source;
        const tgt = typeof l.target === "object" ? (l.target as any).id : l.target;
        return src === sender && tgt === receiver;
      });

      if (existingLink) {
        existingLink.amount += amount;
        existingLink.width = Math.min(existingLink.amount / 5000, 5);
      } else {
        links.push({
          source: sender,
          target: receiver,
          amount,
          color: "rgba(0, 229, 255, 0.4)",
          width: 1,
        });
      }

      return { graphNodes: nodes, graphLinks: links };
    }),
  clearGraph: () => set({ graphNodes: [], graphLinks: [] }),

  cinemaAlert: null,
  setCinemaAlert: (alert) => set({ cinemaAlert: alert }),

  isDemoMode: false,
  setDemoMode: (v) => set({ isDemoMode: v }),

  isCommandPaletteOpen: false,
  setCommandPaletteOpen: (v) => set({ isCommandPaletteOpen: v }),
}));
