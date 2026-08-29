"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DEMO_PRODUCTS } from "@/data/demo-products";
import type { ProductWithStock } from "@/domain/products/types";
import { Search, Plus, Package } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const STATUS_BADGE = {
  ok:        { label: "In Stock",     variant: "success" as const },
  low:       { label: "Low Stock",    variant: "warning" as const },
  critical:  { label: "Critical",     variant: "danger"  as const },
  out:       { label: "Out of Stock", variant: "danger"  as const },
  overstock: { label: "Overstock",    variant: "muted"   as const },
};

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductWithStock[]>(DEMO_PRODUCTS);
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState("all");
  const [source,   setSource]   = useState("demo");

  useEffect(() => {
    fetch("/api/v1/products")
      .then(r => r.json())
      .then((data: { data?: ProductWithStock[]; source?: string }) => {
        if (data.data && data.data.length > 0) {
          setProducts(data.data);
          setSource(data.source ?? "live");
        }
      })
      .catch(() => {});
  }, []);

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode ?? "").includes(search);
    const matchFilter = filter === "all" || p.stockStatus === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="page">
      <header className="page-header">
        <div className="page-header__text">
          <h1 className="page-header__title">Products</h1>
          <p className="page-header__sub">
            {products.length} products in catalogue
            {source === "demo" && <span className="demo-badge"> · Demo data</span>}
          </p>
        </div>
        <Button size="sm"><Plus size={14} />Add Product</Button>
      </header>

      <div className="page-filters">
        <div className="filter-search-wrap">
          <Search size={14} className="filter-search-icon" />
          <input type="search" placeholder="Search products, SKU, barcode..." value={search} onChange={(e) => setSearch(e.target.value)} className="filter-search" />
        </div>
        <div className="filter-tabs">
          {["all","ok","low","critical","out","overstock"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={cn("filter-tab", filter === f ? "filter-tab--active" : "")}>
              {f === "all" ? "All" : STATUS_BADGE[f as keyof typeof STATUS_BADGE]?.label ?? f}
            </button>
          ))}
        </div>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                {["Product","SKU","Category","Brand","Cost","Price","Stock","Status",""].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="empty-state"><Package size={24} /><br />No products found</td></tr>
              )}
              {filtered.map((p) => {
                const s = STATUS_BADGE[p.stockStatus] ?? STATUS_BADGE.ok;
                return (
                  <tr key={p.id}>
                    <td><strong>{p.name}</strong>{p.barcode && <small>{p.barcode}</small>}</td>
                    <td><code>{p.sku}</code></td>
                    <td>{p.categoryName ?? "—"}</td>
                    <td>{p.brandName ?? "—"}</td>
                    <td>R {p.costPrice.toFixed(2)}</td>
                    <td>R {p.sellingPrice.toFixed(2)}</td>
                    <td><span data-stock-level={p.stockStatus}>{p.currentStock}</span> <small>/ {p.targetStock}</small></td>
                    <td><Badge variant={s.variant}>{s.label}</Badge></td>
                    <td><Button variant="ghost" size="sm">Edit</Button></td>
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
