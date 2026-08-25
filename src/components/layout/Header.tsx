"use client";
import { useState } from "react";
import { currentUser, _devSwitchRole } from "@/lib/auth/dev-context";
import type { Role } from "@/types/permissions";

const ROLES: Role[] = ["owner","manager","cashier","stock_controller","purchasing","accountant","marketing","administrator"];

export function Header() {
  const [dark, setDark] = useState(false);
  const [user, setUser] = useState(currentUser());
  const [showRoles, setShowRoles] = useState(false);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
  }

  function switchRole(role: Role) {
    _devSwitchRole(role);
    setUser(currentUser());
    setShowRoles(false);
  }

  return (
    <header className="header">
      <div className="header__spacer" />
      <div className="header__actions">
        <button className="header__theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {dark ? "Light" : "Dark"}
        </button>
        <button className="header__notifications" aria-label="Notifications">
          Notifications
        </button>
        <div className="header__dev-role">
          <button className="header__dev-role-trigger" onClick={() => setShowRoles(!showRoles)}>
            <span className="header__dev-indicator" aria-label="Dev mode" />
            {user.name}
            <span className="header__dev-role-label">[{user.role.replace("_", " ")}]</span>
          </button>
          {showRoles && (
            <ul className="header__dev-role-menu" role="menu">
              <li className="header__dev-role-heading">Dev: Switch Role</li>
              {ROLES.map((role) => (
                <li key={role} role="menuitem">
                  <button
                    onClick={() => switchRole(role)}
                    aria-current={user.role === role ? "true" : undefined}
                  >
                    {role.replace("_", " ").replace(/\w/g, (c) => c.toUpperCase())}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </header>
  );
}
