"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Plus, Truck, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type POStatus = "draft" | "pending" | "approved" | "sent" | "partial" | "received" | "cancelled";

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
}

const DEMO_POS: PurchaseOrder[] = [
  { id: "po-001", poNumber: "PO-0001", supplier: "Dulux SA",         status: "approved",  items: 5, total: 28500, createdAt: "2024-01-10", expectedAt: "2024-01-17", notes: "Monthly restock" },
  { id: "po-002", poNumber: "PO-0002", supplier: "Plascon SA",       status: "sent",      items: 3, total: 14200, createdAt: "2024-01-11", expectedAt: "2024-01-18" },
  { id: "po-003", poNumber: "PO-0003", supplier: "Crown Paints SA",  status: "partial",   items: 4, total: 19600, createdAt: "2024-01-08", expectedAt: "2024-01-15", notes: "2 of 4 lines received" },
  { id: "po-004", poNumber: "PO-0004", supplier: "Rust-Oleum SA",    status: "pending",   items: 2, total:  6500, createdAt: "2024-01-12", expectedAt: "2024-01-19" },
  { id: "po-005", poNumber: "PO-0005", supplier: "Dulux SA",         status: "received",  items: 6, total: 32100, createdAt: "2024-01-03", expectedAt: "2024-01-10" },
  { id: "po-006", poNumber: "PO-0006", supplier: "Plascon SA",       status: "draft",     items: 2, total:  8800, createdAt: "2024-01-13", expectedAt: "2024-01-20" },
];

const STATUS_CONFIG: Record<POStatus, { label: string; variant: "default" | "success" | "warning" | "danger" | "muted" | "info"; icon: React.ReactNode }> = {
  draft:     { label: "Draft",      variant: "muted",    icon: null },
  pending:   { label: "Pending",    variant: "warning",  icon: <Clock size={12} /> },
  approved:  { label: "Approved",   variant: "info",     icon: <CheckCircle size={12} /> },
  sent:      { label: "Sent",       variant: "default",  icon: <Truck size={12} /> },
  partial:   { label: "Partial",    variant: "warning",  icon: <AlertTriangle size={12} /> },
  received:  { label: "Received",   variant: "success",  icon: <CheckCircle size={12} /> },
  cancelled: { label: "Cancelled",  variant: "danger",   icon: null },
};

export default function PurchasingPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = DEMO_POS.filter((po) => {
    const matchSearch = po.poNumber.toLowerCase().includes(search.toLowerCase()) || po.supplier.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || po.status === filter;
    return matchSearch && matchFilter;
  });

  const summary = {
    total: DEMO_POS.length,
    pending: DEMO_POS.filter(p => p.status === "pending" || p.status === "approved").length,
    inTransit: DEMO_POS.filter(p => p.status === "sent" || p.status === "partial").length,
    totalValue: DEMO_POS.filter(p => p.status !== "cancelled" && p.status !== "received").reduce((s, p) => s + p.total, 0),
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-primary">Purchasing</h1>
          <p className="text-sm text-secondary mt-0.5">Purchase orders and supplier orders</p>
        </div>
        <Button size="sm"><Plus size={14} />New Purchase Order</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="sm">
          <p className="text-xs text-muted uppercase tracking-wider">Total Orders</p>
          <p className="text-2xl font-bold text-primary mt-1">{summary.total}</p>
        </Card>
        <Card padding="sm">
          <p className="text-xs text-muted uppercase tracking-wider">Awaiting Approval</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{summary.pending}</p>
        </Card>
        <Card padding="sm">
          <p className="text-xs text-muted uppercase tracking-wider">In Transit</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{summary.inTransit}</p>
        </Card>
        <Card padding="sm">
          <p className="text-xs text-muted uppercase tracking-wider">Open Value</p>
          <p className="text-2xl font-bold text-primary mt-1">R {summary.totalValue.toLocaleString("en-ZA")}</p>
        </Card>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search PO number or supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm bg-card border border-base rounded-lg text-primary placeholder:text-muted focus:outline-none w-64"
          />
        </div>
        {["all", "draft", "pending", "approved", "sent", "partial", "received"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors capitalize",
              filter === f ? "bg-[var(--accent)] text-white border-transparent" : "bg-card text-secondary border-base hover:text-primary"
            )}
          >
            {f === "all" ? "All Orders" : STATUS_CONFIG[f as POStatus]?.label ?? f}
          </button>
        ))}
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-base">
                {["PO Number", "Supplier", "Items", "Total", "Created", "Expected", "Status", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <Truck size={32} className="mx-auto text-muted mb-2" />
                    <p className="text-sm text-muted">No purchase orders found</p>
                  </td>
                </tr>
              )}
              {filtered.map((po) => {
                const cfg = STATUS_CONFIG[po.status];
                return (
                  <tr key={po.id} className="hover:bg-page transition-colors border-b border-base last:border-0">
                    <td className="px-4 py-3 font-mono text-sm font-semibold text-primary">{po.poNumber}</td>
                    <td className="px-4 py-3 text-primary">{po.supplier}</td>
                    <td className="px-4 py-3 text-secondary">{po.items} lines</td>
                    <td className="px-4 py-3 font-semibold text-primary">R {po.total.toLocaleString("en-ZA")}</td>
                    <td className="px-4 py-3 text-secondary">{po.createdAt}</td>
                    <td className="px-4 py-3 text-secondary">{po.expectedAt}</td>
                    <td className="px-4 py-3">
                      <Badge variant={cfg.variant}>
                        <span className="flex items-center gap-1">{cfg.icon}{cfg.label}</span>
                      </Badge>
                    </td>
                    <td className="px-4 py-3 flex gap-1">
                      <Button variant="ghost" size="sm">View</Button>
                      {po.status === "pending" && <Button variant="secondary" size="sm">Approve</Button>}
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
