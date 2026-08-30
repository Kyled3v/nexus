"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Customer {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  totalSpend: string;
  transactionCount: number;
  lastPurchaseAt?: string | null;
  status: string;
  tags: string[];
}

const STATUS_VARIANT: Record<string, "success" | "muted" | "default" | "warning" | "danger"> = {
  active:   "success",
  inactive: "muted",
  vip:      "default",
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [filter,    setFilter]    = useState("all");

  useEffect(() => {
    fetch("/api/v1/customers")
      .then(r => r.json())
      .then((result: { data?: Customer[] }) => {
        if (result.data) setCustomers(result.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (c.phone ?? "").toLowerCase().includes(search.toLowerCase());
    return matchSearch && (filter === "all" || c.status === filter);
  });

  const active   = customers.filter(c => c.status === "active").length;
  const inactive = customers.filter(c => c.status === "inactive").length;
  const vip      = customers.filter(c => c.status === "vip").length;

  return (
    <div className="page">
      <header className="page-header">
        <div className="page-header__text">
          <h1 className="page-header__title">Customers</h1>
          <p className="page-header__sub">
            {loading ? "Loading..." : `${customers.length} customers`}
          </p>
        </div>
        <Button size="sm">Add Customer</Button>
      </header>

      <dl className="summary-stats">
        <div className="summary-stats__item"><dt>Total</dt><dd>{customers.length}</dd></div>
        <div className="summary-stats__item"><dt>Active</dt><dd>{active}</dd></div>
        <div className="summary-stats__item"><dt>VIP</dt><dd>{vip}</dd></div>
        <div className="summary-stats__item"><dt>Inactive</dt><dd>{inactive}</dd></div>
      </dl>

      <div className="page-filters">
        <input
          type="search"
          placeholder="Search name, email, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="filter-search"
        />
        <div className="filter-tabs" role="tablist">
          {["all","active","vip","inactive"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              role="tab"
              aria-selected={filter === f}
              className={["filter-tab", filter === f ? "filter-tab--active" : ""].join(" ").trim()}
            >
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <Card padding="none">
        <table>
          <thead>
            <tr>
              {["Customer","Contact","Transactions","Total Spend","Last Purchase","Status",""].map((h) => (
                <th key={h} scope="col">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} className="empty-state">Loading customers...</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={7} className="empty-state">No customers found</td></tr>
            )}
            {filtered.map((c) => (
              <tr key={c.id} data-status={c.status}>
                <td>
                  <strong>{c.name}</strong>
                  {c.tags.map(t => <span key={t} className="tag">{t}</span>)}
                </td>
                <td>
                  <span>{c.email ?? "—"}</span>
                  <small>{c.phone ?? ""}</small>
                </td>
                <td>{c.transactionCount}</td>
                <td>R {Number(c.totalSpend).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</td>
                <td>{c.lastPurchaseAt ? new Date(c.lastPurchaseAt).toLocaleDateString("en-ZA") : "—"}</td>
                <td><Badge variant={STATUS_VARIANT[c.status] ?? "muted"}>{c.status}</Badge></td>
                <td><Button variant="ghost" size="sm">View</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
