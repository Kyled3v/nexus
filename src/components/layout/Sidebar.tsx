"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ShoppingCart, Package, Warehouse,
  Truck, Users, TrendingUp, DollarSign, BarChart2,
  Zap, Settings, ChevronRight,
} from "lucide-react";
import { APP_CONFIG, NAV_ITEMS } from "@/config/app";

const ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  LayoutDashboard, ShoppingCart, Package, Warehouse,
  Truck, Users, TrendingUp, DollarSign, BarChart2,
  Zap, Settings,
};

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__brand-name">{APP_CONFIG.name}</span>
        <span className="sidebar__brand-tagline">{APP_CONFIG.tagline}</span>
      </div>
      <nav className="sidebar__nav" aria-label="Main navigation">
        <ul>
          {NAV_ITEMS.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = ICONS[item.icon];
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={["sidebar__nav-item", active ? "sidebar__nav-item--active" : ""].join(" ").trim()}
                  aria-current={active ? "page" : undefined}
                >
                  {Icon && <Icon size={15} />}
                  {item.label}
                  {active && <ChevronRight size={12} className="ml-auto opacity-40" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <footer className="sidebar__footer">
        <span>{APP_CONFIG.poweredBy}</span>
        <span>v{APP_CONFIG.version}</span>
      </footer>
    </aside>
  );
}
