"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  ArrowLeftRight,
  Plus,
  Truck,
  CheckCircle2,
  Warehouse,
  MapPin,
  Clock,
  Printer,
  FileText,
  Search,
  Building2,
  Trash2,
} from "lucide-react";
import {
  StockTransfer,
  StoreLocation,
  STORE_LOCATIONS,
  DEMO_TRANSFERS,
  TransferLineItem,
  TransferStatus,
} from "@/data/demo-transfers";
import { DEMO_PRODUCTS } from "@/data/demo-products";

const STATUS_CONFIG: Record<
  TransferStatus,
  { label: string; variant: "default" | "success" | "warning" | "danger" | "muted" | "info" }
> = {
  draft: { label: "Draft", variant: "muted" },
  in_transit: { label: "In Transit", variant: "warning" },
  received: { label: "Received / GRV", variant: "success" },
  cancelled: { label: "Cancelled", variant: "danger" },
};

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<StockTransfer[]>(DEMO_TRANSFERS);
  const [locations] = useState<StoreLocation[]>(STORE_LOCATIONS);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"transfers" | "locations">("transfers");

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isWaybillOpen, setIsWaybillOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<StockTransfer | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Transfer Form State
  const [fromLocId, setFromLocId] = useState("loc-jhb-main");
  const [toLocId, setToLocId] = useState("loc-sandton");
  const [carrier, setCarrier] = useState("Courier Guy Direct");
  const [notes, setNotes] = useState("");
  const [transferLines, setTransferLines] = useState<TransferLineItem[]>([
    { sku: "DLX-WS-20L", name: "Dulux Weathershield 20L", quantity: 15 },
    { sku: "PLS-VG-5L", name: "Plascon Velvaglo 5L", quantity: 20 },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    fetch("/api/v1/transfers")
      .then((r) => r.json())
      .then((data) => {
        if (data.transfers) {
          setTransfers(data.transfers);
        }
      })
      .catch(() => {});
  }, []);

  const handleAddLine = () => {
    setTransferLines((prev) => [
      ...prev,
      { sku: "CRN-TM-20L", name: "Crown Trade Matt 20L", quantity: 10 },
    ]);
  };

  const handleRemoveLine = (idx: number) => {
    setTransferLines((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleLineChange = (
    idx: number,
    field: keyof TransferLineItem,
    value: string | number
  ) => {
    setTransferLines((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        if (field === "sku") {
          const matched = DEMO_PRODUCTS.find((p) => p.sku === value);
          return {
            ...item,
            sku: String(value),
            name: matched ? matched.name : item.name,
          };
        }
        return { ...item, [field]: value };
      })
    );
  };

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fromLocId === toLocId) {
      showToast("Source and Destination locations must be different.");
      return;
    }

    const fromLoc = locations.find((l) => l.id === fromLocId);
    const toLoc = locations.find((l) => l.id === toLocId);

    const payload = {
      fromLocationId: fromLocId,
      fromLocationName: fromLoc?.name || "Main Warehouse",
      toLocationId: toLocId,
      toLocationName: toLoc?.name || "Retail Store",
      status: "in_transit",
      items: transferLines,
      carrier,
      notes,
    };

    try {
      const res = await fetch("/api/v1/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.transfer) {
        setTransfers((prev) => [data.transfer, ...prev]);
        setIsAddOpen(false);
        showToast(`Dispatched Stock Transfer ${data.transfer.transferNumber}`);
      }
    } catch {
      showToast("Error creating transfer");
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: TransferStatus) => {
    try {
      const res = await fetch("/api/v1/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_status", id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success && data.transfer) {
        setTransfers((prev) =>
          prev.map((t) => (t.id === id ? data.transfer : t))
        );
        showToast(
          newStatus === "received"
            ? "Stock Transfer received and added to branch inventory (GRV Verified)"
            : `Transfer status updated to ${newStatus}`
        );
      }
    } catch {
      showToast("Failed to update transfer status");
    }
  };

  const filteredTransfers = transfers.filter((t) => {
    const q = search.toLowerCase();
    const matchesSearch =
      t.transferNumber.toLowerCase().includes(q) ||
      t.fromLocationName.toLowerCase().includes(q) ||
      t.toLocationName.toLowerCase().includes(q) ||
      t.trackingNumber.toLowerCase().includes(q);
    const matchesFilter = filter === "all" || t.status === filter;
    return matchesSearch && matchesFilter;
  });

  const inTransitCount = transfers.filter((t) => t.status === "in_transit").length;
  const receivedCount = transfers.filter((t) => t.status === "received").length;
  const totalUnitsInTransit = transfers
    .filter((t) => t.status === "in_transit")
    .reduce((sum, t) => sum + t.items.reduce((s, i) => s + i.quantity, 0), 0);

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
          <h1 className="page-header__title">Stock Transfers</h1>
          <p className="page-header__sub">
            Inter-branch replenishment, warehouse dispatches, and in-transit tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setIsAddOpen(true)} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus size={14} />
            Dispatch Transfer
          </Button>
        </div>
      </header>

      {/* Summary KPI Stats */}
      <dl className="summary-stats">
        <div className="summary-stats__item">
          <dt>Total Transfers</dt>
          <dd>{transfers.length}</dd>
        </div>
        <div className="summary-stats__item">
          <dt>In Transit</dt>
          <dd className={inTransitCount > 0 ? "text-amber-400 font-bold" : ""}>
            {inTransitCount}
          </dd>
        </div>
        <div className="summary-stats__item">
          <dt>Completed (GRV)</dt>
          <dd className="text-emerald-400 font-semibold">{receivedCount} Received</dd>
        </div>
        <div className="summary-stats__item">
          <dt>Branches / Hubs</dt>
          <dd>{locations.length} Locations</dd>
        </div>
      </dl>

      {/* View Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-4">
        <button
          onClick={() => setActiveTab("transfers")}
          className={[
            "px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors",
            activeTab === "transfers"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
              : "text-white/60 hover:text-white hover:bg-white/5",
          ].join(" ")}
        >
          <ArrowLeftRight size={14} />
          Transfer Shipments ({transfers.length})
        </button>
        <button
          onClick={() => setActiveTab("locations")}
          className={[
            "px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors",
            activeTab === "locations"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
              : "text-white/60 hover:text-white hover:bg-white/5",
          ].join(" ")}
        >
          <Warehouse size={14} />
          Branches & Warehouses ({locations.length})
        </button>
      </div>

      {activeTab === "transfers" ? (
        <>
          {/* Filters & Search */}
          <div className="page-filters">
            <div className="filter-search-wrap">
              <Search size={14} className="filter-search-icon" />
              <input
                type="search"
                placeholder="Search by Transfer #, source, destination, tracking..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="filter-search"
              />
            </div>
            <div className="filter-tabs" role="tablist">
              {["all", "in_transit", "received", "draft", "cancelled"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  role="tab"
                  aria-selected={filter === f}
                  className={[
                    "filter-tab",
                    filter === f ? "filter-tab--active" : "",
                  ]
                    .join(" ")
                    .trim()}
                >
                  {f === "all"
                    ? "All Transfers"
                    : f === "in_transit"
                    ? "In Transit"
                    : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Transfers Table */}
          <Card padding="none">
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    {[
                      "Transfer #",
                      "Origin (From)",
                      "Destination (To)",
                      "Items & Qty",
                      "Carrier & Tracking",
                      "Date Dispatched",
                      "Status",
                      "Actions",
                    ].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredTransfers.length === 0 && (
                    <tr>
                      <td colSpan={8} className="empty-state text-center py-8">
                        No stock transfers match your search criteria.
                      </td>
                    </tr>
                  )}
                  {filteredTransfers.map((t) => {
                    const totalQty = t.items.reduce((s, i) => s + i.quantity, 0);
                    return (
                      <tr key={t.id}>
                        <td>
                          <div className="flex flex-col">
                            <span className="font-mono font-bold text-white text-xs">
                              {t.transferNumber}
                            </span>
                            <span className="text-[11px] text-white/50">{t.requestedBy}</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5 text-xs text-white/90">
                            <Building2 size={13} className="text-white/40" />
                            <span>{t.fromLocationName}</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                            <MapPin size={13} />
                            <span>{t.toLocationName}</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex flex-col text-xs">
                            <span className="font-semibold text-white">
                              {totalQty} Units ({t.items.length} lines)
                            </span>
                            <span className="text-[11px] text-white/50 truncate max-w-[180px]">
                              {t.items.map((i) => `${i.quantity}x ${i.sku}`).join(", ")}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="flex flex-col text-xs">
                            <span className="text-white/80">{t.carrier}</span>
                            <span className="font-mono text-[11px] text-cyan-400">
                              {t.trackingNumber}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1 text-xs text-white/70">
                            <Clock size={12} className="text-white/40" />
                            <span>{t.dispatchedAt || t.createdAt}</span>
                          </div>
                        </td>
                        <td>
                          <Badge variant={STATUS_CONFIG[t.status].variant}>
                            {STATUS_CONFIG[t.status].label}
                          </Badge>
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                setSelectedTransfer(t);
                                setIsWaybillOpen(true);
                              }}
                              className="text-xs gap-1 px-2"
                              title="View Waybill & Packing Slip"
                            >
                              <FileText size={12} />
                              Waybill
                            </Button>

                            {t.status === "draft" && (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleUpdateStatus(t.id, "in_transit")}
                                className="text-xs text-amber-400 hover:text-amber-300 gap-1 px-2"
                              >
                                <Truck size={12} />
                                Dispatch
                              </Button>
                            )}

                            {t.status === "in_transit" && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateStatus(t.id, "received")}
                                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1 px-2"
                              >
                                <CheckCircle2 size={12} />
                                Receive (GRV)
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : (
        /* Locations Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {locations.map((loc) => (
            <div
              key={loc.id}
              className="bg-[#11161d] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">{loc.name}</h3>
                  <code className="text-[11px] text-cyan-400 font-mono">{loc.code}</code>
                </div>
                <Badge
                  variant={
                    loc.type === "warehouse"
                      ? "info"
                      : loc.type === "retail_store"
                      ? "success"
                      : "muted"
                  }
                >
                  {loc.type === "warehouse"
                    ? "Central DC"
                    : loc.type === "retail_store"
                    ? "Retail Store"
                    : "Depot"}
                </Badge>
              </div>
              <div className="space-y-1 text-xs text-white/60">
                <div className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-white/40 shrink-0" />
                  <span className="truncate">{loc.address}</span>
                </div>
                <div className="flex items-center gap-1.5 text-white/40">
                  <span>Region / City:</span>
                  <span className="text-white/80 font-medium">{loc.city}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-medium">● Connected</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setFromLocId("loc-jhb-main");
                    setToLocId(loc.id);
                    setIsAddOpen(true);
                  }}
                  className="text-xs"
                >
                  Send Stock
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dispatch Transfer Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Dispatch Inter-Branch Stock Transfer"
        description="Transfer inventory items between warehouses, hubs, and retail outlets"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateTransfer} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">
                Source Location (From) *
              </label>
              <select
                value={fromLocId}
                onChange={(e) => setFromLocId(e.target.value)}
                className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">
                Destination Location (To) *
              </label>
              <select
                value={toLocId}
                onChange={(e) => setToLocId(e.target.value)}
                className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">
                Logistics Carrier / Vehicle *
              </label>
              <input
                type="text"
                required
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                placeholder="e.g. Courier Guy, Internal Fleet Truck 02"
                className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">
                Transfer Reason / Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Weekend stock replenishment"
                className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Line Items Adder */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Items to Transfer:</span>
              <Button type="button" variant="outline" size="sm" onClick={handleAddLine} className="text-xs gap-1">
                <Plus size={12} /> Add Item
              </Button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {transferLines.map((line, idx) => (
                <div key={idx} className="flex gap-2 items-center bg-white/5 p-2 rounded-lg">
                  <select
                    value={line.sku}
                    onChange={(e) => handleLineChange(idx, "sku", e.target.value)}
                    className="flex-1 bg-[#161c24] border border-white/10 rounded px-2 py-1 text-xs text-white"
                  >
                    {DEMO_PRODUCTS.map((p) => (
                      <option key={p.sku} value={p.sku}>
                        {p.sku} - {p.name}
                      </option>
                    ))}
                  </select>
                  <div className="w-24">
                    <input
                      type="number"
                      min={1}
                      value={line.quantity}
                      onChange={(e) =>
                        handleLineChange(idx, "quantity", parseInt(e.target.value) || 1)
                      }
                      className="w-full bg-[#161c24] border border-white/10 rounded px-2 py-1 text-xs text-white text-right"
                      placeholder="Qty"
                    />
                  </div>
                  {transferLines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveLine(idx)}
                      className="text-rose-400 hover:text-rose-300 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Dispatch Transfer Now
            </Button>
          </div>
        </form>
      </Modal>

      {/* Waybill / Packing Slip Modal */}
      {selectedTransfer && (
        <Modal
          isOpen={isWaybillOpen}
          onClose={() => setIsWaybillOpen(false)}
          title={`Waybill: ${selectedTransfer.transferNumber}`}
          description="Official Inter-Branch Logistics Waybill & Goods Received Document"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="bg-neutral-100 text-neutral-900 p-5 rounded-lg font-mono text-[12px] shadow border border-neutral-300 space-y-3 select-text">
              <div className="border-b border-neutral-400 pb-2 flex justify-between items-start">
                <div>
                  <h2 className="font-bold text-sm">NEXUS STOCK DISPATCH WAYBILL</h2>
                  <p className="text-[11px] text-neutral-600">
                    TRANSFER REF: {selectedTransfer.transferNumber}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 bg-neutral-900 text-white font-bold text-[10px] rounded uppercase">
                    {selectedTransfer.status.replace("_", " ")}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-2 border-b border-neutral-300 text-[11px]">
                <div>
                  <p className="font-bold text-neutral-700">DISPATCH FROM:</p>
                  <p className="font-semibold">{selectedTransfer.fromLocationName}</p>
                </div>
                <div>
                  <p className="font-bold text-neutral-700">DESTINATION (TO):</p>
                  <p className="font-semibold">{selectedTransfer.toLocationName}</p>
                </div>
              </div>

              <div className="py-1 text-[11px] border-b border-neutral-300">
                <p><strong>CARRIER:</strong> {selectedTransfer.carrier}</p>
                <p><strong>WAYBILL / TRACKING #:</strong> {selectedTransfer.trackingNumber}</p>
                <p><strong>DISPATCHED AT:</strong> {selectedTransfer.dispatchedAt || selectedTransfer.createdAt}</p>
                {selectedTransfer.receivedAt && (
                  <p className="text-emerald-700">
                    <strong>GRV RECEIVED AT:</strong> {selectedTransfer.receivedAt}
                  </p>
                )}
              </div>

              <div>
                <p className="font-bold text-[11px] mb-1">DISPATCHED MANIFEST ITEMS:</p>
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="border-b border-neutral-400 text-left">
                      <th className="py-1">SKU</th>
                      <th className="py-1">Description</th>
                      <th className="py-1 text-right">Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTransfer.items.map((item, idx) => (
                      <tr key={idx} className="border-b border-neutral-200">
                        <td className="py-1 font-mono font-bold">{item.sku}</td>
                        <td className="py-1">{item.name}</td>
                        <td className="py-1 text-right font-bold">{item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedTransfer.notes && (
                <div className="text-[11px] text-neutral-600 bg-neutral-200/60 p-2 rounded">
                  <strong>Notes:</strong> {selectedTransfer.notes}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-400 text-[10px]">
                <div>
                  <p className="border-t border-neutral-500 pt-1">Dispatcher Signature</p>
                </div>
                <div>
                  <p className="border-t border-neutral-500 pt-1">Receiver Signature (GRV)</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
              <Button variant="outline" size="sm" onClick={() => setIsWaybillOpen(false)}>
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => window.print()}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Printer size={13} />
                Print Waybill
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
