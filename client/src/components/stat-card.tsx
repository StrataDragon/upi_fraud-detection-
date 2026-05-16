import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  color?: string;
  index?: number;
}

export function StatCard({ title, value, change, icon: Icon, color = "text-primary", index = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="glass-panel border-primary/10 hover:border-primary/30 transition-colors duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </CardTitle>
          <Icon className={cn("h-4 w-4", color)} />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold font-mono tracking-tight text-foreground">{value}</div>
          <p className={cn("text-xs mt-1 font-medium", 
            change.startsWith("+") ? "text-emerald-400" : "text-rose-400"
          )}>
            {change} <span className="text-muted-foreground">from last month</span>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
