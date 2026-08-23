import { cn } from "@/lib/utils/cn";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon?: LucideIcon;
  trend?: { value: number; label: string };
  variant?: "default" | "success" | "warning" | "danger";
  className?: string;
}

const variantIcon: Record<string, string> = {
  default: "bg-blue-50 text-blue-600",
  success: "bg-green-50 text-green-600",
  warning: "bg-amber-50 text-amber-600",
  danger:  "bg-red-50 text-red-600",
};

export function StatCard({ label, value, sub, icon: Icon, trend, variant = "default", className }: StatCardProps) {
  return (
    <div className={cn("bg-card border border-base rounded-xl p-5 shadow-card flex flex-col gap-3", className)}>
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-secondary uppercase tracking-wider">{label}</span>
        {Icon && <span className={cn("p-2 rounded-lg", variantIcon[variant])}><Icon size={15} /></span>}
      </div>
      <div>
        <p className="text-2xl font-bold text-primary tracking-tight">{value}</p>
        {sub && <p className="text-xs text-muted mt-0.5">{sub}</p>}
      </div>
      {trend && (
        <div className="flex items-center gap-1">
          <span className={cn("text-xs font-medium", trend.value >= 0 ? "text-green-600" : "text-red-600")}>
            {trend.value >= 0 ? "+" : ""}{trend.value}%
          </span>
          <span className="text-xs text-muted">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
