import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { User, TrendingUp, AlertTriangle, CheckCircle, Search } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface UserProfile {
  upi: string;
  profile: any;
  stats: {
    totalTransactions: number;
    fraudulentTransactions: number;
    fraudRate: string;
    avgRiskScore: string;
    maxRiskScore: string;
    totalAmount: number;
    fraudAmount: number;
  };
  recentTransactions: any[];
}

export function UserRiskProfile() {
  const [upiInput, setUpiInput] = useState("");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!upiInput.trim()) {
      setError("Please enter a UPI address");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/analytics/user-risk-profile/${upiInput.trim()}`);
      if (!response.ok) throw new Error("User not found");
      const data = await response.json();
      setProfile(data);
    } catch (err: any) {
      setError(err.message);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return "text-red-400";
    if (score >= 60) return "text-orange-400";
    if (score >= 40) return "text-yellow-400";
    return "text-green-400";
  };

  const getRiskBadgeClass = (score: number) => {
    if (score >= 80) return "bg-red-500/20 border border-red-500/50 text-red-300";
    if (score >= 60) return "bg-orange-500/20 border border-orange-500/50 text-orange-300";
    if (score >= 40) return "bg-yellow-500/20 border border-yellow-500/50 text-yellow-300";
    return "bg-green-500/20 border border-green-500/50 text-black-300";
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card className="glass-panel border-black/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            Search User Risk Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter UPI address (e.g., user@upi)"
              value={upiInput}
              onChange={(e) => setUpiInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="bg-black/30 border-black/20"
            />
            <Button onClick={handleSearch} disabled={loading} className="bg-primary/20 hover:bg-primary/30">
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </CardContent>
      </Card>

      {/* Profile Results */}
      {profile && (
        <div className="space-y-6">
          {/* Header */}
          <Card className="glass-panel border-black/10 bg-gradient-to-r from-primary/10 to-purple-500/10">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">UPI Address</p>
                    <p className="text-xl font-bold text-black font-mono">{profile.upi}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Risk Level</p>
                  <p className={`text-2xl font-bold ${getRiskColor(parseFloat(profile.stats.avgRiskScore))}`}>
                    {profile.stats.avgRiskScore}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="glass-panel border-white/10">
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground uppercase">Total Transactions</p>
                <p className="text-3xl font-bold text-primary mt-2">{profile.stats.totalTransactions}</p>
              </CardContent>
            </Card>
            <Card className="glass-panel border-white/10">
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground uppercase">Fraudulent</p>
                <p className="text-3xl font-bold text-red-400 mt-2">{profile.stats.fraudulentTransactions}</p>
                <p className="text-xs text-muted-foreground mt-1">{profile.stats.fraudRate}% fraud rate</p>
              </CardContent>
            </Card>
            <Card className="glass-panel border-black/10">
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground uppercase">Total Amount</p>
                <p className="text-2xl font-bold text-black mt-2">₹{profile.stats.totalAmount.toLocaleString()}</p>
                <p className="text-xs text-red-400 mt-1">Fraud: ₹{profile.stats.fraudAmount.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="glass-panel border-black/10">
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground uppercase">Max Risk Score</p>
                <p className={`text-3xl text-black font-bold mt-2 ${getRiskColor(parseFloat(profile.stats.maxRiskScore))}`}>
                  {profile.stats.maxRiskScore}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card className="glass-panel border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                Recent Transactions (Last 10)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {profile.recentTransactions.map((tx, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg border transition-colors ${
                      tx.isFraudulent
                        ? "border-red-500/30 bg-red-500/5"
                        : "border-white/5 bg-white/2"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-mono text-xs text-muted-foreground">
                            {new Date(tx.timestamp).toLocaleString()}
                          </p>
                          {tx.isFraudulent && (
                            <Badge className="bg-red-500/30 text-red-300 text-xs">FRAUD</Badge>
                          )}
                        </div>
                        <p className="text-sm text-black">
                          → {tx.receiverUpi}
                        </p>
                        <p className="text-lg font-bold text-black mt-1">
                          ₹{parseFloat(tx.amount).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`px-2 py-1 rounded-md font-mono font-bold text-sm ${getRiskBadgeClass(parseFloat(tx.riskScore))}`}>
                          {parseFloat(tx.riskScore).toFixed(1)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
