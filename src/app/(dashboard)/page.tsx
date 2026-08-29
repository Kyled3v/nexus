import { StatCard } from "@/components/shared/stat-card";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DEMO_PRODUCTS } from "@/data/demo-products";
import { generateStockIntelligenceReport } from "@/services/automation/stock-intelligence";
import { KdosClient } from "@/services/ai/kdos-client";
import { DollarSign, ShoppingCart, Package, AlertTriangle, TrendingUp, Users, Truck } from "lucide-react";
import { getOrgContext } from "@/lib/org/context";
import { getDailySummary } from "@/repositories/sales.repository";
import { getCustomerCount } from "@/repositories/customers.repository";
import { redirect } from "next/navigation";

export const metadata = { title: "Dashboard" };

function formatZAR(value: number) {
  return "R " + value.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default async function DashboardPage() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/sign-in");

  const [daily, customerCount] = await Promise.all([
    getDailySummary(ctx.organisationId, ctx.branches[0]?.id),
    getCustomerCount(ctx.organisationId),
  ]);

  const stockReport = generateStockIntelligenceReport(
    DEMO_PRODUCTS,
    ctx.organisationId,
    ctx.branches[0]?.id ?? "main"
  );

  const kdosContext = {
    businessId: ctx.organisationId,
    branchId:   ctx.branches[0]?.id ?? "main",
    period:     "day" as const,
    data:       {},
  };

  const [kdosRecs, kdosRisks] = await Promise.all([
    KdosClient.getRecommendations(kdosContext),
    KdosClient.getRiskAlerts(kdosContext),
  ]);

  const displayName = ctx.orgTradingName ?? ctx.orgName;

  return (
    <div className="page">
      <header className="page-header">
        <div className="page-header__text">
          <h1 className="page-header__title">{displayName}</h1>
          <p className="page-header__sub">
            {ctx.branches.length} {ctx.branches.length === 1 ? "branch" : "branches"} &middot;{" "}
            {new Date().toLocaleDateString("en-ZA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <Badge variant="success">Live</Badge>
      </header>

      {kdosRisks.length > 0 && (
        <section className="risk-alerts" aria-label="Risk alerts">
          {kdosRisks.map((risk) => (
            <div key={risk.id} className="risk-alert" data-severity={risk.severity}>
              <div>
                <p className="risk-alert__title">{risk.title}</p>
                <p className="risk-alert__desc">{risk.description}</p>
              </div>
              <Badge variant="danger">{risk.severity}</Badge>
            </div>
          ))}
        </section>
      )}

      <section className="stat-grid" aria-label="Key metrics">
        <StatCard
          label="Revenue Today"
          value={daily.revenue > 0 ? formatZAR(daily.revenue) : "R 0.00"}
          sub="VAT inclusive"
          icon={DollarSign}
        />
        <StatCard
          label="Transactions"
          value={String(daily.transactions)}
          sub="completed today"
          icon={ShoppingCart}
        />
        <StatCard
          label="Stock Alerts"
          value={String(stockReport.summary.lowStock + stockReport.summary.critical + stockReport.summary.outOfStock)}
          sub="require attention"
          icon={AlertTriangle}
          variant="warning"
        />
        <StatCard
          label="Active Customers"
          value={String(customerCount)}
          sub="in your database"
          icon={Users}
        />
        <StatCard
          label="Tax Collected"
          value={daily.tax > 0 ? formatZAR(daily.tax) : "R 0.00"}
          sub="today"
          icon={DollarSign}
          variant="success"
        />
        <StatCard
          label="Stock Value"
          value={"R " + Math.round(stockReport.totalValue).toLocaleString("en-ZA")}
          sub="at cost price"
          icon={Package}
        />
        <StatCard
          label="Discounts Given"
          value={daily.discounts > 0 ? formatZAR(daily.discounts) : "R 0.00"}
          sub="today"
          icon={TrendingUp}
        />
        <StatCard
          label="Pending Orders"
          value="—"
          sub="coming soon"
          icon={Truck}
          variant="warning"
        />
      </section>

      <div className="dashboard__panels">
        <section aria-label="Stock intelligence">
          <Card>
            <CardHeader>
              <CardTitle>Stock Intelligence</CardTitle>
              <Badge variant={stockReport.summary.outOfStock > 0 || stockReport.summary.critical > 0 ? "danger" : "warning"}>
                {stockReport.alerts.length} alerts
              </Badge>
            </CardHeader>
            {stockReport.alerts.length === 0 ? (
              <p className="empty-state">All stock levels are healthy.</p>
            ) : (
              <ul className="alert-list">
                {stockReport.alerts.slice(0, 5).map((alert) => (
                  <li key={alert.id} className="alert-list__item" data-severity={alert.severity}>
                    <div className="alert-list__body">
                      <p className="alert-list__name">{alert.productName}</p>
                      <p className="alert-list__action">{alert.action}</p>
                    </div>
                    <Badge variant={alert.severity === "critical" ? "danger" : "warning"}>
                      {alert.type.replace("_", " ")}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>

        <section aria-label="KDOS recommendations">
          <Card>
            <CardHeader>
              <CardTitle>KDOS Intelligence</CardTitle>
              <span className="kdos-tag">Powered by KDOS</span>
            </CardHeader>
            {kdosRecs.map((rec) => (
              <article key={rec.id} className="recommendation" data-urgency={rec.urgency}>
                <header className="recommendation__header">
                  <h4 className="recommendation__title">{rec.title}</h4>
                  <Badge variant={rec.urgency === "critical" || rec.urgency === "high" ? "danger" : rec.urgency === "medium" ? "warning" : "muted"}>
                    {rec.urgency}
                  </Badge>
                </header>
                <p className="recommendation__summary">{rec.summary}</p>
                <ul className="recommendation__data-points">
                  {rec.dataPoints.map((dp) => <li key={dp}><code>{dp}</code></li>)}
                </ul>
                <footer className="recommendation__actions">
                  {rec.actions.map((action) => (
                    <button key={action.id} className={["recommendation__action", "recommendation__action--" + action.type].join(" ")}>
                      {action.label}
                    </button>
                  ))}
                  <span className="recommendation__confidence">{Math.round(rec.confidence * 100)}% confidence</span>
                </footer>
              </article>
            ))}
          </Card>
        </section>
      </div>
    </div>
  );
}
