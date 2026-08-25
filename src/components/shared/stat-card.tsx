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

export function StatCard({ label, value, sub, icon: Icon, trend, variant = "default", className }: StatCardProps) {
  return (
    <article className={["stat-card", "stat-card--" + variant, className ?? ""].join(" ").trim()} data-variant={variant}>
      <header className="stat-card__header">
        <span className="stat-card__label">{label}</span>
        {Icon && <span className="stat-card__icon" aria-hidden="true"><Icon size={16} /></span>}
      </header>
      <div className="stat-card__body">
        <p className="stat-card__value">{value}</p>
        {sub && <p className="stat-card__sub">{sub}</p>}
      </div>
      {trend && (
        <footer className="stat-card__trend" data-positive={trend.value >= 0}>
          <span className="stat-card__trend-value">{trend.value >= 0 ? "+" : ""}{trend.value}%</span>
          <span className="stat-card__trend-label">{trend.label}</span>
        </footer>
      )}
    </article>
  );
}
