import { StatCard } from "@/components/shared/stat-card";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DEMO_PRODUCTS } from "@/data/demo-products";
import { generateStockIntelligenceReport } from "@/services/automation/stock-intelligence";
import { KdosClient } from "@/services/ai/kdos-client";
import { DollarSign, ShoppingCart, Package, AlertTriangle, TrendingUp, Users, Truck } from "lucide-react";
import { getOrgContext } from "@/lib/org/context";
import { redirect } from "next/navigation";

export const metadata = { title: "Dashboard" };

const TOP_PRODUCTS = [
  { name: "Dulux Weathershield 20L", sales: 42, revenue: "R 18,900" },
  { name: "Plascon Velvaglo 5L",     sales: 38, revenue: "R 9,500"  },
  { name: "Crown Trade Matt 20L",    sales: 31, revenue: "R 12,400" },
  { name: "Rust-Oleum Primer 1L",    sales: 28, revenue: "R 4,200"  },
  { name: "Dulux Eggshell 5L",       sales: 24, revenue: "R 6,000"  },
];

export default async function DashboardPage() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/sign-in");

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
        <StatCard label="Revenue Today"    value="R 14,280" sub="VAT inclusive"        icon={DollarSign}    trend={{ value: 12.4, label: "vs yesterday" }} />
        <StatCard label="Transactions"     value="38"       sub="across all branches"   icon={ShoppingCart}  trend={{ value: 5.2,  label: "vs yesterday" }} />
        <StatCard label="Stock Alerts"     value={String(stockReport.summary.lowStock + stockReport.summary.critical + stockReport.summary.outOfStock)} sub="require attention" icon={AlertTriangle} variant="warning" />
        <StatCard label="Open Leads"       value="12"       sub="4 require follow-up"   icon={TrendingUp} />
        <StatCard label="Gross Profit"     value="R 4,820"  sub="33.7% margin"          icon={DollarSign}    variant="success" />
        <StatCard label="Stock Value"      value={"R " + Math.round(stockReport.totalValue).toLocaleString("en-ZA")} sub="at cost price" icon={Package} />
        <StatCard label="Active Customers" value="148"      sub="purchased this month"  icon={Users} />
        <StatCard label="Pending Orders"   value="3"        sub="awaiting approval"     icon={Truck}         variant="warning" />
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

        <section aria-label="Top products">
          <Card>
            <CardHeader>
              <CardTitle>Top Products This Month</CardTitle>
              <Badge variant="muted">by sales</Badge>
            </CardHeader>
            <ol className="product-rank-list">
              {TOP_PRODUCTS.map((p) => (
                <li key={p.name} className="product-rank-list__item">
                  <span className="product-rank-list__name">{p.name}</span>
                  <span className="product-rank-list__sales">{p.sales} sold</span>
                  <span className="product-rank-list__revenue">{p.revenue}</span>
                </li>
              ))}
            </ol>
          </Card>
        </section>
      </div>

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
  );
}
