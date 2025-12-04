import Layout from "@/components/layout";
import { StatCard } from "@/components/stat-card";
import { FRAUD_STATS, MOCK_TRANSACTIONS, PATTERN_DATA } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from "framer-motion";
import { Shield, AlertOctagon } from "lucide-react";

export default function Dashboard() {
  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-display font-bold text-white">Command Center</h2>
            <p className="text-muted-foreground">Real-time overview of UPI transaction ecosystem.</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {FRAUD_STATS.map((stat, i) => (
            <StatCard
              key={stat.label}
              title={stat.label}
              value={stat.value}
              change={stat.change}
              icon={stat.icon}
              color={stat.color}
              index={i}
            />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          
          {/* Live Feed */}
          <Card className="col-span-4 glass-panel border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Live Transaction Monitor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MOCK_TRANSACTIONS.map((tx, i) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-12 rounded-full ${
                        tx.riskScore > 80 ? 'bg-destructive shadow-[0_0_10px_hsl(var(--destructive))]' : 
                        tx.riskScore > 50 ? 'bg-yellow-500' : 'bg-emerald-500'
                      }`} />
                      <div>
                        <div className="font-mono text-sm text-muted-foreground">{tx.id}</div>
                        <div className="font-medium text-white">{tx.sender} → {tx.receiver}</div>
                        <div className="text-xs text-muted-foreground">{tx.timestamp}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-lg">₹{tx.amount.toLocaleString()}</div>
                      {tx.status === 'blocked' ? (
                         <Badge variant="destructive" className="uppercase tracking-wider text-[10px]">Blocked</Badge>
                      ) : tx.status === 'flagged' ? (
                        <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-500 uppercase tracking-wider text-[10px]">Flagged</Badge>
                      ) : (
                        <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 uppercase tracking-wider text-[10px]">Verified</Badge>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chart */}
          <Card className="col-span-3 glass-panel border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-accent" />
                Fraud Pattern Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={PATTERN_DATA} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={100} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                    <Tooltip 
                      cursor={{fill: 'transparent'}}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={32}>
                      {PATTERN_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
