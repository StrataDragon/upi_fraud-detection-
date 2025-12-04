import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PATTERN_DATA } from "@/lib/mock-data";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { BrainCircuit, Network, Share2 } from "lucide-react";

const TREND_DATA = [
  { time: '00:00', fraud: 12, normal: 1200 },
  { time: '04:00', fraud: 8, normal: 800 },
  { time: '08:00', fraud: 45, normal: 2500 },
  { time: '12:00', fraud: 89, normal: 4500 },
  { time: '16:00', fraud: 67, normal: 3800 },
  { time: '20:00', fraud: 112, normal: 5600 },
  { time: '23:59', fraud: 34, normal: 2100 },
];

export default function Analysis() {
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-display font-bold text-white">Threat Analysis</h2>
          <p className="text-muted-foreground">AI-driven insights into emerging fraud vectors.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Trend Chart */}
          <Card className="col-span-2 glass-panel border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-primary" />
                Anomaly Detection Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={TREND_DATA}>
                    <defs>
                      <linearGradient id="colorFraud" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorNormal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                    <Area type="monotone" dataKey="fraud" stroke="hsl(var(--destructive))" fillOpacity={1} fill="url(#colorFraud)" name="Fraud Attempts" />
                    <Area type="monotone" dataKey="normal" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorNormal)" name="Normal Traffic" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Donut Chart */}
          <Card className="glass-panel border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="w-5 h-5 text-accent" />
                Attack Vector Share
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={PATTERN_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {PATTERN_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <div className="text-2xl font-bold font-mono text-white">1,450</div>
                    <div className="text-xs text-muted-foreground">Total Alerts</div>
                  </div>
                </div>
              </div>
              <div className="space-y-2 mt-4">
                {PATTERN_DATA.slice(0, 3).map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-mono font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Graph Vis Mockup */}
        <Card className="glass-panel border-primary/10 relative overflow-hidden min-h-[300px]">
          <div className="absolute inset-0 grid-bg opacity-30" />
          <CardHeader className="relative z-10">
             <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-emerald-400" />
                Mule Account Network
              </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 flex items-center justify-center h-[250px]">
            <div className="text-center space-y-4">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 rounded-full border-2 border-destructive animate-ping opacity-20" />
                <div className="absolute inset-0 rounded-full border border-destructive flex items-center justify-center bg-destructive/10">
                   <span className="font-mono text-xs text-destructive">SUSPECT</span>
                </div>
              </div>
              <p className="text-muted-foreground max-w-md mx-auto">
                Visualizing money trail from Victim A to Mule Network Node 4. Three hops detected in rapid succession ( &lt; 2 mins ).
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
