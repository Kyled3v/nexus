"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
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

interface InventoryItem {
  productId: string;
  sku: string;
  name?: string;
  currentStock: number;
  reservedStock: number;
  stockStatus: keyof typeof STATUS_CONFIG;
  reorderLevel?: number;
  targetStock?: number;
}

const INITIAL_ITEMS: InventoryItem[] = DEMO_PRODUCTS.map(p => ({
  productId:    p.id,
  sku:          p.sku,
  name:         p.name,
  currentStock: p.currentStock,
  reservedStock:p.reservedStock,
  stockStatus:  p.stockStatus,
  reorderLevel: p.reorderLevel,
  targetStock:  p.targetStock,
}));

export default function InventoryPage() {
  const [items,  setItems]  = useState<InventoryItem[]>(INITIAL_ITEMS);
  const [source, setSource] = useState("demo");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    // Try real data
    fetch("/api/v1/inventory")
      .then(r => r.json())
      .then((data: { inventory?: InventoryItem[]; source?: string }) => {
        if (data.inventory && data.inventory.length > 0) {
          setItems(data.inventory);
          setSource(data.source ?? "live");
        }
      })
      .catch(() => {});
  }, []);

  const filtered = items.filter(i => {
    const matchSearch = (i.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      i.sku.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || i.stockStatus === filter;
    return matchSearch && matchFilter;
  });

  const totalValue = DEMO_PRODUCTS.reduce((s, p) => s + p.currentStock * p.costPrice, 0);

  return (
    <div className="page">
      <header className="page-header">
        <div className="page-header__text">
          <h1 className="page-header__title">Inventory</h1>
          <p className="page-header__sub">
            {items.length} products tracked
            {source === "demo" && <span className="demo-badge"> · Demo data</span>}
          </p>
        </div>
        <div className="page-header__actions">
          <Button variant="secondary" size="sm">Adjust Stock</Button>
          <Button size="sm">Receive Stock</Button>
        </div>
      </header>

      <dl className="summary-stats">
        {[
          { label: "Total SKUs",  value: items.length },
          { label: "OK",          value: items.filter(i => i.stockStatus === "ok").length },
          { label: "Low Stock",   value: items.filter(i => i.stockStatus === "low").length },
          { label: "Critical",    value: items.filter(i => i.stockStatus === "critical").length },
          { label: "Out",         value: items.filter(i => i.stockStatus === "out").length },
          { label: "Overstock",   value: items.filter(i => i.stockStatus === "overstock").length },
          { label: "Stock Value", value: "R " + totalValue.toLocaleString("en-ZA", { minimumFractionDigits: 2 }) },
        ].map((s) => (
          <div key={s.label} className="summary-stats__item">
            <dt>{s.label}</dt>
            <dd>{s.value}</dd>
          </div>
        ))}
      </dl>

      <div className="page-filters">
        <input type="search" placeholder="Search products or SKU..." value={search} onChange={(e) => setSearch(e.target.value)} className="filter-search" />
        <div className="filter-tabs">
          {["all","ok","low","critical","out","overstock"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={["filter-tab", filter === f ? "filter-tab--active" : ""].join(" ").trim()}>
              {f === "all" ? "All" : STATUS_CONFIG[f as keyof typeof STATUS_CONFIG]?.label ?? f}
            </button>
          ))}
        </div>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>{["Product","SKU","Current","Reserved","Reorder","Target","Status",""].map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={8} className="empty-state">No products found</td></tr>}
              {filtered.map((item) => {
                const cfg = STATUS_CONFIG[item.stockStatus] ?? STATUS_CONFIG.ok;
                return (
                  <tr key={item.productId} data-status={item.stockStatus}>
                    <td><strong>{item.name ?? item.productId}</strong></td>
                    <td><code>{item.sku}</code></td>
                    <td><span data-stock-level={item.stockStatus}>{item.currentStock}</span></td>
                    <td>{item.reservedStock}</td>
                    <td>{item.reorderLevel ?? "—"}</td>
                    <td>{item.targetStock ?? "—"}</td>
                    <td><Badge variant={cfg.variant}>{cfg.label}</Badge></td>
                    <td><Button variant="ghost" size="sm">Adjust</Button></td>
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
