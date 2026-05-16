import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Filter, Search, AlertTriangle, CheckCircle, XCircle, Brain } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";

export default function Monitor() {
  const [searchTerm, setSearchTerm] = useState("");
  const { setSelectedTx } = useAppStore();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["/api/transactions/recent?limit=50"],
    refetchInterval: 5000,
  });

  const filteredTransactions = (transactions as any[]).filter((tx: any) => 
    tx.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.senderUpi?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-display font-bold text-black">Live Monitor</h2>
            <p className="text-black/80">Real-time stream of high-velocity transactions.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-black/70" />
              <Input 
                placeholder="Search Transaction ID..." 
                className="pl-8 bg-black/20 border-primary/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
                    <th className="h-12 px-4 text-left align-middle font-medium text-black/70">Transaction ID</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-black/70">Sender</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-black/70">Receiver</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-black/70">Amount</th>
                    <th className="h-12 px-4 text-center align-middle font-medium text-black/70">Risk Score</th>
                    <th className="h-12 px-4 text-center align-middle font-medium text-black/70">Status</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-black/70">
                      <span className="flex items-center justify-end gap-1">
                        <Brain className="w-3.5 h-3.5 text-purple-400" /> AI
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="text-center p-8 text-white/70">Loading real-time transactions...</td>
                    </tr>
                  ) : filteredTransactions.length === 0 ? (
                     <tr>
                      <td colSpan={7} className="text-center p-8 text-white/70">No recent transactions found.</td>
                    </tr>
                  ) : filteredTransactions.map((tx: any) => (
                    <tr key={tx.id} className="border-b border-border/50 transition-colors hover:bg-white/5">
                      <td className="p-4 font-mono text-xs">{tx.transactionId}</td>
                      <td className="p-4">
                        <div className="font-medium">{tx.senderUpi}</div>
                      </td>
                      <td className="p-4">{tx.receiverUpi}</td>
                      <td className="p-4 text-right font-mono font-bold">₹{parseFloat(tx.amount || 0).toFixed(2)}</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className={`w-16 h-2 rounded-full bg-secondary overflow-hidden`}>
                            <div 
                              className={`h-full ${
                                parseFloat(tx.riskScore) > 80 ? 'bg-destructive' : 
                                parseFloat(tx.riskScore) > 50 ? 'bg-yellow-500' : 'bg-emerald-500'
                              }`} 
                              style={{ width: `${Math.min(100, Math.max(0, parseFloat(tx.riskScore)))}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs">{parseFloat(tx.riskScore || 0).toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        {tx.isFraudulent ? (
                           <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Flagged</Badge>
                        ) : parseFloat(tx.riskScore) > 50 ? (
                          <Badge className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30"><AlertTriangle className="w-3 h-3 mr-1" /> Warning</Badge>
                        ) : (
                          <Badge variant="outline" className="text-emerald-500 border-emerald-500/30"><CheckCircle className="w-3 h-3 mr-1" /> Verified</Badge>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                          title="Explain AI Decision"
                          onClick={() => setSelectedTx({
                            id: tx.id,
                            transactionId: tx.transactionId,
                            senderUpi: tx.senderUpi,
                            receiverUpi: tx.receiverUpi,
                            amount: parseFloat(tx.amount || 0),
                            riskScore: parseFloat(tx.riskScore || 0),
                            mlProbability: parseFloat(tx.mlProbability || tx.riskScore || 0),
                            isFraudulent: tx.isFraudulent,
                            severity: tx.severity || "low",
                            recommendedAction: tx.recommendedAction || "approve",
                            reasons: tx.flaggedReason
                              ? tx.flaggedReason.split(";").map((s: string) => s.trim()).filter(Boolean)
                              : [],
                            timestamp: tx.timestamp,
                          })}
                        >
                          <Brain className="w-4 h-4" />
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
