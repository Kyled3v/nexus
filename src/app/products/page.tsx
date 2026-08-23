"use client";
import { useState } from "react";
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
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const filtered = DEMO_PRODUCTS.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()) || (p.barcode ?? "").includes(search);
    const matchFilter = filter === "all" || p.stockStatus === filter;
    return matchSearch && matchFilter;
  });
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-primary">Products</h1>
          <p className="text-sm text-secondary mt-0.5">{DEMO_PRODUCTS.length} products in catalogue</p>
        </div>
        <Button size="sm"><Plus size={14} />Add Product</Button>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input type="text" placeholder="Search products, SKU, barcode..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 pr-4 py-2 text-sm bg-card border border-base rounded-lg text-primary placeholder:text-muted focus:outline-none w-72" />
        </div>
        {["all","ok","low","critical","out","overstock"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cn("px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors", filter === f ? "bg-[var(--accent)] text-white border-transparent" : "bg-card text-secondary border-base hover:text-primary")}>
            {f === "all" ? "All Products" : f === "out" ? "Out of Stock" : f === "overstock" ? "Overstock" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-base">{["Product","SKU","Category","Brand","Cost","Price","Stock","Status",""].map((h) => (<th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider whitespace-nowrap">{h}</th>))}</tr></thead>
            <tbody>
              {filtered.length === 0 && (<tr><td colSpan={9} className="px-4 py-12 text-center"><Package size={32} className="mx-auto text-muted mb-2" /><p className="text-sm text-muted">No products found</p></td></tr>)}
              {filtered.map((p: ProductWithStock) => {
                const s = STATUS_BADGE[p.stockStatus] ?? STATUS_BADGE.ok;
                return (
                  <tr key={p.id} className="hover:bg-page transition-colors border-b border-base last:border-0">
                    <td className="px-4 py-3"><p className="font-medium text-primary">{p.name}</p>{p.barcode && <p className="text-xs text-muted">{p.barcode}</p>}</td>
                    <td className="px-4 py-3 font-mono text-xs text-secondary">{p.sku}</td>
                    <td className="px-4 py-3 text-secondary">{p.categoryName ?? "—"}</td>
                    <td className="px-4 py-3 text-secondary">{p.brandName ?? "—"}</td>
                    <td className="px-4 py-3 text-secondary">R {p.costPrice.toFixed(2)}</td>
                    <td className="px-4 py-3 font-medium text-primary">R {p.sellingPrice.toFixed(2)}</td>
                    <td className="px-4 py-3"><span className={cn("font-semibold", p.currentStock === 0 ? "text-red-600" : p.stockStatus === "critical" ? "text-red-500" : p.stockStatus === "low" ? "text-amber-600" : p.stockStatus === "overstock" ? "text-blue-600" : "text-primary")}>{p.currentStock}</span><span className="text-muted text-xs"> / {p.targetStock}</span></td>
                    <td className="px-4 py-3"><Badge variant={s.variant}>{s.label}</Badge></td>
                    <td className="px-4 py-3"><Button variant="ghost" size="sm">Edit</Button></td>
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