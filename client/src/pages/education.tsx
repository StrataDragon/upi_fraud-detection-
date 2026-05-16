import { useMemo, useState } from "react";
import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, ShieldCheck, BookOpen, Smartphone, RefreshCcw, Users, Siren, BadgeCheck, ScanSearch, PhoneCall, ArrowRight, CheckCircle2 } from "lucide-react";

const EDUCATIONAL_CONTENT = [
  {
    title: "The 'Refund' Trap",
    description: "Scammers claim they are refunding money but actually send a 'Request Money' link. Entering your PIN authorizes a debit, not a credit.",
    riskLevel: "High",
    tell: "Any refund that asks for your UPI PIN is a payment, not a credit.",
    safeResponse: "Reject the request, close the app, and contact the merchant or platform through its official number.",
    icon: Smartphone,
  },
  {
    title: "QR Code Swapping",
    description: "Fraudsters paste their own QR codes over legitimate merchant codes. Always verify the merchant name before paying.",
    riskLevel: "Medium",
    tell: "Check the merchant name on-screen before approving the transfer.",
    safeResponse: "Ask the merchant to confirm the receiver name out loud and compare it before approving payment.",
    icon: RefreshCcw,
  },
  {
    title: "The 'Relative in Distress'",
    description: "AI voice cloning is used to impersonate family members asking for urgent money. Verify by calling the person directly.",
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

export default function Education() {
  const [selectedPattern, setSelectedPattern] = useState(EDUCATIONAL_CONTENT[0]);
  const [trainingStep, setTrainingStep] = useState(0);
  const [simulationStarted, setSimulationStarted] = useState(false);

  const completion = useMemo(() => Math.round(((trainingStep + 1) / walkthroughSteps.length) * 100), [trainingStep]);

  return (
    <Layout>
      <div className="space-y-6 md:space-y-8">
        <section className="glass-panel relative overflow-hidden rounded-[32px] px-6 py-7 md:px-8 md:py-8">
          <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.12),transparent_35%)] md:block" />
          <div className="relative grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
            <div className="max-w-3xl space-y-5">
              <div className="eyebrow">Prevention and Education</div>
              <div className="space-y-3">
                <h1 className="max-w-2xl text-4xl font-display font-extrabold leading-tight text-slate-950 md:text-5xl">
                  Build scam resistance before the money leaves the account.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                  This route now behaves like a real field guide: working drills, guided walkthroughs, and response practice that first-time digital users can actually use.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {quickStats.map((stat) => (
                  <div key={stat.label} className="panel-muted rounded-2xl p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{stat.label}</p>
                    <p className="mt-2 text-3xl font-display font-bold text-slate-950">{stat.value}</p>
                    <p className="mt-1 text-sm text-slate-600">{stat.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel-strong rounded-[28px] p-5 md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-sky-700">Trainer Console</p>
                  <h2 className="mt-2 text-2xl font-display font-bold text-slate-950">Rapid Safety Script</h2>
                </div>
                <BadgeCheck className="mt-1 h-6 w-6 text-emerald-600" />
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4">
                  <p className="text-sm font-semibold text-emerald-700">If you are being rushed, do not pay yet.</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Pause, confirm the person, and re-read the prompt on the payment app. Scammers hate quiet verification.
                  </p>
                </div>

                <div className="space-y-3">
                  {walkthroughSteps.map((step, index) => (
                    <div
                      key={step}
                      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
                        index <= trainingStep ? "border-sky-200 bg-sky-50/90" : "border-slate-200 bg-white/80"
                      }`}
                    >
                      <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-mono font-bold ${
                        index <= trainingStep ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-600"
                      }`}>
                        0{index + 1}
                      </div>
                      <p className={`text-sm ${index <= trainingStep ? "text-slate-950" : "text-slate-600"}`}>{step}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-[0.18em] text-slate-500">Walkthrough progress</span>
                    <span className="text-sm font-semibold text-sky-700">{completion}%</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-slate-200">
                    <div className="h-2 rounded-full bg-sky-600 transition-all duration-300" style={{ width: `${completion}%` }} />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    className="flex-1 rounded-2xl bg-sky-600 text-white hover:bg-sky-700"
                    onClick={() => setTrainingStep((step) => Math.min(step + 1, walkthroughSteps.length - 1))}
                  >
                    Start guided safety walkthrough
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-2xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    onClick={() => setTrainingStep(0)}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="glass-panel rounded-[28px] border-slate-200/80 bg-white/84">
            <CardHeader className="pb-4">
              <div className="eyebrow w-fit">Fraud Playbook</div>
              <CardTitle className="mt-3 flex items-center gap-3 text-2xl text-slate-950">
                <BookOpen className="h-6 w-6 text-sky-700" />
                Common scam patterns in plain language
              </CardTitle>
              <p className="text-sm leading-6 text-slate-600">
                Each pattern includes the emotional trigger, the exact risky action, and the safest response.
              </p>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full space-y-3">
                {EDUCATIONAL_CONTENT.map((item, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/80 px-4"
                  >
                    <AccordionTrigger className="py-5 hover:no-underline">
                      <div className="flex items-start gap-4 text-left">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-700">
                          <item.icon className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="text-lg font-semibold text-slate-950">{item.title}</span>
                            <span
                              className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] ${
                                item.riskLevel === "Critical"
                                  ? "bg-rose-100 text-rose-700"
                                  : item.riskLevel === "High"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {item.riskLevel} risk
                            </span>
                          </div>
                          <p className="text-sm text-slate-600">{item.tell}</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-5 pl-16 pr-4 text-sm leading-7 text-slate-600">
                      <p>{item.description}</p>
                      <Button
                        size="sm"
                        className="mt-4 rounded-xl bg-sky-600 text-white hover:bg-sky-700"
                        onClick={() => setSelectedPattern(item)}
                      >
                        Practice response
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="glass-panel rounded-[28px] border-slate-200/80 bg-white/84">
              <CardHeader className="pb-4">
                <div className="eyebrow w-fit">Scenario Lab</div>
                <CardTitle className="mt-3 text-2xl text-slate-950">Interactive simulation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video overflow-hidden rounded-[24px] border border-slate-200 bg-[linear-gradient(135deg,rgba(186,230,253,0.95),rgba(248,250,252,0.98)_45%,rgba(220,252,231,0.92))]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.45),transparent_42%)]" />
                  <div className="relative flex h-full flex-col justify-between p-5">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-600">
                        Scenario 01
                      </span>
                      <PlayCircle className="h-11 w-11 text-sky-700" />
                    </div>
                    <div>
                      <p className="text-xl font-display font-bold text-slate-950">The Fake Delivery Agent</p>
                      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">
                        A caller asks you to scan a QR code for a missed parcel fee. The right move is to verify the merchant and refuse any urgent PIN entry.
                      </p>
                    </div>
                  </div>
                </div>
                <Button
                  className="mt-4 w-full rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700"
                  onClick={() => setSimulationStarted((open) => !open)}
                >
                  {simulationStarted ? "Hide training simulation" : "Launch training simulation"}
                </Button>

                {simulationStarted && (
                  <div className="mt-4 rounded-[24px] border border-slate-200 bg-slate-50/90 p-4">
                    <p className="text-xs font-mono uppercase tracking-[0.18em] text-slate-500">Simulation prompt</p>
                    <p className="mt-3 text-base font-semibold text-slate-950">
                      “Sir, your package is stuck. Scan this QR to release it right now.”
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge className="bg-rose-100 text-rose-700">Wrong: Scan immediately</Badge>
                      <Badge className="bg-emerald-100 text-emerald-700">Right: Verify merchant first</Badge>
                      <Badge className="bg-sky-100 text-sky-700">Right: Never enter PIN for fees from random callers</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass-panel rounded-[28px] border-emerald-200 bg-white/84">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl text-slate-950">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  Four-point safety checklist
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {checklist.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/90 p-4">
                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <p className="text-sm leading-6 text-slate-600">{item}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="glass-panel rounded-[28px] border-slate-200/80 bg-white/84">
            <CardHeader className="pb-2">
              <div className="eyebrow w-fit">Red Flag Drill</div>
              <CardTitle className="mt-3 text-2xl text-slate-950">What to notice in the first 10 seconds</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {drillCards.map((card) => (
                <div key={card.title} className="group rounded-[24px] border border-slate-200 bg-slate-50/90 p-5 transition-colors hover:bg-white">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700">
                      <card.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-950">{card.title}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{card.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass-panel rounded-[28px] border-slate-200/80 bg-white/84">
            <CardHeader className="pb-2">
              <div className="eyebrow w-fit">Response Practice</div>
              <CardTitle className="mt-3 text-2xl text-slate-950">{selectedPattern.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50/90 p-5">
                <div className="flex items-center gap-3">
                  <selectedPattern.icon className="h-5 w-5 text-sky-700" />
                  <span className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Best response</span>
                </div>
                <p className="mt-3 text-base leading-7 text-slate-700">{selectedPattern.safeResponse}</p>
              </div>

              <div className="space-y-3">
                {[
                  "Stop the conversation and read the app prompt slowly.",
                  "Verify the human or merchant through an independent channel.",
                  "Report the attempt if the request was fake or manipulative.",
                ].map((item, index) => (
                  <div key={item} className="flex gap-4 rounded-[24px] border border-slate-200 bg-white/90 p-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-600 font-mono text-sm font-bold text-white">
                      0{index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-slate-950">{item}</h3>
                        <ArrowRight className="h-4 w-4 text-sky-500" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-[24px] border border-emerald-200 bg-emerald-50/90 p-5">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">Outcome</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  This practice module now updates when you click any “Practice response” button in the fraud playbook, so each scenario has a working response flow.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </Layout>
  );
}
