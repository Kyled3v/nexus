"use client";
import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { useRouter } from "next/navigation";

interface HeaderClientProps {
  userName:   string;
  userRole:   string;
  orgName:    string;
  orgLogoUrl: string | null;
}

export function HeaderClient({ userName, userRole, orgName, orgLogoUrl }: HeaderClientProps) {
  const router  = useRouter();
  const [dark,  setDark]  = useState(false);
  const [menu,  setMenu]  = useState(false);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
  }

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/sign-in");
  }

  return (
    <header className="header">
      <div className="header__org">
        {orgLogoUrl && <img src={orgLogoUrl} alt={orgName} className="header__org-logo" />}
        <span className="header__org-name">{orgName}</span>
      </div>
      <div className="header__actions">
        <button className="header__theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {dark ? "Light" : "Dark"}
        </button>
        <div className="header__user">
          <button className="header__user-trigger" onClick={() => setMenu(!menu)} aria-expanded={menu}>
            <span className="header__user-avatar">{userName.charAt(0).toUpperCase()}</span>
            <div className="header__user-info">
              <span className="header__user-name">{userName}</span>
              <span className="header__user-role">{userRole.replace("_", " ")}</span>
            </div>
          </button>
          {menu && (
            <div className="header__user-menu">
              <div className="header__user-menu-header">
                <p className="header__user-menu-name">{userName}</p>
                <p className="header__user-menu-role">{userRole.replace("_", " ")}</p>
              </div>
              <div className="header__user-menu-items">
                <button className="header__user-menu-item" onClick={() => { setMenu(false); router.push("/settings"); }}>
                  Settings
                </button>
                <button className="header__user-menu-item header__user-menu-item--danger" onClick={handleSignOut}>
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
