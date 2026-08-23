"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart2, FileText, Download, TrendingUp, Package, Users, Truck } from "lucide-react";

const REPORT_LIST = [
  { id: "r-001", name: "Sales Summary",         description: "Daily, weekly and monthly sales breakdown",    icon: BarChart2,   category: "Sales"     },
  { id: "r-002", name: "Product Performance",   description: "Best and worst performing products",           icon: Package,    category: "Products"  },
  { id: "r-003", name: "Inventory Valuation",   description: "Current stock value by category and branch",  icon: Package,    category: "Inventory" },
  { id: "r-004", name: "Stock Movement",        description: "All inventory movements with audit trail",     icon: TrendingUp, category: "Inventory" },
  { id: "r-005", name: "Customer Analysis",     description: "Customer spend, frequency and segments",      icon: Users,      category: "Customers" },
  { id: "r-006", name: "Supplier Performance",  description: "Delivery times, pricing and reliability",     icon: Truck,      category: "Suppliers" },
  { id: "r-007", name: "Profit & Loss",         description: "Revenue, cost and margin summary",            icon: BarChart2,  category: "Finance"   },
  { id: "r-008", name: "Branch Comparison",     description: "Performance comparison across branches",      icon: BarChart2,  category: "Business"  },
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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-primary">Reports</h1>
          <p className="text-sm text-secondary mt-0.5">Business reports and analytics</p>
        </div>
        <Button variant="secondary" size="sm"><Download size={14} />Export All</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Available Reports</CardTitle><Badge variant="muted">{REPORT_LIST.length} reports</Badge></CardHeader>
          <div className="space-y-1">
            {REPORT_LIST.map((r) => {
              const Icon = r.icon;
              return (
                <div key={r.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-page transition-colors group cursor-pointer">
                  <Icon size={16} className="text-muted shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary">{r.name}</p>
                    <p className="text-xs text-muted truncate">{r.description}</p>
                  </div>
                  <Badge variant="muted">{r.category}</Badge>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100"><FileText size={12} /></Button>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Top Products This Month</CardTitle><Badge variant="muted">by revenue</Badge></CardHeader>
          <div className="space-y-2">
            {TOP_PRODUCTS.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-page transition-colors">
                <span className="text-xs font-mono text-muted w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-primary truncate">{p.name}</p>
                  <p className="text-xs text-muted">{p.units} units sold &middot; {p.margin}% margin</p>
                </div>
                <span className="text-sm font-semibold text-primary">R {p.revenue.toLocaleString("en-ZA")}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
