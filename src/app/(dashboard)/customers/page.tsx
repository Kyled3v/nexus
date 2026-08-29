"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Customer {
  id: string; name: string; email?: string; phone?: string;
  totalSpend: number; transactions: number; lastPurchase: string;
  status: "active" | "inactive" | "vip"; tags: string[];
}

const DEMO_CUSTOMERS: Customer[] = [
  { id: "c-001", name: "Thabo Nkosi",       email: "thabo@example.com",  phone: "+27 82 111 0001", totalSpend: 42500, transactions: 18, lastPurchase: "2024-01-12", status: "vip",      tags: ["contractor","bulk"] },
  { id: "c-002", name: "Sarah van der Berg", email: "sarah@example.com",  phone: "+27 83 111 0002", totalSpend: 18200, transactions: 9,  lastPurchase: "2024-01-10", status: "active",   tags: ["retail"] },
  { id: "c-003", name: "David Mokoena",      email: "david@example.com",  phone: "+27 84 111 0003", totalSpend: 31000, transactions: 14, lastPurchase: "2024-01-08", status: "vip",      tags: ["contractor"] },
  { id: "c-004", name: "Priya Naidoo",       email: "priya@example.com",  phone: "+27 85 111 0004", totalSpend:  4200, transactions: 3,  lastPurchase: "2023-11-20", status: "inactive", tags: ["retail"] },
  { id: "c-005", name: "Johan Pretorius",    email: "johan@example.com",  phone: "+27 86 111 0005", totalSpend: 12800, transactions: 7,  lastPurchase: "2024-01-11", status: "active",   tags: ["trade"] },
  { id: "c-006", name: "Nomsa Dlamini",      email: "nomsa@example.com",  phone: "+27 87 111 0006", totalSpend:  8900, transactions: 5,  lastPurchase: "2024-01-09", status: "active",   tags: ["retail"] },
];

const STATUS_VARIANT = { active: "success" as const, inactive: "muted" as const, vip: "default" as const };

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = DEMO_CUSTOMERS.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || (c.email ?? "").toLowerCase().includes(search.toLowerCase());
    return matchSearch && (filter === "all" || c.status === filter);
  });

  return (
    <div className="page">
      <header className="page-header">
        <div className="page-header__text">
          <h1 className="page-header__title">Customers</h1>
          <p className="page-header__sub">{DEMO_CUSTOMERS.length} customers</p>
        </div>
        <Button size="sm">Add Customer</Button>
      </header>

      <dl className="summary-stats">
        <div className="summary-stats__item"><dt>Total</dt><dd>{DEMO_CUSTOMERS.length}</dd></div>
        <div className="summary-stats__item"><dt>Active</dt><dd>{DEMO_CUSTOMERS.filter(c => c.status === "active").length}</dd></div>
        <div className="summary-stats__item"><dt>VIP</dt><dd>{DEMO_CUSTOMERS.filter(c => c.status === "vip").length}</dd></div>
        <div className="summary-stats__item"><dt>Inactive</dt><dd>{DEMO_CUSTOMERS.filter(c => c.status === "inactive").length}</dd></div>
      </dl>

      <div className="page-filters">
        <input type="search" placeholder="Search name, email, phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="filter-search" />
        <div className="filter-tabs" role="tablist">
          {["all","active","vip","inactive"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} role="tab" aria-selected={filter === f} className={["filter-tab", filter === f ? "filter-tab--active" : ""].join(" ").trim()}>
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <Card padding="none">
        <table>
          <thead>
            <tr>{["Customer","Contact","Transactions","Total Spend","Last Purchase","Status",""].map((h) => <th key={h} scope="col">{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={7} className="empty-state">No customers found</td></tr>}
            {filtered.map((c) => (
              <tr key={c.id} data-status={c.status}>
                <td>
                  <strong>{c.name}</strong>
                  {c.tags.map(t => <span key={t} className="tag">{t}</span>)}
                </td>
                <td><span>{c.email}</span><small>{c.phone}</small></td>
                <td>{c.transactions}</td>
                <td>R {c.totalSpend.toLocaleString("en-ZA")}</td>
                <td>{c.lastPurchase}</td>
                <td><Badge variant={STATUS_VARIANT[c.status]}>{c.status}</Badge></td>
                <td><Button variant="ghost" size="sm">View</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
