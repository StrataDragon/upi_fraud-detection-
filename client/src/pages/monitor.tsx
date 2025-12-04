import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_TRANSACTIONS } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Filter, Search, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Monitor() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-display font-bold text-white">Live Monitor</h2>
            <p className="text-muted-foreground">Real-time stream of high-velocity transactions.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search Transaction ID..." className="pl-8 bg-black/20 border-primary/20" />
            </div>
            <Button variant="outline" className="border-primary/20 hover:bg-primary/10">
              <Filter className="w-4 h-4 mr-2" /> Filter
            </Button>
          </div>
        </div>

        <Card className="glass-panel border-primary/10">
          <CardContent className="p-0">
            <div className="w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b [&_tr]:border-border/50">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Transaction ID</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Sender</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Receiver</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Amount</th>
                    <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">Risk Score</th>
                    <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">Status</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {MOCK_TRANSACTIONS.map((tx) => (
                    <tr key={tx.id} className="border-b border-border/50 transition-colors hover:bg-white/5">
                      <td className="p-4 font-mono text-xs">{tx.id}</td>
                      <td className="p-4">
                        <div className="font-medium">{tx.sender}</div>
                        <div className="text-xs text-muted-foreground">{tx.type}</div>
                      </td>
                      <td className="p-4">{tx.receiver}</td>
                      <td className="p-4 text-right font-mono font-bold">₹{tx.amount.toFixed(2)}</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className={`w-16 h-2 rounded-full bg-secondary overflow-hidden`}>
                            <div 
                              className={`h-full ${
                                tx.riskScore > 80 ? 'bg-destructive' : 
                                tx.riskScore > 50 ? 'bg-yellow-500' : 'bg-emerald-500'
                              }`} 
                              style={{ width: `${tx.riskScore}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs">{tx.riskScore}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        {tx.status === 'blocked' ? (
                          <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Blocked</Badge>
                        ) : tx.status === 'flagged' ? (
                          <Badge className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30"><AlertTriangle className="w-3 h-3 mr-1" /> Flagged</Badge>
                        ) : (
                          <Badge variant="outline" className="text-emerald-500 border-emerald-500/30"><CheckCircle className="w-3 h-3 mr-1" /> Safe</Badge>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <span className="text-lg">...</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
