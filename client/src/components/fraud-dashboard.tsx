/**
 * FraudMonitoringDashboard — Enterprise UPI Fraud Detection Center
 *
 * Features:
 * - Live fraud risk ticker via WebSocket
 * - Real-time alert popup toasts
 * - 4-layer detection breakdown cards
 * - Hourly fraud spike chart
 * - Fraud/clean pie chart
 * - Risk score bar chart
 * - Transaction timeline with ML probability badges
 * - CSV batch upload tab
 * - Severity-classified alert timeline
 * - Known fraud pattern library
 */
import React, { useState, useEffect, useRef } from "react";
import {
  AlertCircle,
  TrendingDown,
  Eye,
  EyeOff,
  ShieldCheck,
  ShieldX,
  Zap,
  Activity,
  Brain,
  ListFilter,
  Ban,
  User,
  Clock,
  IndianRupee,
  Target,
  Minus,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
} from "recharts";
import { CSVUpload } from "./csv-upload";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/store/useAppStore";
import { TypologyForceGraph } from "@/components/visualizations/TypologyForceGraph";
import { ConfidenceMeter } from "@/components/visualizations/SHAPWaterfallChart";

// ======== Types ========
interface Transaction {
  id: string;
  transactionId: string;
  senderUpi: string;
  receiverUpi: string;
  amount: string;
  timestamp: string;
  riskScore: string;
  mlProbability?: string;
  isFraudulent: boolean;
  severity?: "low" | "medium" | "high" | "critical";
  recommendedAction?: string;
  flaggedReason?: string;
  status: string;
}

interface FraudAlert {
  id: string;
  alertType: string;
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  status: "new" | "acknowledged" | "resolved";
  createdAt: string;
}

interface FraudStats {
  totalTransactions: number;
  fraudulentTransactions: number;
  fraudRate: string;
  totalAmount: string;
  fraudAmount: string;
  avgRiskScore: string;
  criticalCount?: number;
  highCount?: number;
  mediumCount?: number;
  lowCount?: number;
}

interface HourlyData {
  hour: string;
  total: number;
  fraud: number;
  amount: number;
}

interface RealtimeStats {
  transactionsLastHour: number;
  fraudLastHour: number;
  avgRiskLastHour: string;
  status: "normal" | "moderate" | "elevated";
}

// ======== Color helpers ========
const getRiskColor = (score: number) => {
  if (score >= 80) return "text-rose-600";
  if (score >= 60) return "text-amber-600";
  if (score >= 40) return "text-yellow-600";
  return "text-emerald-600";
};

const getRiskBadgeClass = (score: number) => {
  if (score >= 80) return "bg-red-500/20 border border-red-500/50 text-rose-700";
  if (score >= 60) return "bg-orange-100 border border-orange-500/50 text-amber-700";
  if (score >= 40) return "bg-yellow-100 border border-yellow-500/50 text-amber-700";
  return "bg-emerald-100 border border-green-500/50 text-emerald-700";
};

const getSeverityDot = (severity: string) => {
  switch (severity) {
    case "critical": return "bg-red-500";
    case "high":     return "bg-orange-500";
    case "medium":   return "bg-yellow-400";
    default:         return "bg-green-500";
  }
};

const PIE_COLORS = ["#22c55e", "#ef4444", "#f59e0b", "#f97316"];

// ======== Severity Alert Toast ========
function SeverityPopup({ alert, onClose }: { alert: any; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, [onClose]);

  const isCritical = alert.severity === "critical";

  return (
    <div
      className={`fixed right-6 top-6 z-50 w-80 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl
        transition-all duration-300 animate-in slide-in-from-right
        ${isCritical
          ? "border-red-500/40 bg-[#261014]/92 shadow-[0_18px_50px_rgba(127,29,29,0.28)]"
          : "border-orange-500/35 bg-[#24170f]/92 shadow-[0_18px_50px_rgba(124,45,18,0.24)]"
        }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldX
            className={`h-5 w-5 ${isCritical ? "text-rose-700 animate-pulse" : "text-amber-700"}`}
          />
          <span className={`text-sm font-bold uppercase tracking-[0.18em] ${isCritical ? "text-rose-700" : "text-amber-700"}`}>
            {isCritical ? "Critical Fraud" : "High Risk"}
          </span>
        </div>
        <button onClick={onClose} className="text-xs text-slate-500 hover:text-slate-950">Close</button>
      </div>
      <div className="mt-2 space-y-1">
        <p className="text-sm font-semibold text-slate-950">
          Rs {alert.amount?.toLocaleString()} to {alert.receiverUpi?.slice(0, 20)}...
        </p>
        <p className="text-xs text-slate-300">Risk Score: <span className="font-bold text-rose-700">{alert.riskScore?.toFixed(1)}</span></p>
        <p className="text-xs text-slate-300">Action: <span className="font-bold text-amber-700">{alert.action?.toUpperCase()}</span></p>
        {alert.reasons?.slice(0, 2).map((r: string, i: number) => (
          <p key={i} className="text-xs text-slate-600">- {r}</p>
        ))}
      </div>
    </div>
  );
}

// ======== Stat Card ========
function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  colorClass = "text-sky-700",
  trend,
}: {
  title: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  colorClass?: string;
  trend?: "up" | "down" | "flat";
}) {
  return (
    <Card className="glass-panel relative overflow-hidden rounded-[24px] border-slate-200/80 bg-white/82">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent_38%)]" />
      <CardContent className="pb-5 pt-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-slate-600">{title}</p>
            <p className={`mt-3 font-mono text-4xl font-bold tracking-tight ${colorClass}`}>{value}</p>
            {sub && <p className="mt-2 text-sm text-slate-600">{sub}</p>}
          </div>
          <div className={`rounded-2xl border border-slate-200/80 bg-slate-50/90 p-3 ${colorClass}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center gap-1 text-xs">
            {trend === "up" ? (
              <ChevronUp className="h-3 w-3 text-rose-600" />
            ) : trend === "down" ? (
              <ChevronDown className="h-3 w-3 text-emerald-600" />
            ) : (
              <Minus className="h-3 w-3 text-yellow-600" />
            )}
            <span className="text-slate-600">vs last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ======== Main Component ========
export function FraudMonitoringDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [stats, setStats] = useState<FraudStats | null>(null);
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
  const [realtimeStats, setRealtimeStats] = useState<RealtimeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUpi, setSelectedUpi] = useState<string>("");
  const [upiInput, setUpiInput] = useState<string>("");
  const [showRiskDetails, setShowRiskDetails] = useState<{ [key: string]: boolean }>({});
  const [popupAlert, setPopupAlert] = useState<any | null>(null);
  const { alerts: wsAlerts, latestAlert, isConnected } = useWebSocket();
  const { setSelectedTx, addGraphEdge } = useAppStore();

  // Show popup when new live fraud alert arrives
  useEffect(() => {
    if (
      latestAlert &&
      (latestAlert.severity === "critical" || latestAlert.severity === "high")
    ) {
      setPopupAlert(latestAlert);
    }
  }, [latestAlert]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [selectedUpi]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const requests: Promise<any>[] = [
        fetch("/api/stats/fraud").then((r) => r.json()),
        fetch("/api/stats/hourly").then((r) => r.json()),
        fetch("/api/stats/realtime").then((r) => r.json()),
        fetch("/api/alerts/recent/all").then((r) => r.json()),
      ];

      if (selectedUpi) {
        requests.push(
          fetch(`/api/users/${selectedUpi}/transactions`).then((r) => r.json())
        );
      } else {
        requests.push(
          fetch("/api/transactions/recent?limit=20").then((r) => r.json())
        );
      }

      const [statsData, hourly, realtime, alertsData, txData] =
        await Promise.all(requests);

      setStats(statsData);
      setHourlyData(hourly);
      setRealtimeStats(realtime);
      setAlerts(Array.isArray(alertsData) ? alertsData : []);
      setTransactions(Array.isArray(txData) ? txData : []);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpiSearch = () => {
    setSelectedUpi(upiInput.trim());
  };

  // ======== Pie chart data ========
  const pieData = stats
    ? [
        { name: "Safe", value: stats.totalTransactions - stats.fraudulentTransactions },
        { name: "Fraud", value: stats.fraudulentTransactions },
      ]
    : [];

  // ======== Severity distribution ========
  const severityPieData = stats
    ? [
        { name: "Low", value: stats.lowCount | 0, fill: "#22c55e" },
        { name: "Medium", value: stats.mediumCount | 0, fill: "#eab308" },
        { name: "High", value: stats.highCount | 0, fill: "#f97316" },
        { name: "Critical", value: stats.criticalCount | 0, fill: "#ef4444" },
      ]
    : [];

  const statusColor = realtimeStats?.status === "elevated"
    ? "text-rose-600"
    : realtimeStats?.status === "moderate"
    ? "text-yellow-600"
    : "text-emerald-600";

  return (
    <div className="w-full space-y-6">
      {/* Live Severity Popup */}
      {popupAlert && (
        <SeverityPopup alert={popupAlert} onClose={() => setPopupAlert(null)} />
      )}

      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="eyebrow mb-4">Realtime Fraud Command</div>
          <h1 className="text-4xl font-display font-extrabold tracking-[-0.03em] text-slate-950 md:text-5xl">
            FRAUD DETECTION CENTER
          </h1>
          <p className="mt-3 font-mono text-[12px] tracking-[0.18em] text-slate-600">
            AI-POWERED UPI THREAT INTELLIGENCE |{" "}
            <span className={statusColor}>
              LIVE {realtimeStats?.status?.toUpperCase() ?? "LOADING"}
            </span>
            {" | "}
            <span className={isConnected ? "text-emerald-700" : "text-rose-700"}>
              {isConnected ? "WS:LIVE" : "WS:OFFLINE"}
            </span>
          </p>
        </div>
        {/* UPI Search */}
        <div className="glass-panel flex items-center gap-2 rounded-2xl border-slate-200/80 bg-white/88 p-2">
          <input
            type="text"
            value={upiInput}
            onChange={(e) => setUpiInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUpiSearch()}
            placeholder="Filter by UPI (e.g. user@upi)"
            className="w-64 rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 font-mono text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary/50 focus:outline-none"
          />
          <Button
            onClick={handleUpiSearch}
            size="sm"
            className="rounded-xl border border-sky-200 bg-sky-50 px-4 text-slate-950 hover:bg-sky-100"
          >
            Search
          </Button>
          {selectedUpi && (
            <Button
              onClick={() => { setSelectedUpi(""); setUpiInput(""); }}
              size="sm"
              variant="ghost"
              className="text-slate-600"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Real-time Stats Bar */}
      {realtimeStats && (
        <div className="glass-panel grid grid-cols-3 gap-3 rounded-[24px] border-slate-200/80 bg-white/82 p-4">
          <div className="text-center">
            <p className="font-mono text-[11px] tracking-[0.2em] text-slate-600">TXN / HOUR</p>
            <p className="mt-3 font-mono text-3xl font-bold text-slate-950">{realtimeStats.transactionsLastHour}</p>
          </div>
          <div className="text-center border-x border-slate-200/80">
            <p className="font-mono text-[11px] tracking-[0.2em] text-slate-600">FRAUD / HOUR</p>
            <p className={`mt-3 font-mono text-3xl font-bold ${realtimeStats.fraudLastHour > 0 ? "text-rose-700" : "text-emerald-700"}`}>
              {realtimeStats.fraudLastHour}
            </p>
          </div>
          <div className="text-center">
            <p className="font-mono text-[11px] tracking-[0.2em] text-slate-600">AVG RISK (1H)</p>
            <p className={`mt-3 font-mono text-3xl font-bold ${getRiskColor(parseFloat(realtimeStats.avgRiskLastHour))}`}>
              {realtimeStats.avgRiskLastHour}
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            title="Total Transactions"
            value={stats.totalTransactions.toLocaleString()}
            sub={`Rs ${parseFloat(stats.totalAmount).toLocaleString()} total`}
            icon={Activity}
            colorClass="text-sky-700"
          />
          <StatCard
            title="Fraud Detected"
            value={stats.fraudulentTransactions}
            sub={`${stats.fraudRate}% fraud rate`}
            icon={ShieldX}
            colorClass="text-rose-600"
            trend="up"
          />
          <StatCard
            title="Avg Risk Score"
            value={parseFloat(stats.avgRiskScore).toFixed(1)}
            sub="0-100 scale"
            icon={Target}
            colorClass={getRiskColor(parseFloat(stats.avgRiskScore))}
          />
          <StatCard
            title="Critical Alerts"
            value={stats.criticalCount | 0}
            sub={`${stats.highCount | 0} high risk`}
            icon={Zap}
            colorClass="text-amber-600"
          />
        </div>
      )}

      {/* Critical Alerts Banner */}
      {alerts.filter((a) => a.status === "new" && a.severity === "critical").length > 0 && (
        <div className="space-y-2">
          {alerts
            .filter((a) => a.status === "new" && a.severity === "critical")
            .slice(0, 2)
            .map((alert) => (
              <Alert
                key={alert.id}
                className="border-red-500/40 bg-red-50/90 glass-panel"
              >
                <ShieldX className="h-4 w-4 text-rose-600" />
                <AlertTitle className="text-rose-700">{alert.title}</AlertTitle>
                <AlertDescription className="text-rose-700/80 text-sm">
                  {alert.message}
                  <div className="mt-2 flex gap-2">
                    <Badge className="bg-red-100 text-rose-700 border-red-500/50">
                      CRITICAL
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {new Date(alert.createdAt).toLocaleTimeString()}
                    </Badge>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
        </div>
      )}

      {/* Main Tabs */}
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="glass-panel h-auto gap-2 rounded-2xl border-slate-200/80 bg-white/88 p-2">
          <TabsTrigger value="transactions" className="rounded-xl px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-slate-600 data-[state=active]:bg-white/[0.07] data-[state=active]:text-slate-950">
            📊 Transactions
          </TabsTrigger>
          <TabsTrigger value="csv-upload" className="rounded-xl px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-slate-600 data-[state=active]:bg-white/[0.07] data-[state=active]:text-slate-950">
            📤 CSV Batch
          </TabsTrigger>
          <TabsTrigger value="alerts" className="rounded-xl px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-slate-600 data-[state=active]:bg-white/[0.07] data-[state=active]:text-slate-950">
            🚨 Alerts
          </TabsTrigger>
          <TabsTrigger value="patterns" className="rounded-xl px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-slate-600 data-[state=active]:bg-white/[0.07] data-[state=active]:text-slate-950">
            🎯 Patterns
          </TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-xl px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-slate-600 data-[state=active]:bg-white/[0.07] data-[state=active]:text-slate-950">
            📈 Analytics
          </TabsTrigger>
          <TabsTrigger value="network" className="rounded-xl px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-slate-600 data-[state=active]:bg-white/[0.07] data-[state=active]:text-slate-950">
            🔗 Network
          </TabsTrigger>
        </TabsList>

        {/* ---- TRANSACTIONS TAB ---- */}
        <TabsContent value="transactions" className="space-y-4 mt-4">
          <Card className="glass-panel rounded-[28px] border-slate-200/80 bg-white/82">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-display font-semibold tracking-tight text-slate-950">
                Transaction Feed {selectedUpi && `— ${selectedUpi}`}
              </CardTitle>
              <CardDescription className="font-mono text-[12px] text-slate-600">
                {transactions.length} transactions · risk + ML probability scores
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-mono">No transactions found</p>
                  <p className="text-xs mt-1">Enter a UPI address to filter, or wait for live transactions</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {transactions.map((tx) => {
                    const riskScore = parseFloat(tx.riskScore || "0");
                    const mlProb = parseFloat(tx.mlProbability || "0");
                    return (
                      <div
                        key={tx.id}
                        className={`cursor-pointer rounded-2xl border p-4 transition-all duration-200 ${
                          tx.isFraudulent
                            ? "border-red-500/28 bg-red-50/90 hover:border-red-500/45 hover:bg-red-50"
                            : "border-slate-200/70 bg-slate-50/90 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                        onClick={() => {
                          setSelectedTx({
                            id: tx.id,
                            transactionId: tx.transactionId,
                            senderUpi: tx.senderUpi,
                            receiverUpi: tx.receiverUpi,
                            amount: parseFloat(tx.amount),
                            riskScore: riskScore,
                            mlProbability: mlProb,
                            isFraudulent: tx.isFraudulent,
                            severity: tx.severity || "low",
                            recommendedAction: tx.recommendedAction || "approve",
                            reasons: tx.flaggedReason ? tx.flaggedReason.split(";").map((s: string) => s.trim()) : [],
                            timestamp: tx.timestamp,
                          });
                        }}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-mono text-[11px] tracking-[0.14em] text-slate-500">
                                TXN:{tx.transactionId.slice(0, 10)}
                              </p>
                              <p className="text-xs text-slate-500">
                                {new Date(tx.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <User className="w-3 h-3 text-sky-700/70" />
                              <p className="truncate font-mono text-xs text-slate-300">
                                {tx.senderUpi} → {tx.receiverUpi}
                              </p>
                            </div>
                            <p className="mt-2 font-mono text-2xl font-bold text-slate-950">
                              ₹{parseFloat(tx.amount).toLocaleString()}
                            </p>
                            {tx.flaggedReason && (
                              <p className="mt-2 line-clamp-1 text-xs text-slate-600">
                                <TrendingDown className="inline h-3 w-3 mr-1 text-rose-600" />
                                {tx.flaggedReason.split(";")[0].trim()}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col items-end gap-1 shrink-0">
                            {/* Risk score badge */}
                            <div className={`px-2 py-1 rounded-md font-mono font-bold text-sm ${getRiskBadgeClass(riskScore)}`}>
                              {riskScore.toFixed(1)}
                            </div>
                            {/* ML badge */}
                            <div className="rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-0.5 font-mono text-xs text-cyan-200">
                              ML:{mlProb.toFixed(0)}
                            </div>
                            {/* Severity */}
                            {tx.severity && (
                              <div className="flex items-center gap-1">
                                <div className={`w-1.5 h-1.5 rounded-full ${getSeverityDot(tx.severity)}`} />
                                <span className="font-mono text-[11px] uppercase text-slate-600">
                                  {tx.severity}
                                </span>
                              </div>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 rounded-lg p-0 text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                              onClick={() =>
                                setShowRiskDetails({
                                  ...showRiskDetails,
                                  [tx.id]: !showRiskDetails[tx.id],
                                })
                              }
                            >
                              {showRiskDetails[tx.id] ? (
                                <EyeOff className="h-3 w-3" />
                              ) : (
                                <Eye className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* Expandable reasons */}
                        {showRiskDetails[tx.id] && tx.flaggedReason && (
                          <div className="mt-3 space-y-1 border-t border-slate-200/70 pt-3">
                            {tx.flaggedReason.split(";").map((r, i) => (
                              <p key={i} className="font-mono text-[11px] tracking-[0.2em] text-slate-600">
                                • {r.trim()}
                              </p>
                            ))}
                            {tx.recommendedAction && (
                              <p className="text-xs mt-1">
                                <span className="text-slate-600">Action: </span>
                                <span className="font-bold uppercase text-amber-700">
                                  {tx.recommendedAction}
                                </span>
                              </p>
                            )}
                          </div>
                        )}

                        {tx.isFraudulent && (
                          <div className="mt-2 flex gap-2 flex-wrap">
                            <Badge className="border border-red-500/25 bg-red-100 text-xs text-rose-700">
                              ⚠️ FRAUDULENT
                            </Badge>
                            {tx.recommendedAction === "block" && (
                              <Badge className="border border-red-500/25 bg-red-100 text-xs text-red-100">
                                🔴 BLOCKED
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- CSV UPLOAD TAB ---- */}
        <TabsContent value="csv-upload" className="mt-4">
          <CSVUpload onUploadComplete={fetchData} />
        </TabsContent>

        {/* ---- ALERTS TAB ---- */}
        <TabsContent value="alerts" className="space-y-4 mt-4">
          <Card className="glass-panel rounded-[28px] border-slate-200/80 bg-white/82">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-display font-semibold tracking-tight text-slate-950">
                Fraud Alert Timeline
              </CardTitle>
              <CardDescription className="font-mono text-[12px] text-slate-600">
                {alerts.filter((a) => a.status === "new").length} unresolved alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {alerts.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <ShieldCheck className="w-8 h-8 mx-auto mb-3 opacity-30 text-emerald-600" />
                    <p className="text-sm font-mono text-emerald-600">All clear — no alerts</p>
                  </div>
                ) : (
                  alerts.map((alert) => {
                    const isNew = alert.status === "new";
                    const isCrit = alert.severity === "critical";
                    return (
                      <div
                        key={alert.id}
                        className={`flex gap-3 p-3 rounded-lg border transition-colors ${
                          isCrit
                            ? "border-red-500/30 bg-red-500/5"
                            : isNew
                            ? "border-orange-500/20 bg-orange-50/90"
                            : "border-slate-200/70 bg-white/70"
                        }`}
                      >
                        <div
                          className={`w-1 rounded-full shrink-0 ${
                            isCrit ? "bg-red-500" : "bg-orange-500"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-950">{alert.title}</p>
                          <p className="mt-1 line-clamp-2 text-xs text-slate-600">
                            {alert.message}
                          </p>
                          <p className="mt-2 font-mono text-xs text-slate-500">
                            {new Date(alert.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <Badge
                            className={`text-xs ${
                              isCrit
                                ? "bg-red-100 text-rose-700 border-red-500/50"
                                : "bg-orange-100 text-amber-700 border-orange-500/40"
                            }`}
                          >
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {alert.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Live WebSocket Alerts */}
          {wsAlerts.length > 0 && (
            <Card className="glass-panel rounded-[28px] border-sky-200 bg-white/82">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-display font-semibold tracking-tight text-slate-950">
                  <Activity className="inline w-4 h-4 mr-2 animate-pulse" />
                  Live Stream Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {wsAlerts.slice(0, 5).map((wa, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/90 p-3 text-xs font-mono"
                    >
                      <div className={`w-2 h-2 rounded-full ${getSeverityDot(wa.severity)} animate-pulse`} />
                      <span className="text-sky-700">{wa.severity.toUpperCase()}</span>
                      <span className="text-slate-950">₹{wa.amount.toLocaleString()}</span>
                      <span className="text-slate-600">→ {wa.receiverUpi.slice(0, 15)}…</span>
                      <span className={getRiskColor(wa.riskScore)}>RISK:{wa.riskScore.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ---- PATTERNS TAB ---- */}
        <TabsContent value="patterns" className="space-y-4 mt-4">
          <Card className="glass-panel rounded-[28px] border-slate-200/80 bg-white/82">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-display font-semibold tracking-tight text-slate-950">
                Known UPI Fraud Patterns
              </CardTitle>
              <CardDescription className="font-mono text-[12px] text-slate-600">
                12+ scam tactics actively monitored
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {[
                  { name: "Refund / OTP Phishing", cat: "Phishing", sev: "critical", desc: "Fake refund page that steals UPI PIN via OTP prompt" },
                  { name: "QR Code Swap", cat: "Social Engineering", sev: "critical", desc: "Physical QR replaced at merchant — payment diverted" },
                  { name: "Verification Attack Chain", cat: "Verification Scam", sev: "high", desc: "Small ₹1 test → large fraudulent follow-up transaction" },
                  { name: "Bank/RBI Impersonation", cat: "Impersonation", sev: "critical", desc: "Fake official demands 'test payment' or penalty transfer" },
                  { name: "Loan / Job Scam", cat: "Phishing", sev: "medium", desc: "Processing fee upfront for a fake loan or job offer" },
                  { name: "Delivery Partner Fraud", cat: "Impersonation", sev: "high", desc: "Scammer poses as Amazon/Flipkart for COD payment" },
                  { name: "Prize / Lottery", cat: "Phishing", sev: "medium", desc: "'Tax' or 'processing fee' to claim fake prize/lottery" },
                  { name: "Romantic Scam", cat: "Social Engineering", sev: "high", desc: "Fake relationship → emergency fund request via UPI" },
                  { name: "Rental / Property Fraud", cat: "Identity Theft", sev: "high", desc: "Fake listing → advance booking payment, no property" },
                  { name: "Identity Theft Bot Chain", cat: "Identity Theft", sev: "critical", desc: "Multiple rapid small transfers — compromised account" },
                  { name: "Fake Customer Support", cat: "Phishing", sev: "medium", desc: "WhatsApp support → requests UPI payment for 'billing fix'" },
                  { name: "Scholarship / Grant Scam", cat: "Phishing", sev: "low", desc: "Fake government scholarship requires registration fee" },
                ].map((p) => (
                  <div
                    key={p.name}
                    className="p-3 rounded-lg border border-slate-200/70 bg-white/70 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-950">{p.name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{p.desc}</p>
                      </div>
                      <Badge
                        className={`text-xs shrink-0 ${
                          p.sev === "critical"
                            ? "bg-red-100 text-rose-700 border-red-500/50"
                            : p.sev === "high"
                            ? "bg-orange-100 text-amber-700 border-orange-500/40"
                            : p.sev === "medium"
                            ? "bg-yellow-100 text-amber-700 border-yellow-500/40"
                            : "bg-emerald-100 text-emerald-700 border-emerald-300"
                        }`}
                      >
                        {p.sev.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="mt-2 font-mono text-xs text-slate-500">
                      Category: {p.cat}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- ANALYTICS TAB ---- */}
        <TabsContent value="analytics" className="space-y-4 mt-4">
          {/* Hourly Spike Chart */}
          <Card className="glass-panel rounded-[28px] border-slate-200/80 bg-white/82">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-display font-semibold tracking-tight text-slate-950">
                Hourly Fraud Spike (Last 24H)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={hourlyData}>
                  <defs>
                    <linearGradient id="fraudGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.28)" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(255,255,255,0.96)",
                      border: "1px solid rgba(203,213,225,0.9)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#06b6d4"
                    fill="url(#totalGrad)"
                    name="Total TXN"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="fraud"
                    stroke="#ef4444"
                    fill="url(#fraudGrad)"
                    name="Fraud TXN"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fraud vs Safe Pie */}
            <Card className="glass-panel rounded-[28px] border-slate-200/80 bg-white/82">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-display font-semibold tracking-tight text-slate-950">
                  Fraud vs Safe (30d)
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      dataKey="value"
                      paddingAngle={3}
                    >
                      <Cell fill="#22c55e" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "rgba(255,255,255,0.96)",
                        border: "1px solid rgba(203,213,225,0.9)",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Severity Distribution */}
            <Card className="glass-panel rounded-[28px] border-slate-200/80 bg-white/82">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-display font-semibold tracking-tight text-slate-950">
                  Severity Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 pt-2">
                  {severityPieData.map((item) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ background: item.fill }} />
                      <span className="text-xs font-mono text-muted-foreground w-16">
                        {item.name}
                      </span>
                      <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${stats ? (item.value / (stats.totalTransactions || 1)) * 100 : 0}%`,
                            background: item.fill,
                          }}
                        />
                      </div>
                      <span className="text-xs font-mono text-slate-950 w-8 text-right">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Risk Score Distribution */}
            <Card className="glass-panel rounded-[28px] border-slate-200/80 bg-white/82">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-display font-semibold tracking-tight text-slate-950">
                  Risk Score Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart
                    data={transactions
                      .slice(0, 12)
                      .map((t) => ({
                        txn: t.transactionId.slice(0, 6),
                        risk: parseFloat(t.riskScore),
                        ml: parseFloat(t.mlProbability || "0"),
                      }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.28)" />
                    <XAxis dataKey="txn" tick={{ fontSize: 9, fill: "#64748b" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#64748b" }} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(255,255,255,0.96)",
                        border: "1px solid rgba(203,213,225,0.9)",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="risk" fill="#ef4444" name="Rule Score" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="ml" fill="#a855f7" name="ML Prob." radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Detection Method Breakdown */}
            <Card className="glass-panel rounded-[28px] border-slate-200/80 bg-white/82">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-display font-semibold tracking-tight text-slate-950">
                  Detection Engine
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 pt-2">
                  {[
                    { label: "Behavioral Analysis", weight: 30, icon: User, color: "#06b6d4" },
                    { label: "Pattern Matching", weight: 35, icon: Target, color: "#f59e0b" },
                    { label: "Anomaly Detection", weight: 15, icon: Activity, color: "#a855f7" },
                    { label: "Blacklist Check", weight: 20, icon: Ban, color: "#ef4444" },
                  ].map((layer) => (
                    <div key={layer.label} className="flex items-center gap-3">
                      <layer.icon
                        className="w-4 h-4 shrink-0"
                        style={{ color: layer.color }}
                      />
                      <span className="text-xs font-mono text-muted-foreground flex-1">
                        {layer.label}
                      </span>
                      <div className="w-24 bg-white/5 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${layer.weight}%`,
                            background: layer.color,
                          }}
                        />
                      </div>
                      <span className="text-xs font-mono text-slate-950 w-8 text-right">
                        {layer.weight}%
                      </span>
                    </div>
                  ))}
                  <div className="mt-3 pt-3 border-t border-slate-200/80">
                    <p className="font-mono text-[11px] tracking-[0.2em] text-slate-600">
                      HYBRID FORMULA: <span className="text-sky-700">0.6 × rule + 0.4 × ml_prob</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ---- NETWORK TAB ---- */}
        <TabsContent value="network" className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-display tracking-wider text-slate-950">Transaction Network Graph</p>
              <p className="text-xs font-mono text-muted-foreground mt-0.5">
                Force-directed graph of UPI transaction flows · Click nodes to inspect
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/5 border border-sky-200">
              <kbd className="text-[10px] font-mono text-sky-700 bg-primary/10 px-2 py-0.5 rounded">Ctrl+K</kbd>
              <span className="text-xs font-mono text-muted-foreground">Demo Mode</span>
            </div>
          </div>
          <TypologyForceGraph height={500} mini={false} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

