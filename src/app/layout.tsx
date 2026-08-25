import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  title: { default: "NEXUS", template: "%s | NEXUS" },
  description: "NEXUS by KyleDev Software Systems — Commerce Operating Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light">
      <body>
        <div className="app-shell">
          <Sidebar />
          <div className="app-shell__main">
            <Header />
            <main className="app-shell__content">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
