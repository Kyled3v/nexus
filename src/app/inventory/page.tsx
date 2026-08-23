"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DEMO_PRODUCTS } from "@/data/demo-products";
import { Search, AlertTriangle, TrendingDown, TrendingUp, Package } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const STATUS_CONFIG = {
  ok:        { label: "OK",          variant: "success" as const, dot: "bg-green-500" },
  low:       { label: "Low Stock",   variant: "warning" as const, dot: "bg-amber-500" },
  critical:  { label: "Critical",    variant: "danger"  as const, dot: "bg-red-500"   },
  out:       { label: "Out",         variant: "danger"  as const, dot: "bg-red-700"   },
  overstock: { label: "Overstock",   variant: "muted"   as const, dot: "bg-blue-500"  },
};

export default function InventoryPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = DEMO_PRODUCTS.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || p.stockStatus === filter;
    return matchSearch && matchFilter;
  });

  const summary = {
    total: DEMO_PRODUCTS.length,
    ok: DEMO_PRODUCTS.filter(p => p.stockStatus === "ok").length,
    low: DEMO_PRODUCTS.filter(p => p.stockStatus === "low").length,
    critical: DEMO_PRODUCTS.filter(p => p.stockStatus === "critical").length,
    out: DEMO_PRODUCTS.filter(p => p.stockStatus === "out").length,
    overstock: DEMO_PRODUCTS.filter(p => p.stockStatus === "overstock").length,
    totalValue: DEMO_PRODUCTS.reduce((sum, p) => sum + p.currentStock * p.costPrice, 0),
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-primary">Inventory</h1>
          <p className="text-sm text-secondary mt-0.5">Stock levels across all locations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">Transfer Stock</Button>
          <Button variant="secondary" size="sm">Adjust Stock</Button>
          <Button size="sm">Receive Stock</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {[
          { label: "Total SKUs",  value: summary.total,     color: "text-primary"    },
          { label: "OK",          value: summary.ok,         color: "text-green-600"  },
          { label: "Low Stock",   value: summary.low,        color: "text-amber-600"  },
          { label: "Critical",    value: summary.critical,   color: "text-red-600"    },
          { label: "Out",         value: summary.out,        color: "text-red-700"    },
          { label: "Overstock",   value: summary.overstock,  color: "text-blue-600"   },
        ].map((s) => (
          <Card key={s.label} padding="sm" className="text-center">
            <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
            <p className="text-xs text-muted mt-0.5">{s.label}</p>
          </Card>
        ))}
      </div>

      <Card padding="sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted uppercase tracking-wider">Total Stock Value</p>
            <p className="text-xl font-bold text-primary mt-0.5">R {summary.totalValue.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</p>
          </div>
          <Package size={20} className="text-muted" />
        </div>
      </Card>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search products or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm bg-card border border-base rounded-lg text-primary placeholder:text-muted focus:outline-none w-64"
          />
        </div>
        {["all", "ok", "low", "critical", "out", "overstock"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors capitalize",
              filter === f ? "bg-[var(--accent)] text-white border-transparent" : "bg-card text-secondary border-base hover:text-primary"
            )}
          >
            {f === "all" ? "All" : STATUS_CONFIG[f as keyof typeof STATUS_CONFIG]?.label ?? f}
          </button>
        ))}
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-base">
                {["Product", "SKU", "Current", "Reserved", "Available", "Reorder", "Target", "Value", "Status", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center">
                    <Package size={32} className="mx-auto text-muted mb-2" />
                    <p className="text-sm text-muted">No products found</p>
                  </td>
                </tr>
              )}
              {filtered.map((p) => {
                const cfg = STATUS_CONFIG[p.stockStatus];
                const stockValue = p.currentStock * p.costPrice;
                const pct = p.targetStock > 0 ? Math.min(100, Math.round((p.currentStock / p.targetStock) * 100)) : 0;
                return (
                  <tr key={p.id} className="hover:bg-page transition-colors border-b border-base last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={cn("w-2 h-2 rounded-full shrink-0", cfg.dot)} />
                        <div>
                          <p className="font-medium text-primary">{p.name}</p>
                          <p className="text-xs text-muted">{p.categoryName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-secondary">{p.sku}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className={cn("font-semibold", p.currentStock === 0 ? "text-red-600" : p.stockStatus === "low" || p.stockStatus === "critical" ? "text-amber-600" : "text-primary")}>
                          {p.currentStock}
                        </p>
                        <div className="w-16 h-1 bg-gray-100 rounded-full mt-1">
                          <div
                            className={cn("h-1 rounded-full", pct >= 80 ? "bg-blue-500" : pct >= 40 ? "bg-green-500" : pct >= 20 ? "bg-amber-500" : "bg-red-500")}
                            style={{ width: pct + "%" }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-secondary">{p.reservedStock}</td>
                    <td className="px-4 py-3 text-secondary">{p.availableStock}</td>
                    <td className="px-4 py-3 text-secondary">{p.reorderLevel}</td>
                    <td className="px-4 py-3 text-secondary">{p.targetStock}</td>
                    <td className="px-4 py-3 text-secondary">R {stockValue.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3"><Badge variant={cfg.variant}>{cfg.label}</Badge></td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm">Adjust</Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
