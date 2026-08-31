"use client";
import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  RefreshCw,
  Send,
  AlertTriangle,
  TrendingUp,
  Package,
  FileText,
  Copy,
  Check,
  Bot,
  Truck,
  ArrowRight,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface AiResponse {
  insights: string;
  source: string;
  metricsSnapshot: {
    totalProductsCount: number;
    lowStockCount: number;
    outOfStockCount: number;
    overdueInvoicesCount: number;
    overdueTotalZAR: number;
    inTransitTransfersCount: number;
    suppliersCount: number;
  };
}

const PRESET_QUERIES = [
  "Comprehensive Executive Health & Margin Audit",
  "High Risk Stockouts & Automated PO Recommendations",
  "Working Capital & Overdue Debtor Recovery Strategy",
  "Inter-Branch Logistics & Transfer Optimization",
];

export default function AiInsightsPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AiResponse | null>(null);
  const [customQuestion, setCustomQuestion] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async (query?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: query || customQuestion }),
      });
      const json = await res.json();
      if (json.insights) {
        setData(json);
      } else {
        setError("Could not generate report. Please try again.");
      }
    } catch {
      setError("Network error communicating with AI Analytics engine.");
    } finally {
      setLoading(false);
    }
  }, [customQuestion]);

  useEffect(() => {
    let active = true;
    async function loadInitial() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/v1/ai/insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: "Comprehensive Executive Health & Margin Audit" }),
        });
        const json = await res.json();
        if (active && json.insights) {
          setData(json);
        }
      } catch {
        if (active) setError("Could not load initial AI intelligence report.");
      } finally {
        if (active) setLoading(false);
      }
    }
    loadInitial();
    return () => {
      active = false;
    };
  }, []);

  const handleCopy = () => {
    if (data?.insights) {
      navigator.clipboard.writeText(data.insights);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePresetClick = (preset: string) => {
    setCustomQuestion(preset);
    fetchInsights(preset);
  };

  return (
    <div className="page">
      <header className="page-header">
        <div className="page-header__text">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="page-header__title">Gemini AI Executive Intelligence</h1>
            <Badge variant="info" className="gap-1 bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
              <Sparkles size={11} />
              {data?.source === "gemini-2.5-flash" ? "Gemini 2.5 Flash" : "Automated Analytics"}
            </Badge>
          </div>
          <p className="page-header__sub">
            Real-time commercial diagnostics, stockout risk assessments, and debtor recovery recommendations
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => fetchInsights()}
          disabled={loading}
          className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {loading ? "Analyzing ERP State..." : "Regenerate Intelligence"}
        </Button>
      </header>

      {/* Snapshot Cards */}
      {data?.metricsSnapshot && (
        <dl className="summary-stats">
          <div className="summary-stats__item">
            <dt>Critical Stockouts</dt>
            <dd className={data.metricsSnapshot.outOfStockCount > 0 ? "text-rose-400 font-bold" : ""}>
              {data.metricsSnapshot.outOfStockCount} SKUs
            </dd>
          </div>
          <div className="summary-stats__item">
            <dt>Low Stock Reorders</dt>
            <dd className="text-amber-400 font-bold">
              {data.metricsSnapshot.lowStockCount} SKUs
            </dd>
          </div>
          <div className="summary-stats__item">
            <dt>Overdue Debtors (A/R)</dt>
            <dd className="text-rose-400 font-bold">
              R {data.metricsSnapshot.overdueTotalZAR.toLocaleString("en-ZA")}
            </dd>
          </div>
          <div className="summary-stats__item">
            <dt>In-Transit Waybills</dt>
            <dd className="text-cyan-400">
              {data.metricsSnapshot.inTransitTransfersCount} Shipments
            </dd>
          </div>
        </dl>
      )}

      {/* Interactive Prompting Box */}
      <Card className="p-4 space-y-3 bg-[#11161d] border-white/10">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Ask Gemini anything about your inventory, sales, suppliers, or debtors..."
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchInsights(customQuestion)}
              className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-white/40 focus:border-cyan-500 focus:outline-none pr-10"
            />
            <button
              type="button"
              onClick={() => fetchInsights(customQuestion)}
              disabled={loading || !customQuestion.trim()}
              className="absolute right-2 top-2 p-1 text-white/50 hover:text-cyan-400 disabled:opacity-30 transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
          <Button
            size="sm"
            onClick={() => fetchInsights(customQuestion)}
            disabled={loading}
            className="shrink-0 bg-cyan-600 hover:bg-cyan-700 text-white gap-1.5"
          >
            <Bot size={14} />
            Run Query
          </Button>
        </div>

        {/* Preset Prompt Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-white/40 font-medium mr-1">Suggested Inquiries:</span>
          {PRESET_QUERIES.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handlePresetClick(preset)}
              className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-white/70 hover:text-cyan-300 transition-colors flex items-center gap-1"
            >
              <span>{preset}</span>
              <ArrowRight size={10} className="text-white/40" />
            </button>
          ))}
        </div>
      </Card>

      {/* Main Intelligence Report Display */}
      <Card className="p-6 relative bg-[#11161d] border-white/10">
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Commercial Advisory & Action Report
            </h2>
          </div>
          <Button variant="outline" size="sm" onClick={handleCopy} className="text-xs gap-1.5">
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            {copied ? "Copied" : "Copy Report"}
          </Button>
        </div>

        {loading ? (
          <div className="py-16 text-center space-y-3">
            <RefreshCw size={32} className="mx-auto text-cyan-400 animate-spin" />
            <p className="text-sm text-white/70 font-medium">
              Generating real-time executive report from live ERP metrics...
            </p>
            <p className="text-xs text-white/40">
              Correlating inventory stockouts, supplier purchase orders, and accounts receivable
            </p>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-sm flex items-center gap-2">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        ) : (
          <div className="prose prose-invert max-w-none text-white/90 text-sm leading-relaxed space-y-4 select-text">
            <div className="markdown-body">
              <ReactMarkdown>{data?.insights || "No report available."}</ReactMarkdown>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
