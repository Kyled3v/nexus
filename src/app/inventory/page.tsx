"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DEMO_PRODUCTS } from "@/data/demo-products";

const STATUS_CONFIG = {
  ok:        { label: "OK",          variant: "success" as const },
  low:       { label: "Low Stock",   variant: "warning" as const },
  critical:  { label: "Critical",    variant: "danger"  as const },
  out:       { label: "Out",         variant: "danger"  as const },
  overstock: { label: "Overstock",   variant: "muted"   as const },
};

export default function InventoryPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = DEMO_PRODUCTS.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || p.stockStatus === filter;
    return matchSearch && matchFilter;
  });

  const totalValue = DEMO_PRODUCTS.reduce((sum, p) => sum + p.currentStock * p.costPrice, 0);

  return (
    <div className="page">
      <header className="page-header">
        <div className="page-header__text">
          <h1 className="page-header__title">Inventory</h1>
          <p className="page-header__sub">Stock levels across all locations</p>
        </div>
        <div className="page-header__actions">
          <Button variant="secondary" size="sm">Transfer Stock</Button>
          <Button variant="secondary" size="sm">Adjust Stock</Button>
          <Button size="sm">Receive Stock</Button>
        </div>
      </header>

      <dl className="summary-stats">
        {[
          { label: "Total SKUs",  value: DEMO_PRODUCTS.length },
          { label: "OK",          value: DEMO_PRODUCTS.filter(p => p.stockStatus === "ok").length },
          { label: "Low Stock",   value: DEMO_PRODUCTS.filter(p => p.stockStatus === "low").length },
          { label: "Critical",    value: DEMO_PRODUCTS.filter(p => p.stockStatus === "critical").length },
          { label: "Out",         value: DEMO_PRODUCTS.filter(p => p.stockStatus === "out").length },
          { label: "Overstock",   value: DEMO_PRODUCTS.filter(p => p.stockStatus === "overstock").length },
          { label: "Total Value", value: "R " + totalValue.toLocaleString("en-ZA", { minimumFractionDigits: 2 }) },
        ].map((s) => (
          <div key={s.label} className="summary-stats__item">
            <dt>{s.label}</dt>
            <dd>{s.value}</dd>
          </div>
        ))}
      </dl>

      <div className="page-filters">
        <input type="search" placeholder="Search products or SKU..." value={search} onChange={(e) => setSearch(e.target.value)} className="filter-search" aria-label="Search inventory" />
        <div className="filter-tabs" role="tablist">
          {["all","ok","low","critical","out","overstock"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} role="tab" aria-selected={filter === f} className={["filter-tab", filter === f ? "filter-tab--active" : ""].join(" ").trim()}>
              {f === "all" ? "All" : STATUS_CONFIG[f as keyof typeof STATUS_CONFIG]?.label ?? f}
            </button>
          ))}
        </div>
      </div>

      <Card padding="none">
        <table>
          <thead>
            <tr>{["Product","SKU","Current","Reserved","Available","Reorder","Target","Value","Status",""].map((h) => <th key={h} scope="col">{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={10} className="empty-state">No products found</td></tr>}
            {filtered.map((p) => {
              const cfg = STATUS_CONFIG[p.stockStatus];
              const stockValue = p.currentStock * p.costPrice;
              const pct = p.targetStock > 0 ? Math.min(100, Math.round((p.currentStock / p.targetStock) * 100)) : 0;
              return (
                <tr key={p.id} data-status={p.stockStatus}>
                  <td>
                    <strong>{p.name}</strong>
                    <small>{p.categoryName}</small>
                  </td>
                  <td><code>{p.sku}</code></td>
                  <td>
                    <span data-stock-level={p.stockStatus}>{p.currentStock}</span>
                    <progress value={pct} max={100} aria-label={pct + "% of target stock"} />
                  </td>
                  <td>{p.reservedStock}</td>
                  <td>{p.availableStock}</td>
                  <td>{p.reorderLevel}</td>
                  <td>{p.targetStock}</td>
                  <td>R {stockValue.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</td>
                  <td><Badge variant={cfg.variant}>{cfg.label}</Badge></td>
                  <td><Button variant="ghost" size="sm">Adjust</Button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
