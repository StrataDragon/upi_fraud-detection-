import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { BrainCircuit, Network, Share2 } from "lucide-react";
import { TypologyForceGraph } from "@/components/visualizations/TypologyForceGraph";
import { useQuery } from "@tanstack/react-query";

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const tooltipStyle = {
  backgroundColor: "rgba(255,255,255,0.96)",
  borderColor: "rgba(203,213,225,0.9)",
  borderRadius: "16px",
  color: "#0f172a",
  boxShadow: "0 16px 40px rgba(15, 23, 42, 0.12)",
};

export default function Analysis() {
  const { data: hourlyStats = [] } = useQuery({
    queryKey: ["/api/stats/hourly"],
    refetchInterval: 30000,
  });

  const { data: patterns = [] } = useQuery({
    queryKey: ["/api/fraud-patterns"],
  });

  const trendData = (hourlyStats as any[]).map((stat: any) => ({
    time: stat.hour,
    fraud: stat.fraud,
    normal: Math.max(0, stat.total - stat.fraud),
  }));

  const patternData = (patterns as any[]).slice(0, 5).map((p: any, idx: number) => ({
    name: p.category.replace("_", " "),
    count: p.severity === "critical" ? 450 : p.severity === "high" ? 320 : 150,
    fill: CHART_COLORS[idx % CHART_COLORS.length],
  }));

  return (
    <Layout>
      <div className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-4xl font-display font-bold tracking-tight text-slate-950">Threat Analysis</h2>
          <p className="max-w-2xl text-base text-slate-600">
            AI-driven insights into emerging fraud vectors, attack clustering, and mule account behavior.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="glass-panel col-span-2 rounded-[28px] border-slate-200/80 bg-white/84">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-semibold text-slate-950">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-700">
                  <BrainCircuit className="h-5 w-5" />
                </span>
                Anomaly Detection Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[360px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorFraudAnalysis" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.26} />
                        <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="colorNormalAnalysis" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.24} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.03} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="rgba(148,163,184,0.28)" vertical={false} />
                    <XAxis dataKey="time" stroke="#64748b" tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="fraud" stroke="hsl(var(--destructive))" fillOpacity={1} fill="url(#colorFraudAnalysis)" name="Fraud Attempts" strokeWidth={2.4} />
                    <Area type="monotone" dataKey="normal" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorNormalAnalysis)" name="Normal Traffic" strokeWidth={2.4} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel rounded-[28px] border-slate-200/80 bg-white/84">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-semibold text-slate-950">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700">
                  <Network className="h-5 w-5" />
                </span>
                Attack Vector Share
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={patternData}
                      cx="50%"
                      cy="50%"
                      innerRadius={62}
                      outerRadius={86}
                      paddingAngle={4}
                      dataKey="count"
                    >
                      {patternData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} stroke="rgba(255,255,255,0.65)" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: "#0f172a" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-mono font-bold text-slate-950">
                      {patternData.reduce((acc: number, val: any) => acc + val.count, 0)}
                    </div>
                    <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">Total Alerts</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {patternData.slice(0, 3).map((item: any) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                      <span className="capitalize text-slate-700">{item.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-panel relative overflow-hidden rounded-[28px] border-slate-200/80 bg-white/84">
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-3 text-xl font-semibold text-slate-950">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700">
                <Share2 className="h-5 w-5" />
              </span>
              Mule Account Network Mapping
            </CardTitle>
            <p className="text-xs font-mono uppercase tracking-[0.18em] text-slate-500">
              Real-time force-directed graph | Red nodes = suspected mule aggregators
            </p>
          </CardHeader>
          <CardContent className="relative z-10 p-2">
            <TypologyForceGraph height={420} />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
