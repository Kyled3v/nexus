import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { AuthGuard } from "@/components/auth/auth-guard";
import { getOrgContext } from "@/lib/org/context";
import { getUserOrganisations } from "@/repositories/multi-org.repository";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const ctx      = await getOrgContext();
  const userOrgs = ctx ? await getUserOrganisations(ctx.userId) : [];

  return (
    <AuthGuard>
      <div className="app-shell">
        <Sidebar
          orgName={ctx?.orgTradingName ?? ctx?.orgName}
          orgLogoUrl={ctx?.orgLogoUrl}
          userOrgs={userOrgs}
          activeOrgId={ctx?.organisationId}
        />
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
