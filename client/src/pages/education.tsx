import { useMemo, useState } from "react";
import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PlayCircle,
  ShieldCheck,
  BookOpen,
  Smartphone,
  RefreshCcw,
  Users,
  Siren,
  BadgeCheck,
  ScanSearch,
  PhoneCall,
  ArrowRight,
  CheckCircle2,
  Video
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const EDUCATIONAL_CONTENT = [
  {
    title: "The 'Refund' Trap",
    description:
      "Scammers claim they are refunding money but actually send a 'Request Money' link. Entering your PIN authorizes a debit, not a credit.",
    riskLevel: "High",
    tell: "Any refund that asks for your UPI PIN is a payment, not a credit.",
    safeResponse: "Reject the request, close the app, and contact the merchant or platform through its official number.",
    icon: Smartphone,
  },
  {
    title: "QR Code Swapping",
    description:
      "Fraudsters paste their own QR codes over legitimate merchant codes. Always verify the merchant name before paying.",
    riskLevel: "Medium",
    tell: "Check the merchant name on-screen before approving the transfer.",
    safeResponse: "Ask the merchant to confirm the receiver name out loud and compare it before approving payment.",
    icon: RefreshCcw,
  },
  {
    title: "The 'Relative in Distress'",
    description:
      "AI voice cloning is used to impersonate family members asking for urgent money. Verify by calling the person directly.",
    riskLevel: "Critical",
    tell: "Panic, urgency, and a new account are the classic giveaway trio.",
    safeResponse: "Pause immediately, call back on a saved number, and confirm through a second family member if needed.",
    icon: Users,
  },
];

const quickStats = [
  { label: "Core modules", value: "03", note: "High-frequency scam drills" },
  { label: "Response time", value: "< 60s", note: "Target to pause and verify" },
  { label: "Golden rule", value: "PIN = Send", note: "Never needed to receive funds" },
];

const checklist = [
  "Never enter your UPI PIN to receive money. A PIN confirms money going out.",
  "Read the beneficiary name, app prompt, and amount aloud before tapping confirm.",
  "Call back on a saved number if anyone pressures you with urgency or emotion.",
  "Reject QR codes sent in chat unless you independently know the merchant or person.",
];

const drillCards = [
  {
    title: "Pause Before Payment",
    description: "Slow the interaction down. Scammers rely on panic, embarrassment, and speed.",
    icon: Siren,
  },
  {
    title: "Scan The Prompt",
    description: "If the app says request, collect, approve, or enter PIN, you are authorizing a debit.",
    icon: ScanSearch,
  },
  {
    title: "Verify The Human",
    description: "Use a trusted callback, a second family contact, or a branch or merchant confirmation before paying.",
    icon: PhoneCall,
  },
];

const walkthroughSteps = [
  "Read the exact payment prompt before touching the PIN field.",
  "Verify the beneficiary name and amount with the real person or merchant.",
  "Use a saved callback number if the request sounds urgent or emotional.",
];

const EDUCATION_VIDEO = {
  title: "UPI Chalega: PIN Safety Rule",
  videoId: "QqTFVUIKoZI",
  campaign: "Official public interest clip to understand the golden rule of UPI.",
};

const simulationChoices = [
  {
    label: "Scan the QR and pay the fee immediately",
    isCorrect: false,
    feedback: "Unsafe. A random caller should never control your payment flow, and QR plus PIN entry can authorize a debit.",
  },
  {
    label: "Ask for the parcel company name and verify it in the official app or website",
    isCorrect: true,
    feedback: "Correct. Independent verification breaks the scammer's urgency and keeps the payment decision in your control.",
  },
  {
    label: "Share your screen so the caller can help finish the payment",
    isCorrect: false,
    feedback: "Unsafe. Screen-sharing helps a fraudster observe or direct sensitive payment steps.",
  },
];

export default function Education() {
  const [selectedPattern, setSelectedPattern] = useState(EDUCATIONAL_CONTENT[0]);
  const [trainingStep, setTrainingStep] = useState(-1);
  const [simulationStarted, setSimulationStarted] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);

  const completion = useMemo(
    () => (trainingStep < 0 ? 0 : Math.round(((trainingStep + 1) / walkthroughSteps.length) * 100)),
    [trainingStep],
  );
  const walkthroughComplete = trainingStep >= walkthroughSteps.length - 1;

  const handleWalkthroughAdvance = () => {
    setTrainingStep((step) => (step < walkthroughSteps.length - 1 ? step + 1 : step));
  };

  const handleSimulationToggle = () => {
    setSimulationStarted((open) => {
      const next = !open;
      if (!next) {
        setSelectedChoice(null);
      }
      return next;
    });
  };

  return (
    <Layout>
      <div className="max-w-[1400px] mx-auto pb-12 space-y-6">
        
        {/* TOP HEADER: Clean Title Section */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-display font-extrabold leading-tight text-foreground">
            Prevention & Education Hub
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Build scam resistance before the money leaves the account. Real drills and guided response practice.
          </p>
        </div>

        {/* MAIN MASTER GRID: 8 Columns Left (Primary), 4 Columns Right (Sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ======================= */}
          {/* LEFT COLUMN (MAIN CONTENT) */}
          {/* ======================= */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* HERO STATS */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="glass-panel relative overflow-hidden rounded-[32px] px-6 py-8 border-sky-500/20 bg-gradient-to-br from-sky-500/5 via-background to-emerald-500/5"
            >
              <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.12),transparent_35%)] md:block pointer-events-none" />
              <div className="relative z-10 grid gap-4 sm:grid-cols-3">
                {quickStats.map((stat, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 + 0.2 }}
                    key={stat.label} 
                    className="rounded-2xl p-5 border border-white/5 bg-background/50 backdrop-blur-md hover:bg-white/5 transition-colors"
                  >
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{stat.label}</p>
                    <p className="mt-2 text-3xl font-display font-bold text-foreground">{stat.value}</p>
                    <p className="mt-1 text-sm text-muted-foreground/80">{stat.note}</p>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* SCENARIO LAB (Video + Simulation Combined) */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="glass-panel rounded-[28px] border-white/10 bg-background/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="pb-4 border-b border-white/5 bg-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge variant="outline" className="w-fit bg-sky-500/10 text-sky-500 border-sky-500/20 px-3 py-1 text-xs font-mono uppercase tracking-widest mb-2">
                        Scenario Lab
                      </Badge>
                      <CardTitle className="text-2xl text-foreground flex items-center gap-2">
                        <Video className="w-6 h-6 text-sky-500" />
                        Interactive Training Simulation
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {/* The Video Embed */}
                  <div className="relative w-full aspect-video bg-black">
                    <iframe
                      className="absolute inset-0 h-full w-full object-cover"
                      src={`https://www.youtube.com/embed/${EDUCATION_VIDEO.videoId}?rel=0`}
                      title={EDUCATION_VIDEO.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                  
                  {/* Video Description */}
                  <div className="p-6 bg-background/80">
                    <div className="flex items-center justify-between mb-2">
                      <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-sky-500 font-mono">
                        Scenario 01
                      </span>
                    </div>
                    <p className="text-xl font-display font-bold text-foreground">{EDUCATION_VIDEO.title}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Watch this official public interest clip to understand the golden rule of UPI: You only need to enter your UPI PIN to <strong>send</strong> money, never to receive it. Always verify the receiver before you pay.
                    </p>
                  </div>

                  {/* The Simulation Expansion */}
                  <div className="p-6 border-t border-white/5 bg-sky-500/5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                        <PlayCircle className="h-5 w-5 text-sky-500" />
                        Live Drill Practice
                      </h3>
                    </div>
                    
                    <Button
                      className="w-full md:w-auto px-8 rounded-2xl bg-sky-600 text-white hover:bg-sky-700 shadow-lg shadow-sky-500/20 transition-all active:scale-95"
                      onClick={handleSimulationToggle}
                    >
                      {simulationStarted ? "Reset Simulation" : "Start Live Simulation"}
                    </Button>

                    <AnimatePresence>
                      {simulationStarted && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-6 rounded-[24px] border border-white/10 bg-background/80 p-6 shadow-inner">
                            <p className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">Simulation prompt</p>
                            <p className="mt-3 text-xl font-display font-semibold text-foreground">
                              "Sir, your package is stuck. Scan this QR to release it right now."
                            </p>
                            <div className="mt-6 grid gap-3 md:grid-cols-1">
                              {simulationChoices.map((choice, index) => {
                                const isSelected = selectedChoice === index;
                                return (
                                  <button
                                    key={choice.label}
                                    type="button"
                                    onClick={() => setSelectedChoice(index)}
                                    className={`rounded-2xl border px-5 py-4 text-left text-sm transition-all duration-300 ${
                                      isSelected
                                        ? choice.isCorrect
                                          ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400 scale-[1.01]"
                                          : "border-rose-500/50 bg-rose-500/10 text-rose-400 scale-[1.01]"
                                        : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:border-white/20"
                                    }`}
                                  >
                                    {choice.label}
                                  </button>
                                );
                              })}
                            </div>
                            
                            <AnimatePresence>
                              {selectedChoice !== null && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className={`mt-6 rounded-2xl border p-5 text-sm leading-6 ${
                                    simulationChoices[selectedChoice].isCorrect
                                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                      : "border-rose-500/30 bg-rose-500/10 text-rose-300"
                                  }`}
                                >
                                  {simulationChoices[selectedChoice].feedback}
                                </motion.div>
                              )}
                            </AnimatePresence>
                            
                            <div className="mt-6 flex flex-wrap gap-2">
                              <Badge variant="outline" className="border-rose-500/30 text-rose-400 bg-rose-500/10 px-3 py-1">Wrong: scan immediately</Badge>
                              <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 px-3 py-1">Right: verify independently first</Badge>
                              <Badge variant="outline" className="border-sky-500/30 text-sky-400 bg-sky-500/10 px-3 py-1">Right: never enter PIN for strangers</Badge>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            </motion.section>

            {/* RED FLAG DRILL */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="glass-panel rounded-[28px] border-white/10 bg-background/50 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <Badge variant="outline" className="w-fit mx-auto bg-amber-500/10 text-amber-500 border-amber-500/20 px-3 py-1 text-xs font-mono uppercase tracking-widest">
                    Red Flag Drill
                  </Badge>
                  <CardTitle className="mt-3 text-3xl font-display text-foreground text-center">What to notice in the first 10 seconds</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-3">
                  {drillCards.map((card) => (
                    <div key={card.title} className="group rounded-[24px] border border-white/10 bg-background/40 p-6 transition-all duration-300 hover:bg-white/5 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/5">
                      <div className="flex flex-col gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform duration-300">
                          <card.icon className="h-7 w-7" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground">{card.title}</h3>
                      </div>
                      <p className="mt-4 text-sm leading-6 text-muted-foreground">{card.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.section>

          </div>

          {/* ======================= */}
          {/* RIGHT COLUMN (SIDEBAR)  */}
          {/* ======================= */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* TRAINER CONSOLE */}
            <motion.section 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="rounded-[28px] border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm shadow-xl shadow-emerald-500/5">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-500">Trainer Console</p>
                      <h2 className="mt-2 text-2xl font-display font-bold text-foreground">Rapid Safety Script</h2>
                    </div>
                    <BadgeCheck className="mt-1 h-6 w-6 text-emerald-500" />
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                      <p className="text-sm font-semibold text-emerald-400">If you are being rushed, do not pay yet.</p>
                      <p className="mt-2 text-sm leading-6 text-emerald-500/80">
                        Pause, confirm the person, and re-read the prompt on the payment app. Scammers hate quiet verification.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {walkthroughSteps.map((step, index) => (
                        <div
                          key={step}
                          className={`flex items-start gap-3 rounded-2xl border px-4 py-3 transition-colors ${
                            index <= trainingStep ? "border-sky-500/30 bg-sky-500/10" : "border-white/5 bg-background/40"
                          }`}
                        >
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-mono font-bold mt-0.5 ${
                              index <= trainingStep ? "bg-sky-500 text-white" : "bg-white/10 text-muted-foreground"
                            }`}
                          >
                            0{index + 1}
                          </div>
                          <p className={`text-sm leading-6 ${index <= trainingStep ? "text-foreground" : "text-muted-foreground"}`}>{step}</p>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-2xl border border-white/5 bg-background/50 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">Walkthrough progress</span>
                        <span className="text-sm font-semibold text-sky-400">{completion}%</span>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full rounded-full bg-sky-500 transition-all duration-500 ease-out" style={{ width: `${completion}%` }} />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        className="flex-1 rounded-2xl bg-sky-600 text-white hover:bg-sky-700 shadow-lg shadow-sky-500/20 text-xs"
                        onClick={handleWalkthroughAdvance}
                        disabled={walkthroughComplete}
                      >
                        {trainingStep < 0
                          ? "Start Walkthrough"
                          : walkthroughComplete
                            ? "Complete"
                            : "Continue"}
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-2xl border-white/10 bg-transparent text-muted-foreground hover:bg-white/5 px-4"
                        onClick={() => setTrainingStep(-1)}
                      >
                        Reset
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.section>

            {/* SAFETY CHECKLIST */}
            <motion.section 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="glass-panel rounded-[28px] border-white/10 bg-background/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl text-foreground">
                    <ShieldCheck className="h-6 w-6 text-emerald-500" />
                    4-Point Safety Checklist
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {checklist.map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/5 bg-background/40 p-4 transition-colors hover:bg-white/5">
                      <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                      <p className="text-sm leading-6 text-muted-foreground">{item}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.section>

            {/* FRAUD PLAYBOOK (Accordion) */}
            <motion.section 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="glass-panel rounded-[28px] border-sky-500/20 bg-sky-500/5 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <Badge variant="outline" className="w-fit bg-sky-500/10 text-sky-500 border-sky-500/20 px-3 py-1 text-xs font-mono uppercase tracking-widest">
                    Fraud Playbook
                  </Badge>
                  <CardTitle className="mt-3 flex items-center gap-3 text-xl text-foreground">
                    <BookOpen className="h-5 w-5 text-sky-500" />
                    Common Scam Patterns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full space-y-3" defaultValue="item-0">
                    {EDUCATIONAL_CONTENT.map((item, index) => (
                      <AccordionItem
                        key={index}
                        value={`item-${index}`}
                        className="overflow-hidden rounded-2xl border border-white/10 bg-background/60 px-4 transition-colors hover:bg-white/5"
                      >
                        <AccordionTrigger className="py-4 hover:no-underline" onClick={() => setSelectedPattern(item)}>
                          <div className="flex items-center gap-4 text-left w-full pr-2">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-500/20 bg-sky-500/10 text-sky-400">
                              <item.icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <span className="text-base font-semibold text-foreground block">{item.title}</span>
                              <span className={`inline-block mt-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${
                                item.riskLevel === "Critical" ? "bg-rose-500/10 text-rose-400" : 
                                item.riskLevel === "High" ? "bg-amber-500/10 text-amber-400" : "bg-yellow-500/10 text-yellow-400"
                              }`}>
                                {item.riskLevel} Risk
                              </span>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4 pt-1 text-sm leading-6 text-muted-foreground border-t border-white/5 mt-2">
                          <p className="mt-2">{item.description}</p>
                          <p className="mt-2 font-medium text-foreground/80">Red Flag: {item.tell}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </motion.section>

            {/* RESPONSE PRACTICE (Sticky to follow scroll) */}
            <motion.section 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="sticky top-6 pb-6"
            >
              <Card className="glass-panel rounded-[28px] border-white/10 bg-background/50 backdrop-blur-sm shadow-2xl">
                <CardHeader className="pb-2">
                  <Badge variant="outline" className="w-fit bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1 text-xs font-mono uppercase tracking-widest">
                    Response Practice
                  </Badge>
                  <CardTitle className="mt-3 text-xl text-foreground">{selectedPattern.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="rounded-[20px] border border-sky-500/20 bg-sky-500/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <selectedPattern.icon className="h-4 w-4 text-sky-400" />
                      <span className="text-xs font-bold uppercase tracking-[0.16em] text-sky-500">Best Response</span>
                    </div>
                    <p className="text-sm leading-6 text-foreground/90">{selectedPattern.safeResponse}</p>
                  </div>

                  <div className="space-y-2">
                    {[
                      "Stop and read the app prompt slowly.",
                      "Verify the human through an independent channel.",
                      "Report the attempt if manipulative.",
                    ].map((item, index) => (
                      <div key={item} className="flex gap-3 rounded-[20px] border border-white/5 bg-background/40 p-4 items-center">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-500/20 border border-sky-500/30 font-mono text-xs font-bold text-sky-400">
                          {index + 1}
                        </div>
                        <h3 className="text-sm font-medium text-foreground/90">{item}</h3>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.section>

          </div>
        </div>
      </div>
    </Layout>
  );
}
