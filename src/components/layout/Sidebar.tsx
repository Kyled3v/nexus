"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ShoppingCart, Package, Warehouse,
  Truck, Users, TrendingUp, DollarSign, BarChart2,
  Zap, Settings, ChevronRight, Building2, ArrowLeftRight,
  FileText, Sparkles,
} from "lucide-react";
import { APP_CONFIG, NAV_ITEMS } from "@/config/app";

const ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  LayoutDashboard, ShoppingCart, Package, Warehouse,
  Truck, Users, TrendingUp, DollarSign, BarChart2,
  Zap, Settings, Building2, ArrowLeftRight, FileText,
  Sparkles,
};

interface SidebarProps {
  orgName?:    string;
  orgLogoUrl?: string | null;
  userOrgs?:   { organisationId: string; orgName: string | null; orgTradingName: string | null; orgLogoUrl: string | null }[];
  activeOrgId?: string;
}

export function Sidebar({ orgName, orgLogoUrl, userOrgs = [], activeOrgId }: SidebarProps) {
  const pathname = usePathname();
  const displayName = orgName ?? APP_CONFIG.name;

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        {orgLogoUrl ? (
          <img src={orgLogoUrl} alt={displayName} className="sidebar__logo" />
        ) : (
          <span className="sidebar__brand-name">{APP_CONFIG.name}</span>
        )}
        <span className="sidebar__brand-tagline">{displayName}</span>
      </div>

      {userOrgs.length > 1 && (
        <div className="sidebar__org-switcher">
          <p className="sidebar__org-switcher-label">Switch business</p>
          {userOrgs.map((org) => (
            <form key={org.organisationId} action="/api/v1/org/switch" method="POST">
              <input type="hidden" name="organisationId" value={org.organisationId} />
              <button
                type="submit"
                className={["sidebar__org-item", org.organisationId === activeOrgId ? "sidebar__org-item--active" : ""].join(" ").trim()}
              >
                <Building2 size={12} />
                <span>{org.orgTradingName ?? org.orgName ?? "Business"}</span>
              </button>
            </form>
          ))}
        </div>
      )}

      <nav className="sidebar__nav" aria-label="Main navigation">
        <ul>
          {NAV_ITEMS.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon   = ICONS[item.icon];
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
