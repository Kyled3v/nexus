"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Search, Plus, UserPlus, Phone, Mail, CheckCircle2, Upload } from "lucide-react";
import { ImportModal } from "@/components/migration/ImportModal";

interface Customer {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  vatNumber?: string | null;
  taxNumber?: string | null;
  creditLimit?: string | number | null;
  paymentTerms?: number | null;
  totalSpend?: string;
  transactionCount?: number;
  lastPurchaseAt?: string | null;
  status: string;
  tags?: string[];
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

  // Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    taxNumber: "",
    creditLimit: "10000",
    tags: "contractor, regular",
    notes: "",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    let ignore = false;
    fetch("/api/v1/customers")
      .then(r => r.json())
      .then((result: { data?: Customer[] }) => {
        if (!ignore && result.data) setCustomers(result.data);
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
      name: "",
      email: "",
      phone: "",
      taxNumber: "",
      creditLimit: "25000",
      tags: "retail",
      notes: "",
    });
    setIsAddOpen(true);
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email.trim() ? formData.email.trim() : undefined,
        phone: formData.phone.trim() ? formData.phone.trim() : undefined,
        taxNumber: formData.taxNumber.trim() ? formData.taxNumber.trim() : undefined,
        creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : undefined,
        tags: formData.tags ? formData.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        notes: formData.notes.trim() ? formData.notes.trim() : undefined,
      };

      const res = await fetch("/api/v1/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const newCust = await res.json();
        setCustomers(prev => [newCust, ...prev]);
        setIsAddOpen(false);
        showToast(`Customer ${newCust.name} added successfully!`);
      } else {
        showToast("Could not create customer");
      }
    } catch {
      showToast("Error creating customer");
    } finally {
      setSubmitting(false);
    }
  };

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
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#1a2332] border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-lg shadow-xl animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 size={16} />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      <header className="page-header">
        <div className="page-header__text">
          <h1 className="page-header__title">Customers</h1>
          <p className="page-header__sub">
            {loading ? "Loading..." : `${customers.length} business & trade accounts`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsImportOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Upload size={14} /> Import from Sage / Excel
          </Button>
          <Button size="sm" onClick={openAddModal}><Plus size={14} />Add Customer</Button>
        </div>
      </header>

      <dl className="summary-stats">
        <div className="summary-stats__item"><dt>Total</dt><dd>{customers.length}</dd></div>
        <div className="summary-stats__item"><dt>Active</dt><dd>{active}</dd></div>
        <div className="summary-stats__item"><dt>VIP / Key</dt><dd>{vip}</dd></div>
        <div className="summary-stats__item"><dt>Inactive</dt><dd>{inactive}</dd></div>
      </dl>

      <div className="page-filters">
        <div className="filter-search-wrap">
          <Search size={14} className="filter-search-icon" />
          <input
            type="search"
            placeholder="Search name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="filter-search"
          />
        </div>
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
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                {["Customer","Contact Details","Credit Limit","Terms","Status","Action"].map((h) => (
                  <th key={h} scope="col">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} className="empty-state">Loading accounts...</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-state">
                    <div className="flex flex-col items-center justify-center py-8">
                      <UserPlus size={32} className="text-white/30 mb-2" />
                      <p className="font-medium text-white/70">No customers found</p>
                      <p className="text-xs text-white/40 mb-4">Create your first client account</p>
                      <Button size="sm" onClick={openAddModal}><Plus size={14} />Add Customer</Button>
                    </div>
                  </td>
                </tr>
              )}
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong className="block text-white font-medium">{c.name}</strong>
                    {(c.vatNumber || c.taxNumber) && (
                      <small className="text-xs text-white/40">VAT: {c.vatNumber || c.taxNumber}</small>
                    )}
                  </td>
                  <td>
                    <div className="text-xs space-y-0.5">
                      {c.email && (
                        <div className="flex items-center gap-1 text-white/70">
                          <Mail size={12} className="text-white/40" />
                          <span>{c.email}</span>
                        </div>
                      )}
                      {c.phone && (
                        <div className="flex items-center gap-1 text-white/70">
                          <Phone size={12} className="text-white/40" />
                          <span>{c.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="font-mono text-xs">
                      {c.creditLimit ? `R ${Number(c.creditLimit).toLocaleString("en-ZA")}` : "Cash Only"}
                    </span>
                  </td>
                  <td>{c.paymentTerms ? `${c.paymentTerms} days` : "COD"}</td>
                  <td>
                    <Badge variant={STATUS_VARIANT[c.status] ?? "success"}>
                      {c.status}
                    </Badge>
                  </td>
                  <td>
                    <Button variant="ghost" size="sm" onClick={() => showToast(`Opening statements for ${c.name}`)}>
                      Statement
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Customer Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Customer Account"
        description="Register a trade or cash client"
      >
        <form onSubmit={handleAddCustomer} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">Company / Customer Name *</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Apex Decor Pty Ltd"
              className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                placeholder="accounts@apexdecor.co.za"
                className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                placeholder="+27 11 555 0101"
                className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Tax / VAT Number</label>
              <input
                type="text"
                value={formData.taxNumber}
                onChange={e => setFormData(p => ({ ...p, taxNumber: e.target.value }))}
                placeholder="4990123456"
                className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Credit Limit (R)</label>
              <input
                type="number"
                value={formData.creditLimit}
                onChange={e => setFormData(p => ({ ...p, creditLimit: e.target.value }))}
                placeholder="25000"
                className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">Tags (comma separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={e => setFormData(p => ({ ...p, tags: e.target.value }))}
              placeholder="contractor, vip, wholesale"
              className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">Notes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
              placeholder="Account terms, delivery instructions..."
              className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
            <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Adding..." : "Add Customer"}
            </Button>
          </div>
        </form>
      </Modal>

      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        defaultEntity="customers"
        onSuccess={() => {
          // Re-fetch customers
          fetch("/api/v1/customers")
            .then(r => r.json())
            .then((result: { data?: Customer[] }) => {
              if (result.data) setCustomers(result.data);
            })
            .catch(() => {});
          showToast("Imported customers successfully loaded!");
        }}
      />
    </div>
  );
}
