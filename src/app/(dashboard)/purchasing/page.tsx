"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Plus, CheckCircle2, ShoppingCart, Truck, Check, Eye, Trash2, Building2 } from "lucide-react";

type POStatus = "draft" | "pending" | "approved" | "sent" | "partial" | "received" | "cancelled";

interface POLineItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unitCost: number;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  status: POStatus;
  items: number;
  total: number;
  createdAt: string;
  expectedAt: string;
  notes?: string;
  lines?: POLineItem[];
}

const INITIAL_POS: PurchaseOrder[] = [
  {
    id: "po-001",
    poNumber: "PO-0001",
    supplier: "Dulux SA",
    status: "approved",
    items: 5,
    total: 28500,
    createdAt: "2024-01-10",
    expectedAt: "2024-01-17",
    lines: [
      { id: "1", name: "Dulux Weathershield 20L", sku: "DLX-WS-20L", quantity: 20, unitCost: 850 },
      { id: "2", name: "Dulux Eggshell 5L", sku: "DLX-ES-5L", quantity: 30, unitCost: 383 },
    ]
  },
  {
    id: "po-002",
    poNumber: "PO-0002",
    supplier: "Plascon SA",
    status: "sent",
    items: 3,
    total: 14200,
    createdAt: "2024-01-11",
    expectedAt: "2024-01-18",
    lines: [
      { id: "1", name: "Plascon Velvaglo 5L", sku: "PLS-VG-5L", quantity: 25, unitCost: 380 },
      { id: "2", name: "Plascon Exterior 5L", sku: "PLS-EXT-5L", quantity: 15, unitCost: 313 },
    ]
  },
  {
    id: "po-003",
    poNumber: "PO-0003",
    supplier: "Crown Paints SA",
    status: "partial",
    items: 4,
    total: 19600,
    createdAt: "2024-01-08",
    expectedAt: "2024-01-15",
    notes: "2 of 4 lines received"
  },
  {
    id: "po-004",
    poNumber: "PO-0004",
    supplier: "Rust-Oleum SA",
    status: "pending",
    items: 2,
    total: 6500,
    createdAt: "2024-01-12",
    expectedAt: "2024-01-19"
  },
  {
    id: "po-005",
    poNumber: "PO-0005",
    supplier: "Dulux SA",
    status: "received",
    items: 6,
    total: 32100,
    createdAt: "2024-01-03",
    expectedAt: "2024-01-10"
  },
  {
    id: "po-006",
    poNumber: "PO-0006",
    supplier: "Plascon SA",
    status: "draft",
    items: 2,
    total: 8800,
    createdAt: "2024-01-13",
    expectedAt: "2024-01-20"
  },
];

const STATUS_VARIANT: Record<POStatus, "default"|"success"|"warning"|"danger"|"muted"|"info"> = {
  draft: "muted",
  pending: "warning",
  approved: "info",
  sent: "default",
  partial: "warning",
  received: "success",
  cancelled: "danger",
};

export default function PurchasingPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>(INITIAL_POS);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New PO Form
  const [newSupplier, setNewSupplier] = useState("Dulux SA");
  const [expectedDate, setExpectedDate] = useState("2026-09-10");
  const [poNotes, setPoNotes] = useState("");
  const [poLines, setPoLines] = useState<POLineItem[]>([
    { id: "1", name: "Dulux Weathershield 20L", sku: "DLX-WS-20L", quantity: 15, unitCost: 850 },
    { id: "2", name: "Plascon Velvaglo 5L", sku: "PLS-VG-5L", quantity: 20, unitCost: 380 },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const sup = params.get("supplier");
      if (sup) {
        setTimeout(() => {
          setNewSupplier(sup);
          setIsAddOpen(true);
        }, 50);
      }
    }
  }, []);

  const handleAddLine = () => {
    setPoLines(prev => [
      ...prev,
      { id: String(Date.now()), name: "Crown Trade Matt 20L", sku: "CRN-TM-20L", quantity: 10, unitCost: 520 },
    ]);
  };

  const handleRemoveLine = (id: string) => {
    setPoLines(prev => prev.filter(l => l.id !== id));
  };

  const handleLineChange = (id: string, field: keyof POLineItem, val: string | number) => {
    setPoLines(prev => prev.map(l => (l.id === id ? { ...l, [field]: val } : l)));
  };

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    const total = poLines.reduce((acc, l) => acc + l.quantity * l.unitCost, 0);
    const newPo: PurchaseOrder = {
      id: "po-" + Date.now(),
      poNumber: `PO-000${orders.length + 1}`,
      supplier: newSupplier,
      status: "pending",
      items: poLines.length,
      total,
      createdAt: new Date().toISOString().split("T")[0],
      expectedAt: expectedDate,
      notes: poNotes,
      lines: poLines,
    };

    setOrders(prev => [newPo, ...prev]);
    setIsAddOpen(false);
    showToast(`Created purchase order ${newPo.poNumber} (R ${total.toLocaleString("en-ZA")})`);
  };

  const updatePOStatus = (id: string, newStatus: POStatus) => {
    setOrders(prev => prev.map(po => {
      if (po.id === id) {
        return { ...po, status: newStatus };
      }
      return po;
    }));
    showToast(`Order updated to status: ${newStatus}`);
  };

  const filtered = orders.filter((po) => {
    const matchSearch =
      po.poNumber.toLowerCase().includes(search.toLowerCase()) ||
      po.supplier.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (filter === "all" || po.status === filter);
  });

  const openValue = orders
    .filter(p => p.status !== "cancelled" && p.status !== "received")
    .reduce((s, p) => s + p.total, 0);

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
          <h1 className="page-header__title">Purchasing</h1>
          <p className="page-header__sub">Purchase orders, supplier bills, and replenishment</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/suppliers">
            <Button variant="secondary" size="sm" className="gap-1.5">
              <Building2 size={14} />Manage Suppliers
            </Button>
          </Link>
          <Button size="sm" onClick={() => setIsAddOpen(true)}>
            <Plus size={14} />New Purchase Order
          </Button>
        </div>
      </header>

      <dl className="summary-stats">
        <div className="summary-stats__item"><dt>Total Orders</dt><dd>{orders.length}</dd></div>
        <div className="summary-stats__item"><dt>Awaiting Approval</dt><dd>{orders.filter(p => p.status === "pending" || p.status === "approved").length}</dd></div>
        <div className="summary-stats__item"><dt>In Transit</dt><dd>{orders.filter(p => p.status === "sent" || p.status === "partial").length}</dd></div>
        <div className="summary-stats__item"><dt>Open Value</dt><dd>R {openValue.toLocaleString("en-ZA")}</dd></div>
      </dl>

      <div className="page-filters">
        <input
          type="search"
          placeholder="Search PO number or supplier..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="filter-search"
        />
        <div className="filter-tabs" role="tablist">
          {["all","draft","pending","approved","sent","partial","received","cancelled"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              role="tab"
              aria-selected={filter === f}
              className={["filter-tab", filter === f ? "filter-tab--active" : ""].join(" ").trim()}
            >
              {f === "all" ? "All Orders" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                {["PO Number","Supplier","Items","Total Amount","Created","Expected","Status","Actions"].map((h) => (
                  <th key={h} scope="col">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="empty-state">
                    <div className="flex flex-col items-center justify-center py-8">
                      <ShoppingCart size={32} className="text-white/30 mb-2" />
                      <p className="font-medium text-white/70">No purchase orders found</p>
                    </div>
                  </td>
                </tr>
              )}
              {filtered.map((po) => (
                <tr key={po.id} data-status={po.status}>
                  <td>
                    <code className="text-xs px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-cyan-400">
                      {po.poNumber}
                    </code>
                  </td>
                  <td><strong className="text-white font-medium">{po.supplier}</strong></td>
                  <td>{po.items} lines</td>
                  <td><strong>R {po.total.toLocaleString("en-ZA")}</strong></td>
                  <td>{po.createdAt}</td>
                  <td>{po.expectedAt}</td>
                  <td><Badge variant={STATUS_VARIANT[po.status]}>{po.status}</Badge></td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedPO(po);
                          setIsViewOpen(true);
                        }}
                      >
                        <Eye size={12} className="mr-1" />View
                      </Button>
                      {po.status === "pending" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => updatePOStatus(po.id, "approved")}
                        >
                          <Check size={12} className="mr-1" />Approve
                        </Button>
                      )}
                      {po.status === "approved" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => updatePOStatus(po.id, "sent")}
                        >
                          <Truck size={12} className="mr-1" />Send
                        </Button>
                      )}
                      {po.status === "sent" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => updatePOStatus(po.id, "received")}
                        >
                          Receive GRV
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* New Purchase Order Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Create Purchase Order"
        description="Draft a supplier order for stock replenishment"
        maxWidth="lg"
      >
        <form onSubmit={handleCreatePO} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Supplier *</label>
              <select
                value={newSupplier}
                onChange={e => setNewSupplier(e.target.value)}
                className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="Dulux Paints South Africa">Dulux Paints South Africa</option>
                <option value="Plascon Paints & Coatings">Plascon Paints & Coatings</option>
                <option value="Hamilton's Brushware & Rollers">Hamilton&apos;s Brushware & Rollers</option>
                <option value="Powafix Chemicals & Solvents">Powafix Chemicals & Solvents</option>
                <option value="Bostik Adhesives SA">Bostik Adhesives SA</option>
                <option value="Crown Paints SA">Crown Paints SA</option>
                <option value="Rust-Oleum SA">Rust-Oleum SA</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Expected Delivery Date *</label>
              <input
                type="date"
                required
                value={expectedDate}
                onChange={e => setExpectedDate(e.target.value)}
                className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-white/70">Order Line Items</label>
              <button
                type="button"
                onClick={handleAddLine}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
              >
                <Plus size={12} />Add Item Line
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {poLines.map((line) => (
                <div key={line.id} className="grid grid-cols-12 gap-2 items-center bg-white/5 p-2 rounded-lg text-xs">
                  <div className="col-span-5">
                    <input
                      type="text"
                      value={line.name}
                      onChange={e => handleLineChange(line.id, "name", e.target.value)}
                      placeholder="Product Name"
                      className="w-full bg-transparent border-0 text-white font-medium focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      min="1"
                      value={line.quantity}
                      onChange={e => handleLineChange(line.id, "quantity", parseInt(e.target.value) || 1)}
                      placeholder="Qty"
                      className="w-full bg-white/10 px-2 py-1 rounded text-center text-white focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      step="0.01"
                      value={line.unitCost}
                      onChange={e => handleLineChange(line.id, "unitCost", parseFloat(e.target.value) || 0)}
                      placeholder="Cost"
                      className="w-full bg-white/10 px-2 py-1 rounded text-right text-white focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2 text-right font-mono text-emerald-400 font-semibold">
                    R {(line.quantity * line.unitCost).toLocaleString("en-ZA")}
                  </div>
                  <div className="col-span-1 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveLine(line.id)}
                      className="text-white/30 hover:text-rose-400"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 text-sm font-semibold text-white">
              <span>Total Estimated: R {poLines.reduce((acc, l) => acc + l.quantity * l.unitCost, 0).toLocaleString("en-ZA")}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">Notes / Instructions</label>
            <input
              type="text"
              value={poNotes}
              onChange={e => setPoNotes(e.target.value)}
              placeholder="Delivery notes, order reference..."
              className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
            <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit">Submit Purchase Order</Button>
          </div>
        </form>
      </Modal>

      {/* View PO Detail Modal */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title={selectedPO?.poNumber || "Purchase Order"}
        description={`Supplier: ${selectedPO?.supplier}`}
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-3 gap-2 bg-white/5 p-3 rounded-lg">
            <div>
              <span className="text-white/40 block">Status</span>
              <Badge variant={STATUS_VARIANT[selectedPO?.status || "draft"]}>{selectedPO?.status}</Badge>
            </div>
            <div>
              <span className="text-white/40 block">Created Date</span>
              <span className="text-white font-medium">{selectedPO?.createdAt}</span>
            </div>
            <div>
              <span className="text-white/40 block">Expected Arrival</span>
              <span className="text-white font-medium">{selectedPO?.expectedAt}</span>
            </div>
          </div>

          {selectedPO?.lines && (
            <div>
              <span className="font-semibold text-white block mb-2">Order Line Items</span>
              <div className="space-y-1">
                {selectedPO.lines.map(l => (
                  <div key={l.id} className="flex justify-between py-1.5 border-b border-white/5">
                    <span>{l.name} ({l.quantity} units @ R {l.unitCost})</span>
                    <strong className="text-white font-mono">R {(l.quantity * l.unitCost).toLocaleString("en-ZA")}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-2 text-sm font-bold text-white border-t border-white/10">
            <span>Total Value</span>
            <span className="text-emerald-400">R {selectedPO?.total.toLocaleString("en-ZA")}</span>
          </div>

          <div className="flex justify-end pt-3">
            <Button variant="ghost" onClick={() => setIsViewOpen(false)}>Close</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
