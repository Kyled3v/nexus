"use client";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const REPORTS = [
  { id: "r-001", name: "Sales Summary",        description: "Daily, weekly and monthly sales breakdown",   category: "Sales"     },
  { id: "r-002", name: "Product Performance",  description: "Best and worst performing products",          category: "Products"  },
  { id: "r-003", name: "Inventory Valuation",  description: "Current stock value by category and branch",  category: "Inventory" },
  { id: "r-004", name: "Stock Movement",       description: "All inventory movements with audit trail",    category: "Inventory" },
  { id: "r-005", name: "Customer Analysis",    description: "Customer spend, frequency and segments",     category: "Customers" },
  { id: "r-006", name: "Supplier Performance", description: "Delivery times, pricing and reliability",    category: "Suppliers" },
  { id: "r-007", name: "Profit and Loss",      description: "Revenue, cost and margin summary",           category: "Finance"   },
  { id: "r-008", name: "Branch Comparison",    description: "Performance comparison across branches",     category: "Business"  },
];

const TOP_PRODUCTS = [
  { name: "Dulux Weathershield 20L", revenue: 18900, units: 42, margin: 36.7 },
  { name: "Crown Trade Matt 20L",    revenue: 12400, units: 31, margin: 35.0 },
  { name: "Plascon Velvaglo 5L",     revenue:  9500, units: 38, margin: 42.0 },
  { name: "Rust-Oleum Primer 1L",    revenue:  4200, units: 28, margin: 42.1 },
  { name: "Dulux Eggshell 5L",       revenue:  6000, units: 24, margin: 40.9 },
];

export default function ReportsPage() {
  return (
    <div className="page">
      <header className="page-header">
        <div className="page-header__text">
          <h1 className="page-header__title">Reports</h1>
          <p className="page-header__sub">Business reports and analytics</p>
        </div>
        <Button variant="secondary" size="sm">Export All</Button>
      </header>

      <div className="reports-panels">
        <Card>
          <CardHeader><CardTitle>Available Reports</CardTitle><Badge variant="muted">{REPORTS.length} reports</Badge></CardHeader>
          <ul className="report-list">
            {REPORTS.map((r) => (
              <li key={r.id} className="report-list__item">
                <div className="report-list__body">
                  <strong className="report-list__name">{r.name}</strong>
                  <p className="report-list__desc">{r.description}</p>
                </div>
                <Badge variant="muted">{r.category}</Badge>
                <Button variant="ghost" size="sm">Run</Button>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader><CardTitle>Top Products This Month</CardTitle><Badge variant="muted">by revenue</Badge></CardHeader>
          <ol className="product-rank-list">
            {TOP_PRODUCTS.map((p) => (
              <li key={p.name} className="product-rank-list__item">
                <span className="product-rank-list__name">{p.name}</span>
                <span className="product-rank-list__meta">{p.units} units &middot; {p.margin}% margin</span>
                <span className="product-rank-list__revenue">R {p.revenue.toLocaleString("en-ZA")}</span>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </div>
  );
}
