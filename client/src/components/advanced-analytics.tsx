import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, AlertTriangle, Users, Zap } from "lucide-react";

interface RiskDistribution {
  range: string;
  count: number;
  percentage: string;
}

interface Fraudster {
  upi: string;
  count: number;
  totalAmount: number;
  avgRisk: number;
}

interface FraudTimeline {
  date: string;
  total: number;
  fraud: number;
  amount: number;
  fraudRate: string;
}

interface MerchantAnalysis {
  merchant: string;
  total: number;
  fraud: number;
  avgRisk: number;
  totalAmount: number;
  fraudRate: string;
}

interface DetectionReason {
  reason: string;
  count: number;
}

interface PieReasonDatum {
  reason: string;
  count: number;
  fill: string;
}

export function AdvancedAnalytics() {
  const { data: riskDist = [] } = useQuery<RiskDistribution[]>({
    queryKey: ["/api/analytics/risk-distribution"],
    refetchInterval: 5000,
  });

  const { data: fraudsters = [] } = useQuery<Fraudster[]>({
    queryKey: ["/api/analytics/top-fraudsters"],
    refetchInterval: 5000,
  });

  const { data: timeline = [] } = useQuery<FraudTimeline[]>({
    queryKey: ["/api/analytics/fraud-timeline"],
    refetchInterval: 5000,
  });

  const { data: merchants = [] } = useQuery<MerchantAnalysis[]>({
    queryKey: ["/api/analytics/merchant-analysis"],
    refetchInterval: 5000,
  });

  const { data: reasons = [] } = useQuery<DetectionReason[]>({
    queryKey: ["/api/analytics/detection-breakdown"],
    refetchInterval: 5000,
  });

  const handleExport = async () => {
    try {
      const response = await fetch("/api/analytics/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days: 30, fraudOnly: false }),
      });
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `fraud-export-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
    }
  };

  const COLORS = ["#22c55e", "#eab308", "#f97316", "#ef4444", "#8b5cf6"];
  const totalReasonCount = reasons.reduce((sum, item) => sum + item.count, 0);
  const topReasons = reasons.slice(0, 5);
  const otherReasonCount = reasons.slice(5).reduce((sum, item) => sum + item.count, 0);
  const pieReasons: PieReasonDatum[] = topReasons.map((reason, index) => ({
    ...reason,
    fill: COLORS[index % COLORS.length],
  }));

  if (otherReasonCount > 0) {
    pieReasons.push({
      reason: "Other reasons",
      count: otherReasonCount,
      fill: "#94a3b8",
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-black">Advanced Analytics</h2>
          <p className="mt-1 text-sm text-muted-foreground">Deep insights into fraud patterns and trends</p>
        </div>
        <Button onClick={handleExport} className="gap-2 bg-primary/20 hover:bg-primary/30">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </div>

      <Card className="glass-panel border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            Risk Score Distribution (7 days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {riskDist.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center text-sm text-slate-500">
              No uploaded transaction data yet.
            </div>
          ) : (
            <div className="relative h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskDist}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="range" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="glass-panel border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            Fraud Incidents Over Time (30 days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {timeline.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center text-sm text-slate-500">
              Upload a CSV to populate the fraud timeline.
            </div>
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }} />
                  <Legend />
                  <Line type="monotone" dataKey="fraud" stroke="hsl(var(--destructive))" strokeWidth={2} name="Fraud Count" />
                  <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} name="Total Transactions" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-panel border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Top Fraudsters (30 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {fraudsters.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center text-sm text-slate-500">
                No fraudulent senders detected yet.
              </div>
            ) : (
              <div className="max-h-[400px] space-y-3 overflow-y-auto">
                {fraudsters.map((fraudster, index) => (
                  <div key={`${fraudster.upi}-${index}`} className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                    <div className="mb-2 flex items-start justify-between">
                      <p className="truncate font-mono text-sm text-slate-900">{fraudster.upi}</p>
                      <Badge className="bg-red-500/15 text-red-700">{fraudster.count} frauds</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>Amount: Rs {fraudster.totalAmount.toLocaleString()}</div>
                      <div>Avg Risk: {fraudster.avgRisk.toFixed(1)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-panel border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-400" />
              Risky Merchants (30 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {merchants.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center text-sm text-slate-500">
                Merchant analytics will appear after transaction uploads.
              </div>
            ) : (
              <div className="max-h-[400px] space-y-3 overflow-y-auto">
                {merchants.map((merchant, index) => (
                  <div key={`${merchant.merchant}-${index}`} className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-3">
                    <div className="mb-2 flex items-start justify-between">
                      <p className="truncate font-mono text-sm text-slate-900">{merchant.merchant}</p>
                      <Badge className="bg-orange-500/15 text-orange-700">{merchant.fraudRate}% fraud</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>Transactions: {merchant.total}</div>
                      <div>Avg Risk: {merchant.avgRisk.toFixed(1)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="glass-panel border-white/10">
        <CardHeader>
          <CardTitle>Top Fraud Detection Reasons (7 days)</CardTitle>
        </CardHeader>
        <CardContent>
          {reasons.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center text-sm text-slate-500">
              Detection reasons will populate after fraud findings are generated.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieReasons}
                      cx="50%"
                      cy="50%"
                      innerRadius={62}
                      outerRadius={92}
                      paddingAngle={3}
                      fill="#8884d8"
                      dataKey="count"
                      stroke="rgba(255,255,255,0.9)"
                      strokeWidth={2}
                    >
                      {pieReasons.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number, _name, payload: any) => [`${value}`, payload?.payload?.reason ?? "Reason"]} />
                  </PieChart>
              </ResponsiveContainer>
            </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center rounded-lg bg-white/5 p-3">
                  <div className="text-center">
                    <div className="text-2xl font-mono font-bold text-slate-950">{totalReasonCount}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-700">Total Flags</div>
                  </div>
                </div>
                {reasons.map((reason, index) => (
                  <div key={`${reason.reason}-${index}`} className="flex items-center justify-between rounded-lg bg-white/5 p-2">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-sm text-muted-foreground">{reason.reason}</span>
                    </div>
                    <Badge variant="outline">{reason.count}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
