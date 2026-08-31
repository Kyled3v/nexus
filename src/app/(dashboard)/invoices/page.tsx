"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  Plus,
  CheckCircle2,
  Printer,
  CreditCard,
  Search,
  Trash2,
  Eye,
} from "lucide-react";
import {
  Invoice,
  InvoiceLineItem,
  InvoiceStatus,
  InvoiceType,
  DEMO_INVOICES,
} from "@/data/demo-invoices";

const STATUS_CONFIG: Record<
  InvoiceStatus,
  { label: string; variant: "default" | "success" | "warning" | "danger" | "muted" | "info" }
> = {
  draft: { label: "Draft", variant: "muted" },
  unpaid: { label: "Unpaid", variant: "warning" },
  partially_paid: { label: "Partially Paid", variant: "info" },
  paid: { label: "Paid in Full", variant: "success" },
  overdue: { label: "Overdue", variant: "danger" },
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(DEMO_INVOICES);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "receivable" | "payable">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Invoice Form
  const [newType, setNewType] = useState<InvoiceType>("receivable");
  const [entityName, setEntityName] = useState("");
  const [entityEmail, setEntityEmail] = useState("");
  const [entityPhone, setEntityPhone] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("Net 30 Days");
  const [dueDate, setDueDate] = useState("2026-09-30");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<InvoiceLineItem[]>([
    { description: "Dulux Weathershield 20L", quantity: 10, unitPrice: 1100, taxRate: 15 },
    { description: "Plascon Velvaglo 5L", quantity: 15, unitPrice: 480, taxRate: 15 },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    fetch("/api/v1/invoices")
      .then((r) => r.json())
      .then((data) => {
        if (data.invoices) {
          setInvoices(data.invoices);
        }
      })
      .catch(() => {});
  }, []);

  const handleAddLine = () => {
    setItems((prev) => [
      ...prev,
      { description: "Hamilton's Professional Roller Set", quantity: 5, unitPrice: 220, taxRate: 15 },
    ]);
  };

  const handleRemoveLine = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleLineChange = (
    idx: number,
    field: keyof InvoiceLineItem,
    value: string | number
  ) => {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entityName.trim()) {
      showToast("Please enter customer or supplier name.");
      return;
    }

    const payload = {
      type: newType,
      entityName,
      entityEmail,
      entityPhone,
      dueDate,
      paymentTerms,
      notes,
      items,
    };

    try {
      const res = await fetch("/api/v1/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.invoice) {
        setInvoices((prev) => [data.invoice, ...prev]);
        setIsAddOpen(false);
        showToast(
          `Created ${newType === "receivable" ? "Tax Invoice" : "Supplier Bill"} ${data.invoice.invoiceNumber}`
        );
      }
    } catch {
      showToast("Failed to create invoice");
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    const amountNum = parseFloat(paymentAmount);
    if (!amountNum || amountNum <= 0) {
      showToast("Please enter a valid payment amount.");
      return;
    }

    try {
      const res = await fetch("/api/v1/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "record_payment",
          id: selectedInvoice.id,
          amount: amountNum,
        }),
      });
      const data = await res.json();
      if (data.success && data.invoice) {
        setInvoices((prev) =>
          prev.map((i) => (i.id === selectedInvoice.id ? data.invoice : i))
        );
        setIsPayOpen(false);
        showToast(
          `Recorded payment of R ${amountNum.toLocaleString("en-ZA")} against ${data.invoice.invoiceNumber}`
        );
      }
    } catch {
      showToast("Error recording payment");
    }
  };

  // Calculations
  const totalReceivable = invoices
    .filter((i) => i.type === "receivable")
    .reduce((s, i) => s + i.balanceDue, 0);

  const totalPayable = invoices
    .filter((i) => i.type === "payable")
    .reduce((s, i) => s + i.balanceDue, 0);

  const totalOverdue = invoices
    .filter((i) => i.status === "overdue")
    .reduce((s, i) => s + i.balanceDue, 0);

  const totalCollected = invoices
    .filter((i) => i.type === "receivable")
    .reduce((s, i) => s + i.amountPaid, 0);

  const filteredInvoices = invoices.filter((i) => {
    const q = search.toLowerCase();
    const matchesSearch =
      i.invoiceNumber.toLowerCase().includes(q) ||
      i.entityName.toLowerCase().includes(q) ||
      i.entityEmail.toLowerCase().includes(q);
    const matchesType = typeFilter === "all" || i.type === typeFilter;
    const matchesStatus = statusFilter === "all" || i.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

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
          <h1 className="page-header__title">Invoicing & Accounts</h1>
          <p className="page-header__sub">
            Accounts receivable, supplier bills, payment tracking, and SARS tax invoices
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => {
              setNewType("receivable");
              setEntityName("BuildMax Contractors");
              setIsAddOpen(true);
            }}
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus size={14} />
            New Tax Invoice
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setNewType("payable");
              setEntityName("Dulux Paints SA");
              setIsAddOpen(true);
            }}
            className="gap-1.5"
          >
            <Plus size={14} />
            New Supplier Bill
          </Button>
        </div>
      </header>

      {/* Summary KPI Stats */}
      <dl className="summary-stats">
        <div className="summary-stats__item">
          <dt>Receivables (Owed to Us)</dt>
          <dd className="text-emerald-400 font-bold">
            R {totalReceivable.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
          </dd>
        </div>
        <div className="summary-stats__item">
          <dt>Payables (Bills Due)</dt>
          <dd className="text-amber-400 font-bold">
            R {totalPayable.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
          </dd>
        </div>
        <div className="summary-stats__item">
          <dt>Overdue Risk</dt>
          <dd className={totalOverdue > 0 ? "text-rose-400 font-bold" : ""}>
            R {totalOverdue.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
          </dd>
        </div>
        <div className="summary-stats__item">
          <dt>Collected Payments</dt>
          <dd className="text-cyan-400">
            R {totalCollected.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
          </dd>
        </div>
      </dl>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-[#11161d] p-1 rounded-lg border border-white/10 text-xs">
          {[
            { id: "all", label: "All Records" },
            { id: "receivable", label: "Customer Invoices (A/R)" },
            { id: "payable", label: "Supplier Bills (A/P)" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTypeFilter(t.id as "all" | "receivable" | "payable")}
              className={[
                "px-3 py-1.5 rounded-md font-medium transition-colors",
                typeFilter === t.id
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "text-white/60 hover:text-white",
              ].join(" ")}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Status Filter Tabs */}
        <div className="filter-tabs" role="tablist">
          {["all", "unpaid", "partially_paid", "paid", "overdue"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={[
                "filter-tab text-xs",
                statusFilter === st ? "filter-tab--active" : "",
              ]
                .join(" ")
                .trim()}
            >
              {st === "all"
                ? "All Statuses"
                : st === "partially_paid"
                ? "Partial"
                : st.charAt(0).toUpperCase() + st.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Search Filter */}
      <div className="page-filters">
        <div className="filter-search-wrap">
          <Search size={14} className="filter-search-icon" />
          <input
            type="search"
            placeholder="Search by invoice #, customer name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="filter-search"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                {[
                  "Doc #",
                  "Type",
                  "Customer / Supplier",
                  "Issue Date",
                  "Due Date",
                  "Total (Incl. VAT)",
                  "Balance Due",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={9} className="empty-state text-center py-8">
                    No invoices or bills found matching the current filters.
                  </td>
                </tr>
              )}
              {filteredInvoices.map((inv) => (
                <tr key={inv.id}>
                  <td>
                    <span className="font-mono font-bold text-xs text-white">
                      {inv.invoiceNumber}
                    </span>
                  </td>
                  <td>
                    <Badge variant={inv.type === "receivable" ? "info" : "warning"}>
                      {inv.type === "receivable" ? "Sales (A/R)" : "Bill (A/P)"}
                    </Badge>
                  </td>
                  <td>
                    <div className="flex flex-col">
                      <span className="font-medium text-xs text-white">
                        {inv.entityName}
                      </span>
                      <span className="text-[11px] text-white/50">{inv.entityEmail}</span>
                    </div>
                  </td>
                  <td>
                    <span className="text-xs text-white/70">{inv.issueDate}</span>
                  </td>
                  <td>
                    <span
                      className={[
                        "text-xs",
                        inv.status === "overdue" ? "text-rose-400 font-bold" : "text-white/70",
                      ].join(" ")}
                    >
                      {inv.dueDate}
                    </span>
                  </td>
                  <td>
                    <span className="font-mono text-xs font-bold text-white">
                      R {inv.totalAmount.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td>
                    <span
                      className={[
                        "font-mono text-xs font-bold",
                        inv.balanceDue > 0 ? "text-amber-400" : "text-emerald-400",
                      ].join(" ")}
                    >
                      R {inv.balanceDue.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td>
                    <Badge variant={STATUS_CONFIG[inv.status].variant}>
                      {STATUS_CONFIG[inv.status].label}
                    </Badge>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedInvoice(inv);
                          setIsViewOpen(true);
                        }}
                        className="text-xs gap-1 px-2"
                        title="View & Print Tax Invoice"
                      >
                        <Eye size={12} />
                        View
                      </Button>

                      {inv.balanceDue > 0 && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setPaymentAmount(String(inv.balanceDue));
                            setIsPayOpen(true);
                          }}
                          className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1 px-2"
                        >
                          <CreditCard size={12} />
                          Pay
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

      {/* Record Payment Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={isPayOpen}
          onClose={() => setIsPayOpen(false)}
          title={`Record Payment: ${selectedInvoice.invoiceNumber}`}
          description={`Record customer remittance or supplier bill settlement for ${selectedInvoice.entityName}`}
          maxWidth="sm"
        >
          <form onSubmit={handleRecordPayment} className="space-y-4">
            <div className="bg-white/5 p-3 rounded-lg text-xs space-y-1">
              <div className="flex justify-between text-white/70">
                <span>Invoice Total:</span>
                <span className="font-mono">
                  R {selectedInvoice.totalAmount.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Already Paid:</span>
                <span className="font-mono text-emerald-400">
                  R {selectedInvoice.amountPaid.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between font-bold text-white pt-1 border-t border-white/10">
                <span>Current Balance Due:</span>
                <span className="font-mono text-amber-400">
                  R {selectedInvoice.balanceDue.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">
                Payment Amount (ZAR) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                max={selectedInvoice.balanceDue}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsPayOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Confirm Payment Receipt
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Tax Invoice Document Viewer Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={isViewOpen}
          onClose={() => setIsViewOpen(false)}
          title={`Tax Invoice: ${selectedInvoice.invoiceNumber}`}
          description="South African Revenue Service (SARS) compliant Tax Invoice format"
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="bg-neutral-100 text-neutral-900 p-6 rounded-lg font-sans text-xs shadow border border-neutral-300 space-y-4 select-text">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-neutral-300 pb-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-neutral-950">
                    NEXUS COMMERCIAL COMMERCE
                  </h2>
                  <p className="text-neutral-600 font-mono text-[11px]">VAT REG NO: 4123456789</p>
                  <p className="text-neutral-600 text-[11px]">12 Commerce Street, City & Suburban, Johannesburg, 2001</p>
                  <p className="text-neutral-600 text-[11px]">Email: accounts@nexus-erp.co.za | Tel: +27 11 900 1200</p>
                </div>
                <div className="text-right space-y-1">
                  <span className="inline-block px-3 py-1 bg-neutral-900 text-white font-bold text-xs rounded uppercase tracking-wider">
                    TAX INVOICE
                  </span>
                  <p className="font-mono font-bold text-sm">{selectedInvoice.invoiceNumber}</p>
                  <p className="text-neutral-600">DATE: {selectedInvoice.issueDate}</p>
                  <p className="text-neutral-600 font-bold">DUE DATE: {selectedInvoice.dueDate}</p>
                </div>
              </div>

              {/* Billed To */}
              <div className="grid grid-cols-2 gap-4 py-2 border-b border-neutral-200">
                <div>
                  <p className="font-bold text-neutral-700 uppercase tracking-wider text-[10px]">BILLED TO / CUSTOMER:</p>
                  <p className="font-bold text-sm text-neutral-900">{selectedInvoice.entityName}</p>
                  <p className="text-neutral-600">{selectedInvoice.entityEmail}</p>
                  {selectedInvoice.entityPhone && <p className="text-neutral-600">{selectedInvoice.entityPhone}</p>}
                </div>
                <div className="text-right">
                  <p className="font-bold text-neutral-700 uppercase tracking-wider text-[10px]">TERMS & STATUS:</p>
                  <p className="font-semibold text-neutral-800">{selectedInvoice.paymentTerms}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-neutral-200 text-neutral-800">
                    STATUS: {selectedInvoice.status.replace("_", " ")}
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b-2 border-neutral-400 text-left font-bold text-neutral-800">
                    <th className="py-2">Description</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Unit Price</th>
                    <th className="py-2 text-right">VAT (15%)</th>
                    <th className="py-2 text-right">Total (ZAR)</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items.map((item, idx) => {
                    const lineExcl = item.quantity * item.unitPrice;
                    const lineVat = lineExcl * 0.15;
                    const lineTotal = lineExcl + lineVat;
                    return (
                      <tr key={idx} className="border-b border-neutral-200">
                        <td className="py-2 font-medium">
                          {item.description}
                          {item.sku && <span className="block font-mono text-[10px] text-neutral-500">{item.sku}</span>}
                        </td>
                        <td className="py-2 text-center">{item.quantity}</td>
                        <td className="py-2 text-right font-mono">R {item.unitPrice.toFixed(2)}</td>
                        <td className="py-2 text-right font-mono">R {lineVat.toFixed(2)}</td>
                        <td className="py-2 text-right font-mono font-bold">R {lineTotal.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Totals Breakdown */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-neutral-700">
                    <span>SUBTOTAL (EXCL. VAT):</span>
                    <span className="font-mono">R {selectedInvoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-700">
                    <span>VAT @ 15%:</span>
                    <span className="font-mono">R {selectedInvoice.vatAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-neutral-950 pt-1 border-t-2 border-neutral-400">
                    <span>TOTAL AMOUNT:</span>
                    <span className="font-mono">R {selectedInvoice.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>AMOUNT PAID:</span>
                    <span className="font-mono">R {selectedInvoice.amountPaid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-amber-700 pt-1 border-t border-dashed border-neutral-300">
                    <span>BALANCE OUTSTANDING:</span>
                    <span className="font-mono">R {selectedInvoice.balanceDue.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Banking & Remittance Details */}
              <div className="pt-3 border-t border-neutral-300 text-[11px] text-neutral-700">
                <p className="font-bold mb-0.5">BANKING & EFT REMITTANCE DETAILS:</p>
                <p>Bank: Standard Bank South Africa | Account Name: NEXUS Commercial Ltd</p>
                <p>Account Number: 012345678 | Branch Code: 051001 | Reference: {selectedInvoice.invoiceNumber}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
              <Button variant="outline" size="sm" onClick={() => setIsViewOpen(false)}>
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => window.print()}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Printer size={13} />
                Print Tax Invoice
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* New Invoice / Bill Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title={newType === "receivable" ? "Create Customer Tax Invoice" : "Create Supplier Bill (A/P)"}
        description="Generate SARS compliant invoice with line items and automatic 15% VAT calculation"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateInvoice} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">
                {newType === "receivable" ? "Customer / Business Name *" : "Supplier Name *"}
              </label>
              <input
                type="text"
                required
                value={entityName}
                onChange={(e) => setEntityName(e.target.value)}
                placeholder="e.g. BuildMax Construction Ltd"
                className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">
                Billing Email *
              </label>
              <input
                type="email"
                required
                value={entityEmail}
                onChange={(e) => setEntityEmail(e.target.value)}
                placeholder="e.g. accounts@client.co.za"
                className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Due Date *</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Payment Terms</label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="Due on Receipt">Due on Receipt</option>
                <option value="Net 7 Days">Net 7 Days</option>
                <option value="Net 14 Days">Net 14 Days</option>
                <option value="Net 30 Days">Net 30 Days</option>
                <option value="Net 60 Days">Net 60 Days</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Phone Number</label>
              <input
                type="text"
                value={entityPhone}
                onChange={(e) => setEntityPhone(e.target.value)}
                placeholder="+27 11 000 0000"
                className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Invoice Line Items:</span>
              <Button type="button" variant="outline" size="sm" onClick={handleAddLine} className="text-xs gap-1">
                <Plus size={12} /> Add Item Line
              </Button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {items.map((line, idx) => (
                <div key={idx} className="flex gap-2 items-center bg-white/5 p-2 rounded-lg">
                  <input
                    type="text"
                    value={line.description}
                    onChange={(e) => handleLineChange(idx, "description", e.target.value)}
                    placeholder="Item description"
                    className="flex-1 bg-[#161c24] border border-white/10 rounded px-2 py-1 text-xs text-white"
                  />
                  <div className="w-20">
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
                  <div className="w-28">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={line.unitPrice}
                      onChange={(e) =>
                        handleLineChange(idx, "unitPrice", parseFloat(e.target.value) || 0)
                      }
                      className="w-full bg-[#161c24] border border-white/10 rounded px-2 py-1 text-xs text-white text-right"
                      placeholder="Price"
                    />
                  </div>
                  {items.length > 1 && (
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
              Create & Issue Document
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
