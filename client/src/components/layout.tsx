import { Link, useLocation } from "wouter";
import { LayoutDashboard, Activity, ShieldAlert, BookOpen, Menu, Bell } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import generatedImage from "@assets/generated_images/dark_futuristic_cybersecurity_background_with_neon_data_lines.png";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/monitor", label: "Live Monitor", icon: Activity },
    { href: "/analysis", label: "Threat Analysis", icon: ShieldAlert },
    { href: "/education", label: "Prevention & Edu", icon: BookOpen },
  ];

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 mb-6 border-b border-border/50">
        <h1 className="text-2xl font-display font-bold text-primary tracking-wider flex items-center gap-2">
          <ShieldAlert className="w-8 h-8" />
          SENTINEL<span className="text-white">AI</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1 font-mono">UPI FRAUD DETECTION SYS</p>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <a className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 group",
                isActive 
                  ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_10px_rgba(6,182,212,0.2)]" 
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              )}>
                <item.icon className={cn("w-5 h-5", isActive && "animate-pulse")} />
                <span className="font-medium tracking-wide">{item.label}</span>
              </a>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border/50">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
          <div className="flex items-center gap-2 text-destructive mb-1">
            <Activity className="w-4 h-4" />
            <span className="text-xs font-bold uppercase">System Status</span>
          </div>
          <p className="text-xs text-destructive-foreground">Threat Level: ELEVATED</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 relative overflow-hidden">
      {/* Background Image Layer */}
      <div 
        className="fixed inset-0 z-0 opacity-20 pointer-events-none mix-blend-screen"
        style={{
          backgroundImage: `url(${generatedImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      
      {/* Grid Overlay */}
      <div className="fixed inset-0 z-0 grid-bg opacity-20 pointer-events-none" />

      <div className="relative z-10 flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 glass-panel border-r border-border/50 m-4 rounded-xl">
          <NavContent />
        </aside>

        {/* Mobile Header & Content */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <header className="h-16 border-b border-border/50 flex items-center justify-between px-6 bg-black/20 backdrop-blur-sm md:hidden">
            <div className="flex items-center gap-2 text-primary font-display font-bold text-xl">
              <ShieldAlert className="w-6 h-6" /> SENTINEL
            </div>
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 bg-background border-r border-border">
                <NavContent />
              </SheetContent>
            </Sheet>
          </header>

          <header className="hidden md:flex h-16 items-center justify-between px-8 py-4">
            <div className="font-mono text-xs text-muted-foreground">
              SYS.TIME: {new Date().toISOString().split('T')[0]} <span className="text-primary animate-pulse">● LIVE</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" className="rounded-full border-primary/30 text-primary hover:bg-primary/10">
                <Bell className="w-4 h-4" />
              </Button>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-purple-600 border border-white/20" />
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
