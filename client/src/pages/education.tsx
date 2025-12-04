import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EDUCATIONAL_CONTENT } from "@/lib/mock-data";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { PlayCircle, ShieldCheck, BookOpen } from "lucide-react";

export default function Education() {
  return (
    <Layout>
      <div className="space-y-8">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-display font-bold text-white">Prevention & Education</h2>
          <p className="text-muted-foreground mt-2">
            Empowering first-time digital users to recognize and report fraud patterns.
            This module is designed for rural outreach and digital literacy programs.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Interactive Learning */}
          <Card className="glass-panel border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Common Fraud Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {EDUCATIONAL_CONTENT.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border-white/10">
                    <AccordionTrigger className="hover:no-underline hover:bg-white/5 px-2 rounded">
                      <div className="flex items-center gap-3 text-left">
                        <div className="p-2 rounded-full bg-primary/10 text-primary">
                          <item.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium">{item.title}</div>
                          <div className={`text-xs ${
                            item.riskLevel === 'Critical' ? 'text-destructive' : 
                            item.riskLevel === 'High' ? 'text-orange-400' : 'text-yellow-400'
                          }`}>Risk Level: {item.riskLevel}</div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-2 pt-2 text-muted-foreground">
                      {item.description}
                      <div className="mt-4">
                         <Button size="sm" variant="outline" className="text-xs h-7 border-primary/30 text-primary hover:bg-primary/10">
                            Simulate Attack
                         </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Simulation / Video */}
          <div className="space-y-6">
            <Card className="glass-panel border-accent/20 bg-accent/5">
              <CardHeader>
                <CardTitle className="text-accent">Interactive Simulation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-black/40 rounded-lg border border-white/10 flex items-center justify-center group cursor-pointer relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <PlayCircle className="w-12 h-12 text-white/70 group-hover:text-white group-hover:scale-110 transition-all z-10" />
                  <div className="absolute bottom-4 left-4 right-4 text-center">
                    <p className="text-sm font-medium text-white">Scenario: The Fake Delivery Agent</p>
                    <p className="text-xs text-white/60">Learn how to spot a fake QR code request</p>
                  </div>
                </div>
                <Button className="w-full mt-4 bg-accent hover:bg-accent/80 text-white">
                  Start Training Session
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-panel border-emerald-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                  Safety Checklist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5" />
                    <span className="text-muted-foreground">Never share UPI PIN to receive money. PIN is only for sending.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5" />
                    <span className="text-muted-foreground">Verify merchant name displayed on scanner before confirming.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5" />
                    <span className="text-muted-foreground">Avoid downloading screen-sharing apps (AnyDesk, TeamViewer) at someone's request.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
