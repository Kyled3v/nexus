"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  Search, Plus, Building2, Phone, Mail, MapPin,
  Truck, Star, CreditCard, Clock, FileText,
  Edit2, Trash2, CheckCircle2, DollarSign
} from "lucide-react";
import { DEMO_SUPPLIERS } from "@/data/demo-suppliers";

interface SupplierItem {
  id: string;
  name: string;
  code: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxNumber?: string;
  paymentTerms?: string;
  leadTimeDays: number;
  rating?: number;
  status: "active" | "inactive";
  notes?: string;
  bankName?: string;
  accountNumber?: string;
  branchCode?: string;
  totalOrdersCount?: number;
  totalSpend?: number;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<SupplierItem[]>(DEMO_SUPPLIERS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    code: "",
    contactName: "",
    email: "",
    phone: "",
    address: "",
    taxNumber: "",
    paymentTerms: "Net 30 Days",
    leadTimeDays: 3,
    rating: 5.0,
    status: "active" as "active" | "inactive",
    bankName: "",
    accountNumber: "",
    branchCode: "",
    notes: "",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    let ignore = false;
    fetch("/api/v1/suppliers")
      .then((r) => r.json())
      .then((res: { data?: SupplierItem[] }) => {
        if (!ignore && res.data && res.data.length > 0) {
          setSuppliers(res.data);
        }
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, []);

  const filtered = suppliers.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.contactName?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const activeCount = suppliers.filter((s) => s.status === "active").length;
  const avgLeadTime =
    suppliers.length > 0
      ? (suppliers.reduce((acc, s) => acc + (s.leadTimeDays || 0), 0) / suppliers.length).toFixed(1)
      : "0";
  const totalProcurement = suppliers.reduce((acc, s) => acc + (s.totalSpend || 0), 0);

  const openAddModal = () => {
    setEditingSupplier(null);
    setForm({
      name: "",
      code: `SUP-${String(suppliers.length + 1).padStart(3, "0")}`,
      contactName: "",
      email: "",
      phone: "",
      address: "",
      taxNumber: "",
      paymentTerms: "Net 30 Days",
      leadTimeDays: 3,
      rating: 5.0,
      status: "active",
      bankName: "",
      accountNumber: "",
      branchCode: "",
      notes: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (s: SupplierItem) => {
    setEditingSupplier(s);
    setForm({
      name: s.name,
      code: s.code,
      contactName: s.contactName || "",
      email: s.email || "",
      phone: s.phone || "",
      address: s.address || "",
      taxNumber: s.taxNumber || "",
      paymentTerms: s.paymentTerms || "Net 30 Days",
      leadTimeDays: s.leadTimeDays || 3,
      rating: s.rating || 5.0,
      status: s.status,
      bankName: s.bankName || "",
      accountNumber: s.accountNumber || "",
      branchCode: s.branchCode || "",
      notes: s.notes || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) return;

    if (editingSupplier) {
      const updated = {
        ...editingSupplier,
        ...form,
        leadTimeDays: Number(form.leadTimeDays),
        rating: Number(form.rating),
      };
      setSuppliers((prev) => prev.map((s) => (s.id === editingSupplier.id ? updated : s)));
      fetch("/api/v1/suppliers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingSupplier.id, ...form }),
      }).catch(() => {});
      showToast(`Supplier "${form.name}" updated successfully.`);
    } else {
      const created: SupplierItem = {
        id: `sup-${Date.now()}`,
        ...form,
        leadTimeDays: Number(form.leadTimeDays),
        rating: Number(form.rating),
        totalOrdersCount: 0,
        totalSpend: 0,
      };
      setSuppliers((prev) => [created, ...prev]);
      fetch("/api/v1/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }).catch(() => {});
      showToast(`Supplier "${form.name}" added to registry.`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove supplier "${name}"?`)) {
      setSuppliers((prev) => prev.filter((s) => s.id !== id));
      fetch(`/api/v1/suppliers?id=${id}`, { method: "DELETE" }).catch(() => {});
      showToast(`Supplier "${name}" deleted.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Suppliers & Vendors</h1>
          <p className="text-sm text-neutral-400">
            Manage vendor profiles, payment terms, contact persons, and purchasing integrations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/purchasing">
            <Button variant="outline" className="gap-2">
              <FileText size={16} />
              View Purchase Orders
            </Button>
          </Link>
          <Button onClick={openAddModal} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus size={16} />
            Add Supplier
          </Button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-neutral-900/60 border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400">Active Suppliers</span>
            <Building2 size={18} className="text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{activeCount}</div>
          <span className="text-xs text-neutral-500">{suppliers.length} total registered vendors</span>
        </Card>

        <Card className="p-4 bg-neutral-900/60 border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400">Avg. Lead Time</span>
            <Clock size={18} className="text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{avgLeadTime} Days</div>
          <span className="text-xs text-neutral-500">Order placement to delivery</span>
        </Card>

        <Card className="p-4 bg-neutral-900/60 border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400">Total Spend (YTD)</span>
            <DollarSign size={18} className="text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">
            R {totalProcurement.toLocaleString("en-ZA")}
          </div>
          <span className="text-xs text-neutral-500">Across all approved purchase orders</span>
        </Card>

        <Card className="p-4 bg-neutral-900/60 border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400">Top Rating</span>
            <Star size={18} className="text-yellow-400 fill-yellow-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">4.8 / 5.0</div>
          <span className="text-xs text-neutral-500">Vendor quality & on-time metric</span>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 bg-neutral-900/60 border-neutral-800 flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="relative w-full md:w-96">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search suppliers by name, code, contact or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-neutral-800/80 border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-neutral-400 whitespace-nowrap">Filter Status:</span>
          {(["all", "active", "inactive"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                statusFilter === st
                  ? "bg-emerald-600 text-white"
                  : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </Card>

      {/* Suppliers Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((s) => (
          <Card key={s.id} className="p-5 bg-neutral-900/60 border-neutral-800 flex flex-col justify-between hover:border-neutral-700 transition-colors">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-bold text-white text-base leading-tight">{s.name}</h3>
                  <span className="text-xs font-mono text-neutral-400">{s.code}</span>
                </div>
                <Badge variant={s.status === "active" ? "default" : "secondary"}>
                  {s.status}
                </Badge>
              </div>

              {s.notes && (
                <p className="text-xs text-neutral-400 mb-4 line-clamp-2 italic">
                  &ldquo;{s.notes}&rdquo;
                </p>
              )}

              <div className="space-y-2 text-xs text-neutral-300 py-3 border-y border-neutral-800">
                {s.contactName && (
                  <div className="flex items-center gap-2">
                    <Building2 size={13} className="text-neutral-400 shrink-0" />
                    <span>Contact: {s.contactName}</span>
                  </div>
                )}
                {s.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={13} className="text-neutral-400 shrink-0" />
                    <span className="truncate">{s.email}</span>
                  </div>
                )}
                {s.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="text-neutral-400 shrink-0" />
                    <span>{s.phone}</span>
                  </div>
                )}
                {s.address && (
                  <div className="flex items-start gap-2">
                    <MapPin size={13} className="text-neutral-400 shrink-0 mt-0.5" />
                    <span className="truncate">{s.address}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 my-3 text-xs">
                <div className="bg-neutral-800/50 p-2 rounded">
                  <span className="text-neutral-500 block">Payment Terms</span>
                  <span className="font-medium text-white">{s.paymentTerms || "Net 30"}</span>
                </div>
                <div className="bg-neutral-800/50 p-2 rounded">
                  <span className="text-neutral-500 block">Lead Time</span>
                  <span className="font-medium text-white">{s.leadTimeDays} Days</span>
                </div>
              </div>

              {s.bankName && (
                <div className="bg-neutral-950/60 p-2.5 rounded border border-neutral-800/60 text-xs space-y-1 mb-3">
                  <div className="flex items-center gap-1.5 text-neutral-400 font-medium">
                    <CreditCard size={12} />
                    <span>{s.bankName}</span>
                  </div>
                  <div className="flex justify-between text-neutral-500 font-mono text-[11px]">
                    <span>Acc: {s.accountNumber}</span>
                    <span>Code: {s.branchCode}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-neutral-800 mt-2">
              <Link href={`/purchasing?supplier=${encodeURIComponent(s.name)}`}>
                <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 border-emerald-800/60 text-emerald-400 hover:bg-emerald-950/50">
                  <Truck size={13} />
                  Create PO
                </Button>
              </Link>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(s)}
                  className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800"
                  title="Edit Supplier"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(s.id, s.name)}
                  className="p-1.5 text-neutral-400 hover:text-red-400 rounded hover:bg-neutral-800"
                  title="Delete Supplier"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSupplier ? "Edit Supplier Profile" : "Register New Supplier"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Company / Supplier Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Dulux Paints SA"
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Supplier Code *</label>
              <input
                type="text"
                required
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="e.g. DULUX-SA"
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white uppercase font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Contact Person</label>
              <input
                type="text"
                value={form.contactName}
                onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                placeholder="e.g. Trevor van der Merwe"
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="orders@supplier.co.za"
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Phone Number</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+27 11 000 0000"
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">VAT / Tax Number</label>
              <input
                type="text"
                value={form.taxNumber}
                onChange={(e) => setForm({ ...form, taxNumber: e.target.value })}
                placeholder="4010101928"
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Payment Terms</label>
              <select
                value={form.paymentTerms}
                onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="COD (Cash On Delivery)">COD</option>
                <option value="Net 7 Days">Net 7 Days</option>
                <option value="Net 15 Days">Net 15 Days</option>
                <option value="Net 30 Days">Net 30 Days</option>
                <option value="Net 60 Days">Net 60 Days</option>
                <option value="Net 90 Days">Net 90 Days</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Lead Time (Days)</label>
              <input
                type="number"
                min="0"
                value={form.leadTimeDays}
                onChange={(e) => setForm({ ...form, leadTimeDays: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "inactive" })}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">Physical Address</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="e.g. 12 Commerce Street, Industrial Park, Johannesburg"
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Banking Details */}
          <div className="p-3 bg-neutral-950/60 rounded-lg border border-neutral-800 space-y-3">
            <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <CreditCard size={14} className="text-emerald-400" />
              Banking & EFT Settlement Details
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <input
                  type="text"
                  placeholder="Bank Name (e.g. Standard Bank)"
                  value={form.bankName}
                  onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                  className="w-full px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded text-xs text-white"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Account Number"
                  value={form.accountNumber}
                  onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                  className="w-full px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded text-xs text-white font-mono"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Branch Code"
                  value={form.branchCode}
                  onChange={(e) => setForm({ ...form, branchCode: e.target.value })}
                  className="w-full px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">Notes & Procurement Agreements</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Preferred packaging, discount agreements, special terms..."
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {editingSupplier ? "Save Changes" : "Register Supplier"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
