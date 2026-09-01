"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Search, Plus, Package, Edit2, Trash2, CheckCircle2, Upload } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { ImportModal } from "@/components/migration/ImportModal";

interface DbProduct {
  id:           string;
  sku:          string;
  barcode?:     string | null;
  name:         string;
  costPrice:    string | number;
  sellingPrice: string | number;
  taxRate:      string | number;
  taxInclusive?:boolean;
  reorderLevel: number;
  targetStock:  number;
  minStock?:    number;
  maxStock?:    number;
  status:       string;
  imageUrl?:    string | null;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState("all");

  // Modal State
  const [isAddOpen,    setIsAddOpen]    = useState(false);
  const [isEditOpen,   setIsEditOpen]   = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingProd,  setEditingProd]  = useState<DbProduct | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form fields
  const [formData, setFormData] = useState({
    sku: "",
    barcode: "",
    name: "",
    costPrice: "0.00",
    sellingPrice: "0.00",
    taxRate: "15",
    reorderLevel: "10",
    targetStock: "50",
    minStock: "5",
    maxStock: "100",
    status: "active",
    initialStock: "25",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    let ignore = false;
    fetch("/api/v1/products?pageSize=100")
      .then(r => r.json())
      .then((data: { data?: DbProduct[] }) => {
        if (!ignore && data.data) {
          setProducts(data.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const openAddModal = () => {
    setFormData({
      sku: "SKU-" + Math.floor(1000 + Math.random() * 9000),
      barcode: "",
      name: "",
      costPrice: "100.00",
      sellingPrice: "150.00",
      taxRate: "15",
      reorderLevel: "10",
      targetStock: "50",
      minStock: "5",
      maxStock: "100",
      status: "active",
      initialStock: "25",
    });
    setIsAddOpen(true);
  };

  const openEditModal = (prod: DbProduct) => {
    setEditingProd(prod);
    setFormData({
      sku: prod.sku,
      barcode: prod.barcode ?? "",
      name: prod.name,
      costPrice: String(prod.costPrice),
      sellingPrice: String(prod.sellingPrice),
      taxRate: String(prod.taxRate),
      reorderLevel: String(prod.reorderLevel),
      targetStock: String(prod.targetStock),
      minStock: String(prod.minStock ?? 5),
      maxStock: String(prod.maxStock ?? 100),
      status: prod.status,
      initialStock: "0",
    });
    setIsEditOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const res = await fetch("/api/v1/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          costPrice: parseFloat(formData.costPrice) || 0,
          sellingPrice: parseFloat(formData.sellingPrice) || 0,
          taxRate: parseFloat(formData.taxRate) || 15,
          reorderLevel: parseInt(formData.reorderLevel) || 10,
          targetStock: parseInt(formData.targetStock) || 50,
          initialStock: parseInt(formData.initialStock) || 0,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setProducts(prev => [data.data, ...prev]);
        setIsAddOpen(false);
        showToast("Product added successfully!");
      }
    } catch {
      showToast("Error creating product");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProd) return;
    setFormSubmitting(true);
    try {
      const res = await fetch("/api/v1/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingProd.id,
          ...formData,
          costPrice: parseFloat(formData.costPrice) || 0,
          sellingPrice: parseFloat(formData.sellingPrice) || 0,
          taxRate: parseFloat(formData.taxRate) || 15,
          reorderLevel: parseInt(formData.reorderLevel) || 10,
          targetStock: parseInt(formData.targetStock) || 50,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setProducts(prev => prev.map(p => (p.id === editingProd.id ? { ...p, ...data.data } : p)));
        setIsEditOpen(false);
        showToast("Product updated successfully!");
      }
    } catch {
      showToast("Error updating product");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await fetch(`/api/v1/products?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      setProducts(prev => prev.filter(p => p.id !== id));
      showToast(`Deleted ${name}`);
    } catch {
      showToast("Failed to delete product");
    }
  };

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode ?? "").includes(search);
    return matchSearch && (filter === "all" || filter === p.status);
  });

  return (
    <div className="page">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#1a2332] border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-lg shadow-xl animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 size={16} />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      <header className="page-header">
        <div className="page-header__text">
          <h1 className="page-header__title">Products</h1>
          <p className="page-header__sub">
            {loading ? "Loading..." : `${products.length} products in catalogue`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsImportOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Upload size={14} /> Import Products (CSV/Sage)
          </Button>
          <Button size="sm" onClick={openAddModal}><Plus size={14} />Add Product</Button>
        </div>
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
                {["Product","SKU","Cost","Price","Tax Rate","Reorder","Target","Status",""].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={9} className="empty-state">Loading products...</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="empty-state">
                    <div className="flex flex-col items-center justify-center py-8">
                      <Package size={32} className="text-white/30 mb-2" />
                      <p className="font-medium text-white/70">No products found</p>
                      <p className="text-xs text-white/40 mb-4">Add your first product to get started</p>
                      <Button size="sm" onClick={openAddModal}><Plus size={14} />Add Product</Button>
                    </div>
                  </td>
                </tr>
              )}
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong className="block text-white font-medium">{p.name}</strong>
                    {p.barcode && <small className="text-xs text-white/40">{p.barcode}</small>}
                  </td>
                  <td><code className="text-xs px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono">{p.sku}</code></td>
                  <td>R {Number(p.costPrice).toFixed(2)}</td>
                  <td><strong>R {Number(p.sellingPrice).toFixed(2)}</strong></td>
                  <td>{Number(p.taxRate).toFixed(0)}%</td>
                  <td>{p.reorderLevel}</td>
                  <td>{p.targetStock}</td>
                  <td>
                    <Badge variant={p.status === "active" ? "success" : "muted"}>
                      {p.status}
                    </Badge>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEditModal(p)}>
                        <Edit2 size={13} className="mr-1" />Edit
                      </Button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="text-white/40 hover:text-rose-400 p-1.5 rounded transition-colors"
                        title="Delete product"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Product Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add New Product"
        description="Create a product in your inventory catalogue"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Product Name *</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Plascon Micatex 20L"
                className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">SKU Code *</label>
              <input
                required
                type="text"
                value={formData.sku}
                onChange={e => setFormData(p => ({ ...p, sku: e.target.value }))}
                placeholder="e.g. SKU-1049"
                className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Cost Price (R)</label>
              <input
                type="number"
                step="0.01"
                value={formData.costPrice}
                onChange={e => setFormData(p => ({ ...p, costPrice: e.target.value }))}
                className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Selling Price (R) *</label>
              <input
                required
                type="number"
                step="0.01"
                value={formData.sellingPrice}
                onChange={e => setFormData(p => ({ ...p, sellingPrice: e.target.value }))}
                className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none font-semibold text-emerald-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Tax Rate (%)</label>
              <input
                type="number"
                value={formData.taxRate}
                onChange={e => setFormData(p => ({ ...p, taxRate: e.target.value }))}
                className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Barcode</label>
              <input
                type="text"
                value={formData.barcode}
                onChange={e => setFormData(p => ({ ...p, barcode: e.target.value }))}
                placeholder="600123456789"
                className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Reorder Level</label>
              <input
                type="number"
                value={formData.reorderLevel}
                onChange={e => setFormData(p => ({ ...p, reorderLevel: e.target.value }))}
                className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Initial Stock Units</label>
              <input
                type="number"
                value={formData.initialStock}
                onChange={e => setFormData(p => ({ ...p, initialStock: e.target.value }))}
                className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
            <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={formSubmitting}>
              {formSubmitting ? "Creating..." : "Create Product"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Product"
        description={`Modify details for ${editingProd?.name}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Product Name *</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">SKU Code *</label>
              <input
                required
                type="text"
                value={formData.sku}
                onChange={e => setFormData(p => ({ ...p, sku: e.target.value }))}
                className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Cost Price (R)</label>
              <input
                type="number"
                step="0.01"
                value={formData.costPrice}
                onChange={e => setFormData(p => ({ ...p, costPrice: e.target.value }))}
                className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Selling Price (R) *</label>
              <input
                required
                type="number"
                step="0.01"
                value={formData.sellingPrice}
                onChange={e => setFormData(p => ({ ...p, sellingPrice: e.target.value }))}
                className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none font-semibold text-emerald-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData(p => ({ ...p, status: e.target.value }))}
                className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Barcode</label>
              <input
                type="text"
                value={formData.barcode}
                onChange={e => setFormData(p => ({ ...p, barcode: e.target.value }))}
                className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Reorder Level</label>
              <input
                type="number"
                value={formData.reorderLevel}
                onChange={e => setFormData(p => ({ ...p, reorderLevel: e.target.value }))}
                className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Target Stock</label>
              <input
                type="number"
                value={formData.targetStock}
                onChange={e => setFormData(p => ({ ...p, targetStock: e.target.value }))}
                className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
            <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={formSubmitting}>
              {formSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>

      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        defaultEntity="products"
        onSuccess={() => {
          fetch("/api/v1/products")
            .then(r => r.json())
            .then((res: { data?: DbProduct[] }) => {
              if (res.data) setProducts(res.data);
            })
            .catch(() => {});
          showToast("Imported products successfully loaded!");
        }}
      />
    </div>
  );
}
