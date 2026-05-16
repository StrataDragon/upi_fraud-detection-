/**
 * useWebSocket — Real-time fraud alert hook
 * Connects to the native WebSocket at /ws, exposes live fraud alerts,
 * and syncs them to the Zustand global store (graph edges + transaction stream).
 */
import { useEffect, useRef, useState, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";

export interface LiveFraudAlert {
  type: "fraud_alert";
  severity: "low" | "medium" | "high" | "critical";
  riskScore: number;
  senderUpi: string;
  receiverUpi: string;
  amount: number;
  reasons: string[];
  action: "approve" | "verify" | "alert" | "block";
  timestamp: string;
}

interface UseWebSocketReturn {
  alerts: LiveFraudAlert[];
  latestAlert: LiveFraudAlert | null;
  isConnected: boolean;
  clearAlerts: () => void;
}

export function useWebSocket(): UseWebSocketReturn {
  const [alerts, setAlerts] = useState<LiveFraudAlert[]>([]);
  const [latestAlert, setLatestAlert] = useState<LiveFraudAlert | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Zustand store actions
  const { addTransaction, addGraphEdge, setCinemaAlert } = useAppStore.getState();

  const connect = useCallback(() => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "fraud_alert") {
            const alert = data as LiveFraudAlert;
            setLatestAlert(alert);
            setAlerts((prev) => [alert, ...prev].slice(0, 50));

            // Feed into Zustand global store
            const store = useAppStore.getState();
            store.addTransaction({
              id: Math.random().toString(36).slice(2),
              transactionId: `TX-${Date.now()}`,
              senderUpi: alert.senderUpi,
              receiverUpi: alert.receiverUpi,
              amount: alert.amount,
              riskScore: alert.riskScore,
              mlProbability: alert.riskScore, // use riskScore as proxy if ML prob not in WS payload
              isFraudulent: alert.riskScore >= 65,
              severity: alert.severity,
              recommendedAction: alert.action,
              reasons: alert.reasons,
              timestamp: alert.timestamp,
            });

            // Build graph edges for live transactions
            store.addGraphEdge(alert.senderUpi, alert.receiverUpi, alert.amount);

            // Check if mule ring is forming (3+ edges into one node)
            const { graphNodes } = useAppStore.getState();
            const mules = graphNodes.filter((n) => n.isMule);
            if (mules.length > 0 && !useAppStore.getState().cinemaAlert) {
              // Trigger cinema alert for new mule detections
              store.setCinemaAlert({
                type: "MULE_RING_DETECTED",
                title: "Money Mule Ring Identified",
                message: `A fan-in/fan-out pattern detected. Node ${mules[0].id} is receiving from multiple distinct senders and forwarding funds — a classic money laundering typology.`,
                nodes: mules.map((m) => m.id),
                timestamp: new Date().toISOString(),
              });
            }
          }

          // Handle graph-alert webhook echoes from backend
          if (data.type === "graph_alert") {
            useAppStore.getState().setCinemaAlert({
              type: "MULE_RING_DETECTED",
              title: "Syndicate Layering Alert",
              message: data.message || "DeepGraph detected a mule ring typology in the transaction network.",
              nodes: data.nodes || [],
              timestamp: new Date().toISOString(),
            });
          }
        } catch (e) {
          // Ignore malformed messages
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        reconnectTimer.current = setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch (err) {
      reconnectTimer.current = setTimeout(connect, 5000);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [connect]);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
    setLatestAlert(null);
  }, []);

  return { alerts, latestAlert, isConnected, clearAlerts };
}
