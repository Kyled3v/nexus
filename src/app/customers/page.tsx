"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Plus, Users } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  totalSpend: number;
  transactions: number;
  lastPurchase: string;
  status: "active" | "inactive" | "vip";
  tags: string[];
}

const DEMO_CUSTOMERS: Customer[] = [
  { id: "cust-001", name: "Thabo Nkosi",        email: "thabo@example.com",   phone: "+27 82 111 0001", totalSpend: 42500, transactions: 18, lastPurchase: "2024-01-12", status: "vip",      tags: ["contractor", "bulk"] },
  { id: "cust-002", name: "Sarah van der Berg",  email: "sarah@example.com",   phone: "+27 83 111 0002", totalSpend: 18200, transactions: 9,  lastPurchase: "2024-01-10", status: "active",   tags: ["retail"] },
  { id: "cust-003", name: "David Mokoena",       email: "david@example.com",   phone: "+27 84 111 0003", totalSpend: 31000, transactions: 14, lastPurchase: "2024-01-08", status: "vip",      tags: ["contractor"] },
  { id: "cust-004", name: "Priya Naidoo",        email: "priya@example.com",   phone: "+27 85 111 0004", totalSpend:  4200, transactions: 3,  lastPurchase: "2023-11-20", status: "inactive", tags: ["retail"] },
  { id: "cust-005", name: "Johan Pretorius",     email: "johan@example.com",   phone: "+27 86 111 0005", totalSpend: 12800, transactions: 7,  lastPurchase: "2024-01-11", status: "active",   tags: ["trade"] },
  { id: "cust-006", name: "Nomsa Dlamini",       email: "nomsa@example.com",   phone: "+27 87 111 0006", totalSpend:  8900, transactions: 5,  lastPurchase: "2024-01-09", status: "active",   tags: ["retail"] },
];

const STATUS_CONFIG = {
  active:   { label: "Active",   variant: "success" as const },
  inactive: { label: "Inactive", variant: "muted"   as const },
  vip:      { label: "VIP",      variant: "default" as const },
};

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = DEMO_CUSTOMERS.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || (c.email ?? "").toLowerCase().includes(search.toLowerCase()) || (c.phone ?? "").includes(search);
    const matchFilter = filter === "all" || c.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-primary">Customers</h1>
          <p className="text-sm text-secondary mt-0.5">{DEMO_CUSTOMERS.length} customers</p>
        </div>
        <Button size="sm"><Plus size={14} />Add Customer</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Customers", value: DEMO_CUSTOMERS.length,                                         color: "text-primary"   },
          { label: "Active",          value: DEMO_CUSTOMERS.filter(c => c.status === "active").length,      color: "text-green-600" },
          { label: "VIP",             value: DEMO_CUSTOMERS.filter(c => c.status === "vip").length,         color: "text-blue-600"  },
          { label: "Inactive",        value: DEMO_CUSTOMERS.filter(c => c.status === "inactive").length,    color: "text-gray-500"  },
        ].map((s) => (
          <Card key={s.label} padding="sm">
            <p className="text-xs text-muted uppercase tracking-wider">{s.label}</p>
            <p className={cn("text-2xl font-bold mt-1", s.color)}>{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm bg-card border border-base rounded-lg text-primary placeholder:text-muted focus:outline-none w-64"
          />
        </div>
        {["all", "active", "vip", "inactive"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors capitalize",
              filter === f ? "bg-[var(--accent)] text-white border-transparent" : "bg-card text-secondary border-base hover:text-primary"
            )}
          >
            {f === "all" ? "All Customers" : STATUS_CONFIG[f as keyof typeof STATUS_CONFIG]?.label ?? f}
          </button>
        ))}
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-base">
                {["Customer", "Contact", "Transactions", "Total Spend", "Last Purchase", "Status", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Users size={32} className="mx-auto text-muted mb-2" />
                    <p className="text-sm text-muted">No customers found</p>
                  </td>
                </tr>
              )}
              {filtered.map((c) => {
                const cfg = STATUS_CONFIG[c.status];
                return (
                  <tr key={c.id} className="hover:bg-page transition-colors border-b border-base last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-primary">{c.name}</p>
                      <div className="flex gap-1 mt-0.5">
                        {c.tags.map(t => <span key={t} className="text-2xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{t}</span>)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-secondary">{c.email}</p>
                      <p className="text-xs text-muted">{c.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-secondary">{c.transactions}</td>
                    <td className="px-4 py-3 font-semibold text-primary">R {c.totalSpend.toLocaleString("en-ZA")}</td>
                    <td className="px-4 py-3 text-secondary">{c.lastPurchase}</td>
                    <td className="px-4 py-3"><Badge variant={cfg.variant}>{cfg.label}</Badge></td>
                    <td className="px-4 py-3"><Button variant="ghost" size="sm">View</Button></td>
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
