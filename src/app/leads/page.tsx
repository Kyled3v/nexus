"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type LeadStage = "new"|"contacted"|"qualified"|"proposal"|"won"|"lost";
type LeadSource = "website"|"pos"|"referral"|"manual"|"campaign";

interface Lead {
  id: string; name: string; company?: string; email?: string; phone?: string;
  source: LeadSource; stage: LeadStage; value: number; createdAt: string; notes?: string;
}

const DEMO_LEADS: Lead[] = [
  { id: "l-001", name: "Mpho Sithole",    company: "Sithole Contractors", email: "mpho@sithole.co.za",   source: "website",  stage: "qualified", value: 45000, createdAt: "2024-01-10" },
  { id: "l-002", name: "Carla Ferreira",  company: "CF Interior Design",  email: "carla@cfdesign.co.za", source: "referral", stage: "proposal",  value: 28000, createdAt: "2024-01-09" },
  { id: "l-003", name: "Sipho Zulu",                                       email: "sipho@email.com",      source: "pos",      stage: "new",       value:  5000, createdAt: "2024-01-12" },
  { id: "l-004", name: "Anita Govender",  company: "Govender Properties", email: "anita@govprop.co.za",  source: "website",  stage: "contacted", value: 62000, createdAt: "2024-01-08" },
  { id: "l-005", name: "Riaan Botha",     company: "Botha Building",      email: "riaan@botha.co.za",    source: "referral", stage: "won",       value: 38000, createdAt: "2024-01-05" },
  { id: "l-006", name: "Fatima Petersen",                                  email: "fatima@email.com",     source: "campaign", stage: "lost",      value: 12000, createdAt: "2024-01-03" },
];

const STAGE_VARIANT: Record<LeadStage, "default"|"success"|"warning"|"danger"|"muted"|"info"> = {
  new: "info", contacted: "default", qualified: "warning", proposal: "warning", won: "success", lost: "danger",
};

export default function LeadsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = DEMO_LEADS.filter((l) => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) || (l.company ?? "").toLowerCase().includes(search.toLowerCase());
    return matchSearch && (filter === "all" || l.stage === filter);
  });

  const pipeline = DEMO_LEADS.filter(l => l.stage !== "won" && l.stage !== "lost").reduce((s, l) => s + l.value, 0);
  const won = DEMO_LEADS.filter(l => l.stage === "won").reduce((s, l) => s + l.value, 0);

  return (
    <div className="page">
      <header className="page-header">
        <div className="page-header__text">
          <h1 className="page-header__title">Leads</h1>
          <p className="page-header__sub">Sales pipeline and lead management</p>
        </div>
        <Button size="sm">Add Lead</Button>
      </header>

      <dl className="summary-stats">
        <div className="summary-stats__item"><dt>Total Leads</dt><dd>{DEMO_LEADS.length}</dd></div>
        <div className="summary-stats__item"><dt>Pipeline Value</dt><dd>R {pipeline.toLocaleString("en-ZA")}</dd></div>
        <div className="summary-stats__item"><dt>Won Value</dt><dd>R {won.toLocaleString("en-ZA")}</dd></div>
        <div className="summary-stats__item"><dt>Conversion</dt><dd>{Math.round((DEMO_LEADS.filter(l => l.stage === "won").length / DEMO_LEADS.length) * 100)}%</dd></div>
      </dl>

      <div className="page-filters">
        <input type="search" placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} className="filter-search" />
        <div className="filter-tabs" role="tablist">
          {["all","new","contacted","qualified","proposal","won","lost"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} role="tab" aria-selected={filter === f} className={["filter-tab", filter === f ? "filter-tab--active" : ""].join(" ").trim()}>
              {f === "all" ? "All Leads" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <Card padding="none">
        <table>
          <thead>
            <tr>{["Lead","Company","Source","Value","Stage","Created",""].map((h) => <th key={h} scope="col">{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={7} className="empty-state">No leads found</td></tr>}
            {filtered.map((l) => (
              <tr key={l.id} data-stage={l.stage}>
                <td><strong>{l.name}</strong>{l.email && <small>{l.email}</small>}</td>
                <td>{l.company ?? "—"}</td>
                <td><span className="source-tag">{l.source}</span></td>
                <td>R {l.value.toLocaleString("en-ZA")}</td>
                <td><Badge variant={STAGE_VARIANT[l.stage]}>{l.stage}</Badge></td>
                <td>{l.createdAt}</td>
                <td><Button variant="ghost" size="sm">View</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
