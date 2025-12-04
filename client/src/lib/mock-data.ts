import { Shield, AlertTriangle, Users, Smartphone, RefreshCcw } from "lucide-react";

export const MOCK_TRANSACTIONS = [
  {
    id: "UPI-29384723",
    sender: "Rajesh Kumar",
    receiver: "Fresh Mart",
    amount: 450.00,
    timestamp: "Just now",
    status: "success",
    riskScore: 12,
    type: "merchant",
    flag: null
  },
  {
    id: "UPI-99283744",
    sender: "Anita Singh",
    receiver: "Unknown User",
    amount: 1.00,
    timestamp: "2 mins ago",
    status: "pending",
    riskScore: 89,
    type: "p2p",
    flag: "Micro-transaction Pattern"
  },
  {
    id: "UPI-82736451",
    sender: "Amit Patel",
    receiver: "Electricity Bill",
    amount: 2450.00,
    timestamp: "5 mins ago",
    status: "success",
    riskScore: 5,
    type: "bill",
    flag: null
  },
  {
    id: "UPI-19283746",
    sender: "Elderly User (High Risk)",
    receiver: "Supprt Agnt 007",
    amount: 15000.00,
    timestamp: "12 mins ago",
    status: "blocked",
    riskScore: 98,
    type: "p2p",
    flag: "Impersonation Scam"
  },
  {
    id: "UPI-38475629",
    sender: "Priya Sharma",
    receiver: "Refund Gateway",
    amount: 5000.00,
    timestamp: "15 mins ago",
    status: "flagged",
    riskScore: 75,
    type: "request",
    flag: "Refund Scam Pattern"
  }
];

export const FRAUD_STATS = [
  { label: "Total Transactions", value: "10.2B", change: "+12%", icon: RefreshCcw, color: "text-primary" },
  { label: "Fraud Attempts Blocked", value: "1,245", change: "+5%", icon: Shield, color: "text-emerald-400" },
  { label: "High Risk Alerts", value: "42", change: "-2%", icon: AlertTriangle, color: "text-destructive" },
  { label: "Vulnerable Users Protected", value: "8,900", change: "+18%", icon: Users, color: "text-yellow-400" }
];

export const PATTERN_DATA = [
  { name: 'Social Eng.', count: 450, fill: 'hsl(var(--chart-1))' },
  { name: 'QR Swap', count: 320, fill: 'hsl(var(--chart-2))' },
  { name: 'Fake Refund', count: 280, fill: 'hsl(var(--chart-3))' },
  { name: 'Sim Cloning', count: 190, fill: 'hsl(var(--chart-4))' },
  { name: 'Other', count: 120, fill: 'hsl(var(--chart-5))' },
];

export const EDUCATIONAL_CONTENT = [
  {
    title: "The 'Refund' Trap",
    description: "Scammers claim they are refunding money but actually send a 'Request Money' link. Entering your PIN authorizes a debit, not a credit.",
    riskLevel: "High",
    icon: Smartphone
  },
  {
    title: "QR Code Swapping",
    description: "Fraudsters paste their own QR codes over legitimate merchant codes. Always verify the merchant name before paying.",
    riskLevel: "Medium",
    icon: RefreshCcw
  },
  {
    title: "The 'Relative in Distress'",
    description: "AI voice cloning is used to impersonate family members asking for urgent money. Verify by calling the person directly.",
    riskLevel: "Critical",
    icon: Users
  }
];
