import { Link, useLocation } from "wouter";
import { LayoutDashboard, Activity, ShieldAlert, BookOpen, Menu, Bell, AlertTriangle, BarChart3, Users, Network } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAppStore } from "@/store/useAppStore";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { transactions } = useAppStore();

  const recentFraud = transactions.slice(0, 20).filter((t) => t.isFraudulent).length;
  const hasCritical = transactions.slice(0, 5).some((t) => t.severity === "critical");
  const threatLevel = hasCritical ? "CRITICAL" : recentFraud > 3 ? "ELEVATED" : recentFraud > 0 ? "MODERATE" : "NOMINAL";
  const threatColor = hasCritical ? "text-rose-600" : recentFraud > 3 ? "text-amber-600" : recentFraud > 0 ? "text-yellow-600" : "text-emerald-600";
  const threatBorderColor = hasCritical ? "border-rose-200 bg-rose-50/80" : recentFraud > 3 ? "border-amber-200 bg-amber-50/80" : recentFraud > 0 ? "border-yellow-200 bg-yellow-50/80" : "border-emerald-200 bg-emerald-50/80";

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/fraud", label: "Fraud Detection", icon: AlertTriangle },
    { href: "/monitor", label: "Live Monitor", icon: Activity },
    { href: "/analysis", label: "Threat Analysis", icon: ShieldAlert },
    { href: "/advanced-analytics", label: "Advanced Analytics", icon: BarChart3 },
    { href: "/typology-radar", label: "Typology Radar", icon: Network },
    { href: "/user-profiles", label: "User Profiles", icon: Users },
    { href: "/education", label: "Prevention & Edu", icon: BookOpen },
  ];

  const currentSection = navItems.find((item) => item.href === location)?.label ?? "Operations";

  const NavContent = () => (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200/80 px-6 py-6">
        <div className="eyebrow mb-4">UPI Defense Grid</div>
        <h1 className="flex items-center gap-3 text-2xl font-display font-bold text-slate-950">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-200 bg-white/90 text-sky-600 shadow-[0_10px_30px_rgba(14,165,233,0.15)]">
            <ShieldAlert className="h-6 w-6" />
          </span>
          SENTINEL <span className="text-sky-600">AI</span>
        </h1>
        <p className="mt-3 max-w-[16rem] text-sm leading-7 text-slate-600">
          Command center for fraud triage, typology training, and live transaction review.
        </p>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-5">
        {navItems.map((item) => {
          const isActive = location === item.href;

          return (
            <Link key={item.href} href={item.href}>
              <a
                className={cn(
                  "group flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200",
                  isActive
                    ? "border border-slate-300 bg-white text-slate-950 shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
                    : "text-slate-600 hover:border hover:border-slate-200 hover:bg-white/80 hover:text-slate-950",
                )}
              >
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl border transition-colors",
                    isActive ? "border-sky-200 bg-sky-50 text-sky-600" : "border-slate-200 bg-white/70 text-slate-500 group-hover:text-sky-600",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                </span>
                <span className="font-medium tracking-wide">{item.label}</span>
              </a>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200/80 p-4">
        <div className={`rounded-2xl border p-4 ${threatBorderColor}`}>
          <div className={`mb-1 flex items-center gap-2 ${threatColor}`}>
            <Activity className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">System Status</span>
          </div>
          <p className={`text-sm font-mono font-bold ${threatColor}`}>Threat Level: {threatLevel}</p>
          <p className="mt-1 text-xs text-slate-500">{transactions.length} transactions tracked</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground selection:bg-primary/20">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="data-grid absolute inset-0 opacity-50" />
        <div className="absolute left-[-8%] top-[-12%] h-[26rem] w-[26rem] rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute right-[-8%] top-[2%] h-[24rem] w-[24rem] rounded-full bg-emerald-200/35 blur-3xl" />
        <div className="absolute bottom-[-14%] left-[30%] h-[24rem] w-[24rem] rounded-full bg-indigo-100/70 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen overflow-hidden">
        <aside className="panel-strong m-4 hidden w-72 rounded-[32px] md:block">
          <NavContent />
        </aside>

        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="panel-strong mx-3 mt-3 flex h-16 items-center justify-between rounded-[24px] px-5 md:hidden">
            <div className="flex items-center gap-3 text-slate-950">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-200 bg-white text-sky-600">
                <ShieldAlert className="h-5 w-5" />
              </span>
              <div>
                <div className="font-display text-lg font-bold">Sentinel AI</div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Fraud Ops</div>
              </div>
            </div>
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-2xl text-slate-700 hover:bg-slate-100">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 border-r border-slate-200 bg-white p-0">
                <NavContent />
              </SheetContent>
            </Sheet>
          </header>

          <header className="mx-4 mt-4 hidden items-center justify-between md:flex">
            <div>
              <div className="eyebrow mb-3">{currentSection}</div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-display font-bold text-slate-950">Fraud Intelligence Workspace</h2>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-mono font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  Live
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600">
                {new Date().toISOString().split("T")[0]} | Readable, high-signal views for real-time ops.
              </p>
            </div>

            <div className="panel-muted flex items-center gap-3 rounded-[22px] px-4 py-3">
              <button
                onClick={() => {
                  const e = new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true });
                  window.dispatchEvent(e);
                }}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 transition-colors hover:bg-slate-50"
              >
                <kbd className="text-[10px] font-mono text-sky-600">Ctrl+K</kbd>
                <span className="text-xs font-mono text-slate-500">Demo Mode</span>
              </button>
              <Button variant="outline" size="icon" className="rounded-2xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
                <Bell className="h-4 w-4" />
              </Button>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-700 shadow-sm">
                SA
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-3 pb-4 pt-3 md:px-4 md:pb-8 md:pt-4">
            <div className="mx-auto w-full max-w-[1480px]">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
