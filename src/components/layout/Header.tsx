"use client";

import { Bell, Sun, Moon, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { currentUser, _devSwitchRole } from "@/lib/auth/dev-context";
import type { Role } from "@/types/permissions";
import { clsx } from "clsx";

const ROLES: Role[] = [
  "owner","manager","cashier","stock_controller",
  "purchasing","accountant","marketing","administrator",
];

export function Header() {
  const [dark, setDark] = useState(false);
  const [user, setUser] = useState(currentUser());
  const [showRoles, setShowRoles] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  function switchRole(role: Role) {
    _devSwitchRole(role);
    setUser(currentUser());
    setShowRoles(false);
  }

  return (
    <header className="flex items-center justify-between px-6 h-14 bg-header border-b border-base shrink-0">
      <div />

      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <button
          onClick={() => setDark(!dark)}
          className="p-2 rounded-lg text-secondary hover:text-primary hover:bg-page transition-colors"
          aria-label="Toggle theme"
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications */}
        <button
          className="p-2 rounded-lg text-secondary hover:text-primary hover:bg-page transition-colors relative"
          aria-label="Notifications"
        >
          <Bell size={16} />
        </button>

        {/* Dev role switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoles(!showRoles)}
            className={clsx(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              "bg-warning-50 text-warning-700 hover:bg-warning-100 border border-warning-500/30"
            )}
          >
            <span className="w-2 h-2 rounded-full bg-warning-500" />
            <span>{user.name}</span>
            <span className="text-2xs opacity-60 font-normal capitalize">
              [{user.role.replace("_", " ")}]
            </span>
            <ChevronDown size={12} />
          </button>

          {showRoles && (
            <div className="absolute right-0 top-full mt-1 w-52 bg-card border border-base rounded-xl shadow-modal z-50 py-1">
              <p className="px-3 py-2 text-2xs text-muted font-medium uppercase tracking-wider">
                Dev: Switch Role
              </p>
              {ROLES.map((role) => (
                <button
                  key={role}
                  onClick={() => switchRole(role)}
                  className={clsx(
                    "w-full text-left px-3 py-2 text-sm transition-colors",
                    user.role === role
                      ? "text-primary font-medium bg-accent-subtle"
                      : "text-secondary hover:text-primary hover:bg-page"
                  )}
                >
                  {role.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
