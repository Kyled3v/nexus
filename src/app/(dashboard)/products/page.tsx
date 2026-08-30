"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Plus, Package } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface DbProduct {
  id:           string;
  sku:          string;
  barcode?:     string | null;
  name:         string;
  costPrice:    string;
  sellingPrice: string;
  taxRate:      string;
  reorderLevel: number;
  targetStock:  number;
  status:       string;
  imageUrl?:    string | null;
}

type StockStatus = "ok" | "low" | "critical" | "out" | "overstock";

function getStockStatus(current: number, reorder: number, target: number): StockStatus {
  if (current <= 0)             return "out";
  if (current <= reorder * 0.5) return "critical";
  if (current <= reorder)       return "low";
  if (target > 0 && current > target * 1.5) return "overstock";
  return "ok";
}

const STATUS_BADGE: Record<StockStatus, { label: string; variant: "success"|"warning"|"danger"|"muted" }> = {
  ok:        { label: "In Stock",     variant: "success" },
  low:       { label: "Low Stock",    variant: "warning" },
  critical:  { label: "Critical",     variant: "danger"  },
  out:       { label: "Out of Stock", variant: "danger"  },
  overstock: { label: "Overstock",    variant: "muted"   },
};

export default function ProductsPage() {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState("all");

  useEffect(() => {
    fetch("/api/v1/products?pageSize=100")
      .then(r => r.json())
      .then((data: { data?: DbProduct[] }) => {
        if (data.data) setProducts(data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode ?? "").includes(search);
    return matchSearch && (filter === "all" || filter === p.status);
  });

  return (
    <div className="page">
      <header className="page-header">
        <div className="page-header__text">
          <h1 className="page-header__title">Products</h1>
          <p className="page-header__sub">
            {loading ? "Loading..." : `${products.length} products in catalogue`}
          </p>
        </div>
        <Button size="sm"><Plus size={14} />Add Product</Button>
      </header>

      <div className="page-filters">
        <div className="filter-search-wrap">
          <Search size={14} className="filter-search-icon" />
          <input
            type="search"
            placeholder="Search products, SKU, barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="filter-search"
          />
        </div>
        <div className="filter-tabs">
          {["all","active","inactive"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn("filter-tab", filter === f ? "filter-tab--active" : "")}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                {["Product","SKU","Cost","Price","Tax Rate","Reorder","Target",""].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={8} className="empty-state">Loading products...</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={8} className="empty-state"><Package size={24} /><br />No products found. Add your first product to get started.</td></tr>
              )}
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.name}</strong>
                    {p.barcode && <small>{p.barcode}</small>}
                  </td>
                  <td><code>{p.sku}</code></td>
                  <td>R {Number(p.costPrice).toFixed(2)}</td>
                  <td>R {Number(p.sellingPrice).toFixed(2)}</td>
                  <td>{Number(p.taxRate).toFixed(0)}%</td>
                  <td>{p.reorderLevel}</td>
                  <td>{p.targetStock}</td>
                  <td><Button variant="ghost" size="sm">Edit</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
