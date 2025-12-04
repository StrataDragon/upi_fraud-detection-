import React, { useState, useEffect } from "react";
import { AlertCircle, TrendingDown, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { CSVUpload } from "./csv-upload";

interface Transaction {
  id: string;
  transactionId: string;
  senderUpi: string;
  receiverUpi: string;
  amount: string;
  timestamp: string;
  riskScore: string;
  isFraudulent: boolean;
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
}

export function FraudMonitoringDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [stats, setStats] = useState<FraudStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUpi, setSelectedUpi] = useState<string>("");
  const [showRiskDetails, setShowRiskDetails] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [selectedUpi]);

  const fetchData = async () => {
    try {
      setLoading(true);

      if (selectedUpi) {
        const [txRes, alertsRes] = await Promise.all([
          fetch(`/api/users/${selectedUpi}/transactions`),
          fetch(`/api/alerts/${selectedUpi}`),
        ]);

        const txData = await txRes.json();
        const alertsData = await alertsRes.json();

        setTransactions(txData);
        setAlerts(alertsData);
      }

      // Fetch stats
      const statsRes = await fetch("/api/stats/fraud");
      const statsData = await statsRes.json();
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return "text-red-600";
    if (score >= 60) return "text-orange-600";
    if (score >= 40) return "text-yellow-600";
    return "text-green-600";
  };

  const getRiskBgColor = (score: number) => {
    if (score >= 80) return "bg-red-100";
    if (score >= 60) return "bg-orange-100";
    if (score >= 40) return "bg-yellow-100";
    return "bg-green-100";
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500";
      case "warning":
        return "bg-orange-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <div className="w-full space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">UPI Fraud Detection Center</h1>
        <p className="text-gray-600 mt-2">Real-time monitoring and threat intelligence for UPI transactions</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Transactions (30d)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalTransactions}</div>
              <p className="text-xs text-gray-500 mt-1">₹{stats.totalAmount}</p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">Fraudulent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.fraudulentTransactions}</div>
              <p className="text-xs text-red-500 mt-1">{stats.fraudRate}% fraud rate • ₹{stats.fraudAmount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Risk Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.avgRiskScore}</div>
              <p className="text-xs text-gray-500 mt-1">Out of 100</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Active Alerts ({alerts.length})</h2>
          {alerts
            .filter((a) => a.status === "new")
            .slice(0, 3)
            .map((alert) => (
              <Alert key={alert.id} className="border-l-4" style={{ borderLeftColor: getSeverityColor(alert.severity).split("-")[1] }}>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{alert.title}</AlertTitle>
                <AlertDescription className="mt-2">
                  {alert.message}
                  <div className="mt-2 flex gap-2">
                    <Badge variant="outline" className={getSeverityColor(alert.severity) + " text-white"}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">{alert.alertType.replace("_", " ")}</Badge>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
        </div>
      )}

      {/* Main Tabs */}
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          <TabsTrigger value="csv-upload">CSV Upload</TabsTrigger>
          <TabsTrigger value="alerts">All Alerts</TabsTrigger>
          <TabsTrigger value="patterns">Fraud Patterns</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions with Risk Analysis</CardTitle>
              <CardDescription>Transactions flagged by our fraud detection system</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Enter a UPI address to view transactions</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {transactions.map((tx) => {
                    const riskScore = parseFloat(tx.riskScore || "0");
                    return (
                      <div
                        key={tx.id}
                        className={`p-3 rounded-lg border ${
                          tx.isFraudulent ? "border-red-200 bg-red-50" : "border-gray-200 bg-white"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-mono text-sm text-gray-600">TXN: {tx.transactionId.slice(0, 8)}</p>
                            <p className="text-sm text-gray-700">
                              To: <span className="font-mono">{tx.receiverUpi}</span>
                            </p>
                            <p className="text-lg font-bold text-gray-900 mt-1">₹{tx.amount}</p>
                            {tx.flaggedReason && (
                              <p className="text-xs text-gray-600 mt-1">
                                <TrendingDown className="inline h-3 w-3 mr-1" />
                                {tx.flaggedReason.split(";")[0]}
                              </p>
                            )}
                          </div>

                          <div className="text-right">
                            <div
                              className={`inline-block px-3 py-1 rounded-full font-bold text-sm ${getRiskBgColor(riskScore)} ${getRiskColor(riskScore)}`}
                            >
                              {riskScore.toFixed(1)}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setShowRiskDetails({
                                  ...showRiskDetails,
                                  [tx.id]: !showRiskDetails[tx.id],
                                })
                              }
                            >
                              {showRiskDetails[tx.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>

                        {/* Risk Details */}
                        {showRiskDetails[tx.id] && tx.flaggedReason && (
                          <div className="mt-3 pt-3 border-t border-gray-200 text-xs space-y-1">
                            {tx.flaggedReason.split(";").map((reason, idx) => (
                              <p key={idx} className="text-gray-600">
                                • {reason.trim()}
                              </p>
                            ))}
                          </div>
                        )}

                        {tx.isFraudulent && (
                          <Badge className="mt-2 bg-red-600">⚠️ FRAUDULENT</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CSV Upload Tab */}
        <TabsContent value="csv-upload" className="space-y-4">
          <CSVUpload />
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fraud Alerts Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex gap-3 p-2 border-l-2 border-gray-200">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{alert.title}</p>
                      <p className="text-xs text-gray-500">{new Date(alert.createdAt).toLocaleString()}</p>
                    </div>
                    <Badge variant="outline">{alert.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patterns Tab */}
        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Known Fraud Patterns</CardTitle>
              <CardDescription>Common UPI scam tactics detected in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">Refund Scam</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Victim receives a fake refund request and is directed to enter UPI PIN on fraudulent page
                      </p>
                    </div>
                    <Badge className="bg-red-500">CRITICAL</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Category: Phishing</p>
                </div>

                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">QR Code Swap</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Merchant QR code is replaced with fraudster's code at physical location
                      </p>
                    </div>
                    <Badge className="bg-orange-500">HIGH</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Category: Social Engineering</p>
                </div>

                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">Verification Transaction</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Small amount sent to verify account, followed by large fraudulent transaction
                      </p>
                    </div>
                    <Badge className="bg-yellow-500">MEDIUM</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Category: Verification Scam</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Risk Score Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={transactions.slice(0, 10).map(t => ({ txn: t.transactionId.slice(0, 6), score: parseFloat(t.riskScore) }))} >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="txn" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="score" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Transaction Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Legitimate", value: Math.max(0, transactions.filter(t => !t.isFraudulent).length) },
                        { name: "Fraudulent", value: transactions.filter(t => t.isFraudulent).length },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                    >
                      <Cell fill="#22c55e" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
