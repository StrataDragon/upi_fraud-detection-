import { useMemo } from "react";
import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  Phone,
  FileWarning,
  Banknote,
  Lock,
  EyeOff,
  BellRing,
  AlertTriangle,
  LifeBuoy,
  ChevronRight,
  ExternalLink
} from "lucide-react";

const EMERGENCY_CONTACTS = [
  {
    title: "National Cyber Crime Portal",
    number: "1930",
    action: "Call Now",
    icon: Phone,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
  },
  {
    title: "Bank/Wallet Support",
    number: "In-App Help",
    action: "Open App",
    icon: LifeBuoy,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    title: "Freeze Account",
    number: "Contact Branch",
    action: "Find Branch",
    icon: Lock,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
];

const PREVENTION_STEPS = [
  {
    id: 1,
    title: "Do not share OTP or UPI PIN",
    description: "Your PIN is only used to deduct money from your account, never to receive money.",
    icon: EyeOff,
  },
  {
    id: 2,
    title: "Verify the Receiver's Name",
    description: "Always check the name displayed on the screen before confirming the payment.",
    icon: ShieldAlert,
  },
  {
    id: 3,
    title: "Avoid Screen-Sharing Apps",
    description: "Scammers may ask you to download apps like AnyDesk or TeamViewer to access your screen.",
    icon: FileWarning,
  },
  {
    id: 4,
    title: "Ignore Fake Customer Care",
    description: "Always use official bank apps or websites to find customer care numbers.",
    icon: BellRing,
  },
];

export default function Prevention() {
  return (
    <Layout>
      <div className="space-y-8 max-w-6xl mx-auto pb-12">
        {/* Header Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-[32px] glass-panel p-8 md:p-12 border-rose-500/20 bg-gradient-to-br from-rose-500/5 via-background to-rose-500/5"
        >
          <div className="max-w-3xl space-y-4">
            <Badge variant="outline" className="bg-rose-500/10 text-rose-500 border-rose-500/20 px-3 py-1 text-xs font-mono uppercase tracking-widest">
              Emergency Action Guide
            </Badge>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
              Stop the Fraud.<br/> Protect Your Account.
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
              Immediate steps to take if you suspect a fraudulent transaction. Act fast to secure your funds and report the incident.
            </p>
          </div>
        </motion.section>

        {/* Emergency Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {EMERGENCY_CONTACTS.map((contact, idx) => (
            <motion.div 
              key={contact.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
            >
              <Card className={`h-full glass-panel border ${contact.border} hover:bg-white/5 transition-all duration-300`}>
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <div className={`p-4 rounded-full ${contact.bg} ${contact.color}`}>
                    <contact.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">{contact.title}</h3>
                    <p className="text-3xl font-display font-bold mt-2 tracking-wider">{contact.number}</p>
                  </div>
                  <Button className={`w-full mt-auto bg-white/10 hover:bg-white/20 text-foreground border border-white/10`}>
                    {contact.action} <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Immediate Steps to Take */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-display font-bold flex items-center gap-2">
            <AlertTriangle className="text-amber-500 w-6 h-6" /> 
            Immediate Action Checklist
          </h2>
          
          <Alert className="bg-amber-500/10 border-amber-500/30 text-amber-500/90">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Critical Warning</AlertTitle>
            <AlertDescription>
              If money has already been deducted, call 1930 immediately or visit cybercrime.gov.in. Time is of the essence in recovering funds.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            {PREVENTION_STEPS.map((step, idx) => (
              <motion.div 
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex gap-4 p-5 rounded-2xl glass-panel border border-white/10 items-start group hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-display font-bold text-xl group-hover:scale-110 transition-transform">
                  0{step.id}
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Educational Video Embeds */}
        <section className="space-y-6">
          <h2 className="text-2xl font-display font-bold">Expert Prevention Guides</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="glass-panel overflow-hidden border-white/10">
              <div className="aspect-video w-full bg-black/50 relative">
                <iframe 
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/0AGUZ1b7AFM" 
                  title="RBI Kehta Hai - Safe Digital Banking"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>
              <CardContent className="p-5">
                <Badge className="bg-primary/20 text-primary mb-2">RBI Guidelines</Badge>
                <h3 className="text-lg font-semibold mb-2">Safe Digital Banking Practices</h3>
                <p className="text-sm text-muted-foreground">Learn the official guidelines from the Reserve Bank of India on how to secure your digital transactions.</p>
              </CardContent>
            </Card>

            <Card className="glass-panel overflow-hidden border-white/10">
              <div className="aspect-video w-full bg-black/50 relative">
                <iframe 
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/LWryxsnH8Cs" 
                  title="NPCI UPI Safety Shield"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>
              <CardContent className="p-5">
                <Badge className="bg-emerald-500/20 text-emerald-400 mb-2">NPCI Official</Badge>
                <h3 className="text-lg font-semibold mb-2">UPI Safety Shield Guide</h3>
                <p className="text-sm text-muted-foreground">Detailed walkthrough on common UPI fraud methods and how to stay protected.</p>
              </CardContent>
            </Card>
          </div>
        </section>

      </div>
    </Layout>
  );
}
