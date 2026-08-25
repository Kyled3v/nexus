"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_CONFIG, NAV_ITEMS } from "@/config/app";

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__brand-name">{APP_CONFIG.name}</span>
        <span className="sidebar__brand-tagline">{APP_CONFIG.tagline}</span>
      </div>
      <nav className="sidebar__nav">
        <ul>
          {NAV_ITEMS.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link href={item.href} className={["sidebar__nav-item", active ? "sidebar__nav-item--active" : ""].join(" ").trim()}>
                  {item.label}
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
