"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Download, FileText, TrendingUp, CheckCircle2 } from "lucide-react";

interface ReportItem {
  id: string;
  name: string;
  description: string;
  category: "Sales" | "Products" | "Inventory" | "Customers" | "Suppliers" | "Finance" | "Business";
  data?: Record<string, unknown>[];
}

const REPORTS: ReportItem[] = [
  { id: "r-001", name: "Sales Summary",        description: "Daily, weekly and monthly sales breakdown by till and tender", category: "Sales"     },
  { id: "r-002", name: "Product Performance",  description: "Best and worst performing products by gross margin and velocity", category: "Products"  },
  { id: "r-003", name: "Inventory Valuation",  description: "Current stock value by category, brand, and branch location",  category: "Inventory" },
  { id: "r-004", name: "Stock Movement",       description: "All inventory movements with full user audit trail",             category: "Inventory" },
  { id: "r-005", name: "Customer Analysis",    description: "Customer spend, frequency, credit terms, and segments",      category: "Customers" },
  { id: "r-006", name: "Supplier Performance", description: "PO fulfilment lead times, cost discrepancies, and reliability", category: "Suppliers" },
  { id: "r-007", name: "Profit and Loss",      description: "Revenue, cost of sales (COGS), gross margin, and overheads",  category: "Finance"   },
  { id: "r-008", name: "Branch Comparison",    description: "Multi-branch comparative throughput and revenue benchmarking", category: "Business"  },
];

const TOP_PRODUCTS = [
  { name: "Dulux Weathershield 20L", revenue: 18900, units: 42, margin: 36.7 },
  { name: "Crown Trade Matt 20L",    revenue: 12400, units: 31, margin: 35.0 },
  { name: "Plascon Velvaglo 5L",     revenue:  9500, units: 38, margin: 42.0 },
  { name: "Rust-Oleum Primer 1L",    revenue:  4200, units: 28, margin: 42.1 },
  { name: "Dulux Eggshell 5L",       revenue:  6000, units: 24, margin: 40.9 },
];

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRunReport = (report: ReportItem) => {
    setSelectedReport(report);
    setIsReportModalOpen(true);
  };

  const handleExportCSV = (reportName: string) => {
    showToast(`Exported "${reportName}.csv"`);
  };

  const filteredReports = activeCategory === "all"
    ? REPORTS
    : REPORTS.filter(r => r.category.toLowerCase() === activeCategory.toLowerCase());

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
          <h1 className="page-header__title">Reports & Analytics</h1>
          <p className="page-header__sub">Business intelligence, valuation, and executive summaries</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => handleExportCSV("NEXUS_Master_Report")}>
          <Download size={14} className="mr-1" />Export All
        </Button>
      </header>

      <div className="page-filters">
        <div className="filter-tabs" role="tablist">
          {["all","Sales","Products","Inventory","Customers","Finance","Business"].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              role="tab"
              aria-selected={activeCategory === cat}
              className={["filter-tab", activeCategory === cat ? "filter-tab--active" : ""].join(" ").trim()}
            >
              {cat === "all" ? "All Categories" : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="reports-panels">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle>Standard Business Reports</CardTitle>
              <Badge variant="muted">{filteredReports.length} reports</Badge>
            </div>
          </CardHeader>
          <ul className="report-list">
            {filteredReports.map((r) => (
              <li key={r.id} className="report-list__item">
                <div className="report-list__body">
                  <div className="flex items-center gap-2">
                    <FileText size={15} className="text-cyan-400" />
                    <strong className="report-list__name text-white">{r.name}</strong>
                  </div>
                  <p className="report-list__desc text-xs text-white/60 mt-1">{r.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="muted">{r.category}</Badge>
                  <Button variant="secondary" size="sm" onClick={() => handleRunReport(r)}>
                    Run Report
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-400" />
                <CardTitle>Top Velocity Products</CardTitle>
              </div>
              <Badge variant="muted">Current Month</Badge>
            </div>
          </CardHeader>
          <ol className="product-rank-list">
            {TOP_PRODUCTS.map((p, idx) => (
              <li key={p.name} className="product-rank-list__item">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-white/40 w-4">{idx + 1}.</span>
                  <span className="product-rank-list__name font-medium text-white">{p.name}</span>
                </div>
                <span className="product-rank-list__meta text-xs text-white/50">{p.units} units · {p.margin}% margin</span>
                <span className="product-rank-list__revenue text-emerald-400 font-semibold font-mono">
                  R {p.revenue.toLocaleString("en-ZA")}
                </span>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      {/* Report Execution Viewer Modal */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title={selectedReport?.name || "Report"}
        description={selectedReport?.description}
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
            <span className="text-white/60">Reporting Period: <strong>Current Month (August 2026)</strong></span>
            <Button size="sm" variant="secondary" onClick={() => handleExportCSV(selectedReport?.name || "Report")}>
              <Download size={13} className="mr-1" />Export CSV
            </Button>
          </div>

          <div className="border border-white/10 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-white/5 text-white/60">
                <tr>
                  <th className="p-2 text-left">Segment / Item</th>
                  <th className="p-2 text-right">Transactions</th>
                  <th className="p-2 text-right">Volume</th>
                  <th className="p-2 text-right">Total (ZAR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="p-2 text-white">Main Branch Sales</td>
                  <td className="p-2 text-right text-white/70">342</td>
                  <td className="p-2 text-right text-white/70">892 units</td>
                  <td className="p-2 text-right font-mono text-emerald-400 font-semibold">R 142,500.00</td>
                </tr>
                <tr>
                  <td className="p-2 text-white">Wholesale / Trade Account Invoices</td>
                  <td className="p-2 text-right text-white/70">48</td>
                  <td className="p-2 text-right text-white/70">420 units</td>
                  <td className="p-2 text-right font-mono text-emerald-400 font-semibold">R 89,200.00</td>
                </tr>
                <tr>
                  <td className="p-2 text-white">Online & POS Direct Pickup</td>
                  <td className="p-2 text-right text-white/70">92</td>
                  <td className="p-2 text-right text-white/70">184 units</td>
                  <td className="p-2 text-right font-mono text-emerald-400 font-semibold">R 28,400.00</td>
                </tr>
              </tbody>
              <tfoot className="bg-white/10 font-bold text-white">
                <tr>
                  <td className="p-2">Consolidated Total</td>
                  <td className="p-2 text-right">482</td>
                  <td className="p-2 text-right">1,496 units</td>
                  <td className="p-2 text-right font-mono text-emerald-400">R 260,100.00</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex justify-end pt-3 border-t border-white/10">
            <Button variant="ghost" onClick={() => setIsReportModalOpen(false)}>Close</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
