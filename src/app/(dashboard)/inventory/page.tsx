"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Search, SlidersHorizontal, ArrowDownRight, ArrowUpRight, CheckCircle2, Layers, Scan } from "lucide-react";
import { DEMO_PRODUCTS } from "@/data/demo-products";
import { BarcodeScannerModal } from "@/components/pos/BarcodeScannerModal";

const STATUS_CONFIG = {
  ok:        { label: "In Stock",    variant: "success" as const },
  low:       { label: "Low Stock",   variant: "warning" as const },
  critical:  { label: "Critical",    variant: "danger"  as const },
  out:       { label: "Out of Stock",variant: "danger"  as const },
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

  // Modal State
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [adjustQty,    setAdjustQty]    = useState("10");
  const [adjustType,   setAdjustType]   = useState<"add" | "subtract" | "stocktake">("add");
  const [adjustReason, setAdjustReason] = useState("Supplier delivery receipt");
  const [submitting,   setSubmitting]   = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const showToast不易 = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleBarcodeScanned = (barcode: string) => {
    const clean = barcode.toLowerCase();
    const found = items.find(
      (i) =>
        i.sku.toLowerCase() === clean ||
        (i.name && i.name.toLowerCase().includes(clean))
    );

    if (found) {
      setSearch(found.sku);
      showToast不易(`Found ${found.name || found.sku} (${found.currentStock} in stock)`);
      openAdjustModal(found);
    } else {
      setSearch(barcode);
      showToast不易(`Filtered search by scanned code: ${barcode}`);
    }
  };

  const fetchInventory = () => {
    fetch("/api/v1/inventory")
      .then(r => r.json())
      .then((data: { inventory?: Record<string, unknown>[]; source?: string }) => {
        if (data.inventory && data.inventory.length > 0) {
          const mapped: InventoryItem[] = data.inventory.map((i) => {
            const current = Number(i.currentStock ?? 0);
            const reorder = Number(i.reorderLevel ?? 10);
            const target  = Number(i.targetStock ?? 50);
            let status: keyof typeof STATUS_CONFIG = "ok";
            if (current <= 0) status = "out";
            else if (current <= reorder * 0.5) status = "critical";
            else if (current <= reorder) status = "low";
            else if (target > 0 && current > target * 1.5) status = "overstock";

            return {
              productId: String(i.productId || ""),
              sku: String(i.sku || i.productSku || "SKU"),
              name: String(i.name || i.productName || "Product"),
              currentStock: current,
              reservedStock: Number(i.reservedStock ?? 0),
              stockStatus: status,
              reorderLevel: reorder,
              targetStock: target,
            };
          });
          setItems(mapped);
          setSource(data.source ?? "live");
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const openAdjustModal = (item: InventoryItem) => {
    setSelectedItem(item);
    setAdjustQty("10");
    setAdjustType("add");
    setAdjustReason("New shipment received");
    setIsAdjustOpen(true);
  };

  const handleAdjustSubmit不易 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setSubmitting(true);

    const qtyNumber = parseInt(adjustQty) || 0;
    let delta = 0;
    if (adjustType === "add") delta = qtyNumber;
    else if (adjustType === "subtract") delta = -qtyNumber;
    else if (adjustType === "stocktake") delta = qtyNumber - selectedItem.currentStock;

    try {
      const res = await fetch("/api/v1/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedItem.productId,
          quantity: delta,
        }),
      });

      if (res.ok) {
        setItems(prev => prev.map(item => {
          if (item.productId === selectedItem.productId) {
            const newStock = Math.max(0, item.currentStock + delta);
            const reorder = item.reorderLevel ?? 10;
            let status: keyof typeof STATUS_CONFIG = "ok";
            if (newStock <= 0) status = "out";
            else if (newStock <= reorder * 0.5) status = "critical";
            else if (newStock <= reorder) status = "low";

            return { ...item, currentStock: newStock, stockStatus: status };
          }
          return item;
        }));

        setIsAdjustOpen(false);
        showToast不易(`Stock adjusted for ${selectedItem.name} (${delta > 0 ? "+" : ""}${delta} units)`);
      }
    } catch {
      showToast不易("Failed to adjust stock");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = items.filter(i => {
    const matchSearch迁移 = (i.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      i.sku.toLowerCase().includes(search.toLowerCase());
    const matchFilter迁移 = filter === "all" || i.stockStatus === filter;
    return matchSearch迁移 && matchFilter迁移;
  });

  const lowCount      = items.filter(i => i.stockStatus === "low" || i.stockStatus === "critical").length;
  const outCount      = items.filter(i => i.stockStatus === "out").length;
  const overstockCount= items.filter(i => i.stockStatus === "overstock").length;

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
          <h1 className="page-header__title">Inventory</h1>
          <p className="page-header__sub">Stock levels, reorder alerts, and movements</p>
        </div>
        <div className="flex items-center gap-2">
          {source === "live" && <Badge variant="success">Live Neon Sync</Badge>}
          <Button size="sm" variant="secondary" onClick={() => setIsScannerOpen(true)} className="gap-1.5">
            <Scan size={14} className="text-emerald-400" />
            Scan Barcode
          </Button>
        </div>
      </header>

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleBarcodeScanned}
        title="Inventory Stock Scanner"
        description="Scan any product barcode to jump directly to stock adjustment & audit"
        sampleProducts={items.map((i) => ({ sku: i.sku, name: i.name || i.sku }))}
      />

      <dl className="summary-stats">
        <div className="summary-stats__item"><dt>Total SKUs</dt><dd>{items.length}</dd></div>
        <div className="summary-stats__item"><dt>Low / Critical</dt><dd className={lowCount > 0 ? "text-amber-400 font-bold" : ""}>{lowCount}</dd></div>
        <div className="summary-stats__item"><dt>Out of Stock</dt><dd className={outCount > 0 ? "text-rose-400 font-bold" : ""}>{outCount}</dd></div>
        <div className="summary-stats__item"><dt>Overstock</dt><dd>{overstockCount}</dd></div>
      </dl>

      <div className="page-filters">
        <div className="filter-search-wrap">
          <Search size={14} className="filter-search-icon" />
          <input
            type="search"
            placeholder="Filter by product name, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="filter-search"
          />
        </div>
        <div className="filter-tabs" role="tablist">
          {["all","low","critical","out","overstock"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              role="tab"
              aria-selected={filter === f}
              className={["filter-tab", filter === f ? "filter-tab--active" : ""].join(" ").trim()}
            >
              {f === "all" ? "All Items" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                {["Product / SKU","Current Stock","Reserved","Available","Reorder Point","Target","Status","Action"].map((h) => (
                  <th key={h} scope="col">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="empty-state">
                    <div className="flex flex-col items-center justify-center py-8">
                      <Layers size={32} className="text-white/30 mb-2" />
                      <p className="font-medium text-white/70">No stock records found</p>
                    </div>
                  </td>
                </tr>
              )}
              {filtered.map((item) => {
                const available = Math.max(0, item.currentStock - item.reservedStock);
                const cfg = STATUS_CONFIG[item.stockStatus] ?? STATUS_CONFIG.ok;
                return (
                  <tr key={item.productId} data-status={item.stockStatus}>
                    <td>
                      <strong className="block text-white font-medium">{item.name}</strong>
                      <code className="text-xs px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-white/60">
                        {item.sku}
                      </code>
                    </td>
                    <td>
                      <strong className="text-sm text-white">{item.currentStock}</strong>
                    </td>
                    <td>{item.reservedStock}</td>
                    <td>
                      <span className="font-semibold text-emerald-400">{available}</span>
                    </td>
                    <td>{item.reorderLevel ?? "—"}</td>
                    <td>{item.targetStock ?? "—"}</td>
                    <td>
                      <Badge variant={cfg.variant}>{cfg.label}</Badge>
                    </td>
                    <td>
                      <Button variant="secondary" size="sm" onClick={() => openAdjustModal(item)}>
                        <SlidersHorizontal size={12} className="mr-1" />Adjust
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Adjust Stock Modal */}
      <Modal
        isOpen={isAdjustOpen}
        onClose={() => setIsAdjustOpen(false)}
        title="Adjust Stock Level"
        description={`Modify stock units for ${selectedItem?.name} (${selectedItem?.sku})`}
      >
        <form onSubmit={handleAdjustSubmit不易} className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex justify-between items-center text-xs">
            <div>
              <span className="text-white/50 block">Current On Hand</span>
              <strong className="text-lg text-white font-mono">{selectedItem?.currentStock} units</strong>
            </div>
            <div>
              <span className="text-white/50 block">Reorder Point</span>
              <strong className="text-sm text-white/80 font-mono">{selectedItem?.reorderLevel} units</strong>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">Adjustment Type</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "add", label: "Receive Stock (+)", icon: ArrowDownRight },
                { id: "subtract", label: "Write-off / Damaged (-)", icon: ArrowUpRight },
                { id: "stocktake", label: "Set Exact Count (=)", icon: SlidersHorizontal },
              ].map(t => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setAdjustType(t.id as "add" | "subtract" | "stocktake")}
                  className={[
                    "p-2.5 rounded-lg border text-xs font-medium flex flex-col items-center gap-1 transition-colors",
                    adjustType === t.id
                      ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                      : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                  ].join(" ")}
                >
                  <t.icon size={14} />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">
              {adjustType === "stocktake" ? "New Total Count *" : "Units to Adjust *"}
            </label>
            <input
              required
              type="number"
              min="1"
              value={adjustQty}
              onChange={e => setAdjustQty(e.target.value)}
              className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">Reason / Reference</label>
            <input
              type="text"
              value={adjustReason}
              onChange={e => setAdjustReason(e.target.value)}
              placeholder="e.g. Stocktake reconciliation, Delivery GRV"
              className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
            <Button type="button" variant="ghost" onClick={() => setIsAdjustOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Applying..." : "Confirm Adjustment"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
