"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type POStatus = "draft" | "pending" | "approved" | "sent" | "partial" | "received" | "cancelled";

interface PurchaseOrder {
  id: string; poNumber: string; supplier: string; status: POStatus;
  items: number; total: number; createdAt: string; expectedAt: string; notes?: string;
}

const DEMO_POS: PurchaseOrder[] = [
  { id: "po-001", poNumber: "PO-0001", supplier: "Dulux SA",        status: "approved",  items: 5, total: 28500, createdAt: "2024-01-10", expectedAt: "2024-01-17" },
  { id: "po-002", poNumber: "PO-0002", supplier: "Plascon SA",      status: "sent",      items: 3, total: 14200, createdAt: "2024-01-11", expectedAt: "2024-01-18" },
  { id: "po-003", poNumber: "PO-0003", supplier: "Crown Paints SA", status: "partial",   items: 4, total: 19600, createdAt: "2024-01-08", expectedAt: "2024-01-15", notes: "2 of 4 lines received" },
  { id: "po-004", poNumber: "PO-0004", supplier: "Rust-Oleum SA",   status: "pending",   items: 2, total:  6500, createdAt: "2024-01-12", expectedAt: "2024-01-19" },
  { id: "po-005", poNumber: "PO-0005", supplier: "Dulux SA",        status: "received",  items: 6, total: 32100, createdAt: "2024-01-03", expectedAt: "2024-01-10" },
  { id: "po-006", poNumber: "PO-0006", supplier: "Plascon SA",      status: "draft",     items: 2, total:  8800, createdAt: "2024-01-13", expectedAt: "2024-01-20" },
];

const STATUS_VARIANT: Record<POStatus, "default"|"success"|"warning"|"danger"|"muted"|"info"> = {
  draft: "muted", pending: "warning", approved: "info", sent: "default", partial: "warning", received: "success", cancelled: "danger",
};

export default function PurchasingPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = DEMO_POS.filter((po) => {
    const matchSearch = po.poNumber.toLowerCase().includes(search.toLowerCase()) || po.supplier.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (filter === "all" || po.status === filter);
  });

  const openValue = DEMO_POS.filter(p => p.status !== "cancelled" && p.status !== "received").reduce((s, p) => s + p.total, 0);

  return (
    <div className="page">
      <header className="page-header">
        <div className="page-header__text">
          <h1 className="page-header__title">Purchasing</h1>
          <p className="page-header__sub">Purchase orders and supplier orders</p>
        </div>
        <Button size="sm">New Purchase Order</Button>
      </header>

      <dl className="summary-stats">
        <div className="summary-stats__item"><dt>Total Orders</dt><dd>{DEMO_POS.length}</dd></div>
        <div className="summary-stats__item"><dt>Awaiting Approval</dt><dd>{DEMO_POS.filter(p => p.status === "pending" || p.status === "approved").length}</dd></div>
        <div className="summary-stats__item"><dt>In Transit</dt><dd>{DEMO_POS.filter(p => p.status === "sent" || p.status === "partial").length}</dd></div>
        <div className="summary-stats__item"><dt>Open Value</dt><dd>R {openValue.toLocaleString("en-ZA")}</dd></div>
      </dl>

      <div className="page-filters">
        <input type="search" placeholder="Search PO number or supplier..." value={search} onChange={(e) => setSearch(e.target.value)} className="filter-search" />
        <div className="filter-tabs" role="tablist">
          {["all","draft","pending","approved","sent","partial","received"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} role="tab" aria-selected={filter === f} className={["filter-tab", filter === f ? "filter-tab--active" : ""].join(" ").trim()}>
              {f === "all" ? "All Orders" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <Card padding="none">
        <table>
          <thead>
            <tr>{["PO Number","Supplier","Items","Total","Created","Expected","Status",""].map((h) => <th key={h} scope="col">{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={8} className="empty-state">No purchase orders found</td></tr>}
            {filtered.map((po) => (
              <tr key={po.id} data-status={po.status}>
                <td><code>{po.poNumber}</code></td>
                <td>{po.supplier}</td>
                <td>{po.items} lines</td>
                <td>R {po.total.toLocaleString("en-ZA")}</td>
                <td>{po.createdAt}</td>
                <td>{po.expectedAt}</td>
                <td><Badge variant={STATUS_VARIANT[po.status]}>{po.status}</Badge></td>
                <td>
                  <Button variant="ghost" size="sm">View</Button>
                  {po.status === "pending" && <Button variant="secondary" size="sm">Approve</Button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
