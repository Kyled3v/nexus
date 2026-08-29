import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="app-shell">
        <Sidebar />
        <div className="app-shell__main">
          <Header />
          <main className="app-shell__content">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
