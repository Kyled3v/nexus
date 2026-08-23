"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Plus, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type LeadStage = "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
type LeadSource = "website" | "pos" | "referral" | "manual" | "campaign";

interface Lead {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  source: LeadSource;
  stage: LeadStage;
  value: number;
  owner: string;
  createdAt: string;
  notes?: string;
}

const DEMO_LEADS: Lead[] = [
  { id: "lead-001", name: "Mpho Sithole",     company: "Sithole Contractors",  email: "mpho@sithole.co.za",  phone: "+27 82 200 0001", source: "website",  stage: "qualified", value: 45000, owner: "Kyle (Owner)", createdAt: "2024-01-10", notes: "Large renovation project" },
  { id: "lead-002", name: "Carla Ferreira",   company: "CF Interior Design",   email: "carla@cfdesign.co.za", phone: "+27 83 200 0002", source: "referral", stage: "proposal",  value: 28000, owner: "Kyle (Owner)", createdAt: "2024-01-09" },
  { id: "lead-003", name: "Sipho Zulu",       company: undefined,              email: "sipho@email.com",      phone: "+27 84 200 0003", source: "pos",      stage: "new",       value: 5000,  owner: "Kyle (Owner)", createdAt: "2024-01-12" },
  { id: "lead-004", name: "Anita Govender",   company: "Govender Properties",  email: "anita@govprop.co.za", phone: "+27 85 200 0004", source: "website",  stage: "contacted", value: 62000, owner: "Kyle (Owner)", createdAt: "2024-01-08", notes: "Multi-unit complex" },
  { id: "lead-005", name: "Riaan Botha",      company: "Botha Building",       email: "riaan@botha.co.za",   phone: "+27 86 200 0005", source: "referral", stage: "won",       value: 38000, owner: "Kyle (Owner)", createdAt: "2024-01-05" },
  { id: "lead-006", name: "Fatima Petersen",  company: undefined,              email: "fatima@email.com",     phone: "+27 87 200 0006", source: "campaign", stage: "lost",      value: 12000, owner: "Kyle (Owner)", createdAt: "2024-01-03", notes: "Went with competitor" },
];

const STAGE_CONFIG: Record<LeadStage, { label: string; variant: "default"|"success"|"warning"|"danger"|"muted"|"info"; order: number }> = {
  new:       { label: "New",       variant: "info",    order: 1 },
  contacted: { label: "Contacted", variant: "default", order: 2 },
  qualified: { label: "Qualified", variant: "warning", order: 3 },
  proposal:  { label: "Proposal",  variant: "warning", order: 4 },
  won:       { label: "Won",       variant: "success", order: 5 },
  lost:      { label: "Lost",      variant: "danger",  order: 6 },
};

const SOURCE_LABEL: Record<LeadSource, string> = {
  website: "Website", pos: "POS", referral: "Referral", manual: "Manual", campaign: "Campaign",
};

export default function LeadsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = DEMO_LEADS.filter((l) => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) || (l.company ?? "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || l.stage === filter;
    return matchSearch && matchFilter;
  });

  const pipeline = DEMO_LEADS.filter(l => l.stage !== "won" && l.stage !== "lost").reduce((s, l) => s + l.value, 0);
  const won = DEMO_LEADS.filter(l => l.stage === "won").reduce((s, l) => s + l.value, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-primary">Leads</h1>
          <p className="text-sm text-secondary mt-0.5">Sales pipeline and lead management</p>
        </div>
        <Button size="sm"><Plus size={14} />Add Lead</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="sm"><p className="text-xs text-muted uppercase tracking-wider">Total Leads</p><p className="text-2xl font-bold text-primary mt-1">{DEMO_LEADS.length}</p></Card>
        <Card padding="sm"><p className="text-xs text-muted uppercase tracking-wider">Pipeline Value</p><p className="text-2xl font-bold text-primary mt-1">R {pipeline.toLocaleString("en-ZA")}</p></Card>
        <Card padding="sm"><p className="text-xs text-muted uppercase tracking-wider">Won Value</p><p className="text-2xl font-bold text-green-600 mt-1">R {won.toLocaleString("en-ZA")}</p></Card>
        <Card padding="sm"><p className="text-xs text-muted uppercase tracking-wider">Conversion</p><p className="text-2xl font-bold text-primary mt-1">{Math.round((DEMO_LEADS.filter(l=>l.stage==="won").length/DEMO_LEADS.length)*100)}%</p></Card>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input type="text" placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 pr-4 py-2 text-sm bg-card border border-base rounded-lg text-primary placeholder:text-muted focus:outline-none w-64" />
        </div>
        {["all","new","contacted","qualified","proposal","won","lost"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cn("px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors capitalize", filter === f ? "bg-[var(--accent)] text-white border-transparent" : "bg-card text-secondary border-base hover:text-primary")}>
            {f === "all" ? "All Leads" : STAGE_CONFIG[f as LeadStage]?.label ?? f}
          </button>
        ))}
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-base">
                {["Lead","Company","Source","Value","Stage","Created",""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center"><TrendingUp size={32} className="mx-auto text-muted mb-2" /><p className="text-sm text-muted">No leads found</p></td></tr>
              )}
              {filtered.map((l) => {
                const cfg = STAGE_CONFIG[l.stage];
                return (
                  <tr key={l.id} className="hover:bg-page transition-colors border-b border-base last:border-0">
                    <td className="px-4 py-3"><p className="font-medium text-primary">{l.name}</p>{l.email && <p className="text-xs text-muted">{l.email}</p>}</td>
                    <td className="px-4 py-3 text-secondary">{l.company ?? "—"}</td>
                    <td className="px-4 py-3"><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{SOURCE_LABEL[l.source]}</span></td>
                    <td className="px-4 py-3 font-semibold text-primary">R {l.value.toLocaleString("en-ZA")}</td>
                    <td className="px-4 py-3"><Badge variant={cfg.variant}>{cfg.label}</Badge></td>
                    <td className="px-4 py-3 text-secondary">{l.createdAt}</td>
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
