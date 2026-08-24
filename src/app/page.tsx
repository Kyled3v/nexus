import { StatCard } from "@/components/shared/stat-card";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DEMO_BUSINESS, DEMO_BRANCHES } from "@/data/demo-business";
import { DEMO_PRODUCTS } from "@/data/demo-products";
import { generateStockIntelligenceReport } from "@/services/automation/stock-intelligence";
import { KdosClient } from "@/services/ai/kdos-client";
import { DollarSign, ShoppingCart, Package, AlertTriangle, TrendingUp, Users, Truck, Zap, Brain, ChevronRight } from "lucide-react";

export const metadata = { title: "Dashboard" };

const ALERTS = [
  { id: 1, type: "warning", message: "Dulux White 20L below reorder level (3 units remaining)" },
  { id: 2, type: "warning", message: "Plascon Exterior 5L critically low (1 unit remaining)" },
  { id: 3, type: "info",    message: "Purchase Order PO-0012 awaiting approval" },
  { id: 4, type: "success", message: "Stock transfer from Main to East Branch completed" },
];

const TOP_PRODUCTS = [
  { name: "Dulux Weathershield 20L", sales: 42, revenue: "R 18,900" },
  { name: "Plascon Velvaglo 5L",     sales: 38, revenue: "R 9,500"  },
  { name: "Crown Trade Matt 20L",    sales: 31, revenue: "R 12,400" },
  { name: "Rust-Oleum Primer 1L",    sales: 28, revenue: "R 4,200"  },
  { name: "Dulux Eggshell 5L",       sales: 24, revenue: "R 6,000"  },
];

export default async function DashboardPage() {
  const stockReport = generateStockIntelligenceReport(
    DEMO_PRODUCTS,
    DEMO_BUSINESS.id,
    DEMO_BRANCHES[0].id
  );

  const kdosContext = {
    businessId: DEMO_BUSINESS.id,
    branchId: DEMO_BRANCHES[0].id,
    period: "day" as const,
    data: { stockReport },
  };

  const [kdosRecs, kdosRisks] = await Promise.all([
    KdosClient.getRecommendations(kdosContext),
    KdosClient.getRiskAlerts(kdosContext),
  ]);

  const urgencyVariant = (u: string) =>
    u === "critical" ? "danger" : u === "high" ? "danger" : u === "medium" ? "warning" : "muted";

  const severityDot: Record<string, string> = {
    critical: "bg-red-500",
    high:     "bg-red-400",
    medium:   "bg-amber-500",
    low:      "bg-blue-400",
  };

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-primary">{DEMO_BUSINESS.tradingName}</h1>
          <p className="text-sm text-secondary mt-0.5">
            {DEMO_BRANCHES.length} branches &middot; {new Date().toLocaleDateString("en-ZA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <Badge variant="success">Live</Badge>
      </div>

      {/* KDOS Risk Alerts */}
      {kdosRisks.length > 0 && (
        <div className="space-y-2">
          {kdosRisks.map((risk) => (
            <div key={risk.id} className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
              <span className={["w-2 h-2 rounded-full mt-1 shrink-0", severityDot[risk.severity] ?? "bg-gray-400"].join(" ")} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-red-800">{risk.title}</p>
                <p className="text-xs text-red-600 mt-0.5">{risk.description}</p>
              </div>
              <Badge variant="danger">{risk.severity}</Badge>
            </div>
          ))}
        </div>
      )}

      {/* KPI row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Revenue Today"   value="R 14,280" sub="VAT inclusive"        icon={DollarSign}    trend={{ value: 12.4, label: "vs yesterday" }} />
        <StatCard label="Transactions"    value="38"       sub="across all branches"   icon={ShoppingCart}  trend={{ value: 5.2,  label: "vs yesterday" }} />
        <StatCard label="Low Stock Items" value={String(stockReport.summary.lowStock + stockReport.summary.critical + stockReport.summary.outOfStock)} sub="require attention" icon={AlertTriangle} variant="warning" />
        <StatCard label="Open Leads"      value="12"       sub="4 require follow-up"   icon={TrendingUp} />
      </div>

      {/* KPI row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Gross Profit"     value="R 4,820"   sub="33.7% margin"         icon={DollarSign} variant="success" />
        <StatCard label="Stock Value"      value={"R " + Math.round(stockReport.totalValue).toLocaleString("en-ZA")} sub="at cost price" icon={Package} />
        <StatCard label="Active Customers" value="148"        sub="purchased this month" icon={Users} />
        <StatCard label="Pending Orders"   value="3"          sub="awaiting approval"    icon={Truck} variant="warning" />
      </div>

      {/* Stock intelligence + top products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Stock alerts from intelligence engine */}
        <Card>
          <CardHeader>
            <CardTitle>Stock Intelligence</CardTitle>
            <Badge variant={stockReport.summary.outOfStock > 0 || stockReport.summary.critical > 0 ? "danger" : "warning"}>
              {stockReport.alerts.length} alerts
            </Badge>
          </CardHeader>
          <div className="space-y-2">
            {stockReport.alerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-page">
                <span className={["mt-0.5 w-2 h-2 rounded-full shrink-0", severityDot[alert.severity] ?? "bg-gray-400"].join(" ")} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-primary font-medium truncate">{alert.productName}</p>
                  <p className="text-xs text-muted mt-0.5">{alert.action}</p>
                </div>
                <Badge variant={alert.severity === "critical" ? "danger" : "warning"}>{alert.type.replace("_", " ")}</Badge>
              </div>
            ))}
            {stockReport.alerts.length === 0 && (
              <p className="text-sm text-muted text-center py-4">All stock levels are healthy.</p>
            )}
          </div>
        </Card>

        {/* Top products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products This Month</CardTitle>
            <Badge variant="muted">by sales</Badge>
          </CardHeader>
          <div className="space-y-1">
            {TOP_PRODUCTS.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-page transition-colors">
                <span className="text-xs font-mono text-muted w-4">{i + 1}</span>
                <span className="flex-1 text-sm text-primary truncate">{p.name}</span>
                <span className="text-xs text-secondary">{p.sales} sold</span>
                <span className="text-sm font-semibold text-primary w-20 text-right">{p.revenue}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* KDOS Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain size={14} className="text-[var(--accent)]" />
            KDOS Intelligence
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">Powered by KDOS</span>
            <Badge variant="muted">{kdosRecs.length} recommendations</Badge>
          </div>
        </CardHeader>
        <div className="space-y-3">
          {kdosRecs.map((rec) => (
            <div key={rec.id} className="p-4 rounded-xl border border-base hover:bg-page transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-primary">{rec.title}</p>
                    <Badge variant={urgencyVariant(rec.urgency)}>{rec.urgency}</Badge>
                  </div>
                  <p className="text-xs text-secondary">{rec.summary}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {rec.dataPoints.map((dp) => (
                      <span key={dp} className="text-2xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">{dp}</span>
                    ))}
                  </div>
                </div>
                <span className="text-xs text-muted shrink-0">{Math.round(rec.confidence * 100)}% confidence</span>
              </div>
              <div className="flex items-center gap-2 mt-3">
                {rec.actions.map((action) => (
                  <button
                    key={action.id}
                    className={["text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1",
                      action.type === "approve"
                        ? "bg-[var(--accent)] text-white border-transparent hover:bg-[var(--accent-hover)]"
                        : "bg-page text-secondary border-base hover:text-primary"
                    ].join(" ")}
                  >
                    {action.requiresApproval && <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />}
                    {action.label}
                    {action.type === "approve" && <ChevronRight size={11} />}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Automation activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap size={14} className="text-[var(--accent)]" />
            Automation Activity
          </CardTitle>
          <Badge variant="muted">last 24h</Badge>
        </CardHeader>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Rules Active",     value: "8"  },
            { label: "Triggered Today",  value: "14" },
            { label: "Pending Approval", value: "3"  },
            { label: "Executed Today",   value: "11" },
          ].map((s) => (
            <div key={s.label} className="text-center p-3 rounded-lg bg-page">
              <p className="text-xl font-bold text-primary">{s.value}</p>
              <p className="text-xs text-muted mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
}
