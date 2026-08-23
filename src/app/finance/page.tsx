"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";

const MONTHLY_SUMMARY = [
  { month: "Aug", revenue: 182000, expenses: 98000, profit: 84000 },
  { month: "Sep", revenue: 194000, expenses: 102000, profit: 92000 },
  { month: "Oct", revenue: 178000, expenses: 95000, profit: 83000 },
  { month: "Nov", revenue: 210000, expenses: 108000, profit: 102000 },
  { month: "Dec", revenue: 248000, expenses: 124000, profit: 124000 },
  { month: "Jan", revenue: 196000, expenses: 101000, profit: 95000 },
];

const RECENT_TRANSACTIONS = [
  { id: "txn-001", type: "sale",     description: "POS Sale #1842",            amount: 4250,  date: "2024-01-13", status: "completed" },
  { id: "txn-002", type: "sale",     description: "POS Sale #1841",            amount: 1890,  date: "2024-01-13", status: "completed" },
  { id: "txn-003", type: "expense",  description: "Supplier Payment - Dulux",  amount: -28500, date: "2024-01-12", status: "completed" },
  { id: "txn-004", type: "sale",     description: "POS Sale #1840",            amount: 3120,  date: "2024-01-12", status: "completed" },
  { id: "txn-005", type: "refund",   description: "Refund #RF-0024",           amount: -450,  date: "2024-01-12", status: "completed" },
  { id: "txn-006", type: "expense",  description: "Utilities - Main Branch",   amount: -3200,  date: "2024-01-11", status: "completed" },
];

export default function FinancePage() {
  const current = MONTHLY_SUMMARY[MONTHLY_SUMMARY.length - 1];
  const previous = MONTHLY_SUMMARY[MONTHLY_SUMMARY.length - 2];
  const revChange = Math.round(((current.revenue - previous.revenue) / previous.revenue) * 100);
  const profitChange = Math.round(((current.profit - previous.profit) / previous.profit) * 100);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-primary">Finance</h1>
          <p className="text-sm text-secondary mt-0.5">Financial overview and transactions</p>
        </div>
        <Button variant="secondary" size="sm">Export</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="sm">
          <p className="text-xs text-muted uppercase tracking-wider">Revenue (Jan)</p>
          <p className="text-2xl font-bold text-primary mt-1">R {current.revenue.toLocaleString("en-ZA")}</p>
          <p className={revChange >= 0 ? "text-xs text-green-600 mt-1" : "text-xs text-red-600 mt-1"}>{revChange >= 0 ? "+" : ""}{revChange}% vs Dec</p>
        </Card>
        <Card padding="sm">
          <p className="text-xs text-muted uppercase tracking-wider">Expenses (Jan)</p>
          <p className="text-2xl font-bold text-primary mt-1">R {current.expenses.toLocaleString("en-ZA")}</p>
        </Card>
        <Card padding="sm">
          <p className="text-xs text-muted uppercase tracking-wider">Gross Profit (Jan)</p>
          <p className="text-2xl font-bold text-green-600 mt-1">R {current.profit.toLocaleString("en-ZA")}</p>
          <p className={profitChange >= 0 ? "text-xs text-green-600 mt-1" : "text-xs text-red-600 mt-1"}>{profitChange >= 0 ? "+" : ""}{profitChange}% vs Dec</p>
        </Card>
        <Card padding="sm">
          <p className="text-xs text-muted uppercase tracking-wider">Margin (Jan)</p>
          <p className="text-2xl font-bold text-primary mt-1">{Math.round((current.profit / current.revenue) * 100)}%</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Monthly Performance</CardTitle><Badge variant="muted">6 months</Badge></CardHeader>
          <div className="space-y-2">
            {MONTHLY_SUMMARY.map((m) => (
              <div key={m.month} className="flex items-center gap-3">
                <span className="text-xs text-muted w-8">{m.month}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-2 bg-[var(--accent)] rounded-full" style={{ width: Math.round((m.revenue / 250000) * 100) + "%" }} />
                </div>
                <span className="text-xs font-medium text-primary w-24 text-right">R {(m.revenue / 1000).toFixed(0)}k</span>
                <span className="text-xs text-green-600 w-20 text-right">R {(m.profit / 1000).toFixed(0)}k profit</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Transactions</CardTitle></CardHeader>
          <div className="space-y-1">
            {RECENT_TRANSACTIONS.map((t) => (
              <div key={t.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-page transition-colors">
                <span className={t.amount >= 0 ? "text-green-600" : "text-red-500"}>
                  {t.amount >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-primary truncate">{t.description}</p>
                  <p className="text-xs text-muted">{t.date}</p>
                </div>
                <span className={t.amount >= 0 ? "text-sm font-semibold text-green-600" : "text-sm font-semibold text-red-500"}>
                  {t.amount >= 0 ? "+" : ""}R {Math.abs(t.amount).toLocaleString("en-ZA")}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
