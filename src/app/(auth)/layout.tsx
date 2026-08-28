import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: { default: "NEXUS", template: "%s | NEXUS" },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-layout">
      {children}
    </div>
  );
}
