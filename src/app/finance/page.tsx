"use client";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const MONTHLY = [
  { month: "Aug", revenue: 182000, expenses: 98000,  profit: 84000  },
  { month: "Sep", revenue: 194000, expenses: 102000, profit: 92000  },
  { month: "Oct", revenue: 178000, expenses: 95000,  profit: 83000  },
  { month: "Nov", revenue: 210000, expenses: 108000, profit: 102000 },
  { month: "Dec", revenue: 248000, expenses: 124000, profit: 124000 },
  { month: "Jan", revenue: 196000, expenses: 101000, profit: 95000  },
];

const TRANSACTIONS = [
  { id: "t-001", type: "sale",    description: "POS Sale #1842",           amount:   4250,  date: "2024-01-13" },
  { id: "t-002", type: "sale",    description: "POS Sale #1841",           amount:   1890,  date: "2024-01-13" },
  { id: "t-003", type: "expense", description: "Supplier Payment - Dulux", amount: -28500,  date: "2024-01-12" },
  { id: "t-004", type: "sale",    description: "POS Sale #1840",           amount:   3120,  date: "2024-01-12" },
  { id: "t-005", type: "refund",  description: "Refund #RF-0024",          amount:   -450,  date: "2024-01-12" },
  { id: "t-006", type: "expense", description: "Utilities - Main Branch",  amount:  -3200,  date: "2024-01-11" },
];

export default function FinancePage() {
  const current = MONTHLY[MONTHLY.length - 1];
  const previous = MONTHLY[MONTHLY.length - 2];
  const revChange = Math.round(((current.revenue - previous.revenue) / previous.revenue) * 100);
  const margin = Math.round((current.profit / current.revenue) * 100);
  const maxRevenue = Math.max(...MONTHLY.map(m => m.revenue));

  return (
    <div className="page">
      <header className="page-header">
        <div className="page-header__text">
          <h1 className="page-header__title">Finance</h1>
          <p className="page-header__sub">Financial overview and transactions</p>
        </div>
        <Button variant="secondary" size="sm">Export</Button>
      </header>

      <dl className="summary-stats">
        <div className="summary-stats__item"><dt>Revenue (Jan)</dt><dd>R {current.revenue.toLocaleString("en-ZA")}<small data-positive={revChange >= 0}>{revChange >= 0 ? "+" : ""}{revChange}% vs Dec</small></dd></div>
        <div className="summary-stats__item"><dt>Expenses (Jan)</dt><dd>R {current.expenses.toLocaleString("en-ZA")}</dd></div>
        <div className="summary-stats__item"><dt>Gross Profit (Jan)</dt><dd>R {current.profit.toLocaleString("en-ZA")}</dd></div>
        <div className="summary-stats__item"><dt>Margin</dt><dd>{margin}%</dd></div>
      </dl>

      <div className="finance-panels">
        <Card>
          <CardHeader><CardTitle>Monthly Performance</CardTitle><Badge variant="muted">6 months</Badge></CardHeader>
          <table className="bar-chart-table" aria-label="Monthly revenue and profit">
            <tbody>
              {MONTHLY.map((m) => (
                <tr key={m.month}>
                  <th scope="row">{m.month}</th>
                  <td>
                    <meter value={m.revenue} min={0} max={maxRevenue} aria-label={"Revenue " + m.revenue} />
                  </td>
                  <td>R {(m.revenue / 1000).toFixed(0)}k</td>
                  <td data-positive="true">R {(m.profit / 1000).toFixed(0)}k profit</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Transactions</CardTitle></CardHeader>
          <table>
            <tbody>
              {TRANSACTIONS.map((t) => (
                <tr key={t.id} data-type={t.type}>
                  <td>{t.description}</td>
                  <td>{t.date}</td>
                  <td data-positive={t.amount >= 0}>
                    {t.amount >= 0 ? "+" : ""}R {Math.abs(t.amount).toLocaleString("en-ZA")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
