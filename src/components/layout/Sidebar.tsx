"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ShoppingCart, Package, Warehouse,
  Truck, Users, TrendingUp, DollarSign, BarChart2,
  Zap, Settings, ChevronRight,
} from "lucide-react";
import { APP_CONFIG, NAV_ITEMS } from "@/config/app";
import { clsx } from "clsx";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  LayoutDashboard, ShoppingCart, Package, Warehouse,
  Truck, Users, TrendingUp, DollarSign, BarChart2,
  Zap, Settings,
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-sidebar min-h-screen bg-sidebar border-r border-base shrink-0">
      {/* Brand */}
      <div className="flex flex-col px-5 py-5 border-b border-base">
        <span className="text-lg font-bold tracking-tight text-primary">
          {APP_CONFIG.name}
        </span>
        <span className="text-2xs text-muted mt-0.5">{APP_CONFIG.tagline}</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = ICON_MAP[item.icon];
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-accent-subtle accent"
                  : "text-secondary hover:text-primary hover:bg-page"
              )}
            >
              {Icon && <Icon size={16} />}
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight size={14} className="opacity-40" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-base">
        <p className="text-2xs text-muted">{APP_CONFIG.poweredBy}</p>
        <p className="text-2xs text-muted opacity-60">v{APP_CONFIG.version}</p>
      </div>
    </aside>
  );
}
