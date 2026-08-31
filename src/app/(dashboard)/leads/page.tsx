"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Plus, CheckCircle2, UserCheck, Phone, Mail, ArrowRight } from "lucide-react";

type LeadStage = "new"|"contacted"|"qualified"|"proposal"|"won"|"lost";
type LeadSource = "website"|"pos"|"referral"|"manual"|"campaign";

interface Lead {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  source: LeadSource;
  stage: LeadStage;
  value: number;
  createdAt: string;
  notes?: string;
}

const INITIAL_LEADS: Lead[] = [
  { id: "l-001", name: "Mpho Sithole",    company: "Sithole Contractors", email: "mpho@sithole.co.za",   phone: "+27 82 123 4567", source: "website",  stage: "qualified", value: 45000, createdAt: "2024-01-10" },
  { id: "l-002", name: "Carla Ferreira",  company: "CF Interior Design",  email: "carla@cfdesign.co.za", phone: "+27 83 234 5678", source: "referral", stage: "proposal",  value: 28000, createdAt: "2024-01-09" },
  { id: "l-003", name: "Sipho Zulu",                                       email: "sipho@email.com",      phone: "+27 84 345 6789", source: "pos",      stage: "new",       value:  5000, createdAt: "2024-01-12" },
  { id: "l-004", name: "Anita Govender",  company: "Govender Properties", email: "anita@govprop.co.za",  phone: "+27 82 456 7890", source: "website",  stage: "contacted", value: 62000, createdAt: "2024-01-08" },
  { id: "l-005", name: "Riaan Botha",     company: "Botha Building",      email: "riaan@botha.co.za",    phone: "+27 83 567 8901", source: "referral", stage: "won",       value: 38000, createdAt: "2024-01-05" },
  { id: "l-006", name: "Fatima Petersen",                                  email: "fatima@email.com",     phone: "+27 84 678 9012", source: "campaign", stage: "lost",      value: 12000, createdAt: "2024-01-03" },
];

const STAGE_VARIANT: Record<LeadStage, "default"|"success"|"warning"|"danger"|"muted"|"info"> = {
  new: "info",
  contacted: "default",
  qualified: "warning",
  proposal: "warning",
  won: "success",
  lost: "danger",
};

const NEXT_STAGE: Partial<Record<LeadStage, LeadStage>> = {
  new: "contacted",
  contacted: "qualified",
  qualified: "proposal",
  proposal: "won",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    source: "website" as LeadSource,
    value: "25000",
    notes: "",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    const newLead: Lead = {
      id: "l-" + Date.now(),
      name: formData.name,
      company: formData.company.trim() || undefined,
      email: formData.email.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      source: formData.source,
      stage: "new",
      value: parseFloat(formData.value) || 0,
      createdAt: new Date().toISOString().split("T")[0],
      notes: formData.notes.trim() || undefined,
    };

    setLeads(prev => [newLead, ...prev]);
    setIsAddOpen(false);
    showToast(`Lead ${newLead.name} captured in pipeline!`);
  };

  const advanceStage = (id: string) => {
    setLeads(prev => prev.map(l => {
      if (l.id === id) {
        const next = NEXT_STAGE[l.stage] || l.stage;
        showToast(`${l.name} advanced to ${next.toUpperCase()}`);
        return { ...l, stage: next };
      }
      return l;
    }));
  };

  const markWon = (id: string) => {
    setLeads(prev => prev.map(l => {
      if (l.id === id) {
        showToast(`Deal WON with ${l.name}! (R ${l.value.toLocaleString("en-ZA")})`);
        return { ...l, stage: "won" };
      }
      return l;
    }));
  };

  const filtered = leads.filter((l) => {
    const matchSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      (l.company ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (l.email ?? "").toLowerCase().includes(search.toLowerCase());
    return matchSearch && (filter === "all" || l.stage === filter);
  });

  const pipeline = leads.filter(l => l.stage !== "won" && l.stage !== "lost").reduce((s, l) => s + l.value, 0);
  const won = leads.filter(l => l.stage === "won").reduce((s, l) => s + l.value, 0);

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
          <h1 className="page-header__title">Leads & CRM</h1>
          <p className="page-header__sub">Pipeline opportunities and client acquisition</p>
        </div>
        <Button size="sm" onClick={() => setIsAddOpen(true)}>
          <Plus size={14} />Add Lead
        </Button>
      </header>

      <dl className="summary-stats">
        <div className="summary-stats__item"><dt>Total Leads</dt><dd>{leads.length}</dd></div>
        <div className="summary-stats__item"><dt>Pipeline Value</dt><dd>R {pipeline.toLocaleString("en-ZA")}</dd></div>
        <div className="summary-stats__item"><dt>Won Value</dt><dd className="text-emerald-400 font-bold">R {won.toLocaleString("en-ZA")}</dd></div>
        <div className="summary-stats__item"><dt>Win Rate</dt><dd>{Math.round((leads.filter(l => l.stage === "won").length / leads.length) * 100)}%</dd></div>
      </dl>

      <div className="page-filters">
        <input
          type="search"
          placeholder="Search leads, companies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="filter-search"
        />
        <div className="filter-tabs" role="tablist">
          {["all","new","contacted","qualified","proposal","won","lost"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              role="tab"
              aria-selected={filter === f}
              className={["filter-tab", filter === f ? "filter-tab--active" : ""].join(" ").trim()}
            >
              {f === "all" ? "All Leads" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                {["Lead Contact","Company","Channel","Est. Value","Stage","Created","Pipeline Action"].map((h) => (
                  <th key={h} scope="col">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty-state">
                    <div className="flex flex-col items-center justify-center py-8">
                      <UserCheck size={32} className="text-white/30 mb-2" />
                      <p className="font-medium text-white/70">No leads found in this view</p>
                    </div>
                  </td>
                </tr>
              )}
              {filtered.map((l) => (
                <tr key={l.id} data-stage={l.stage}>
                  <td>
                    <strong className="block text-white font-medium">{l.name}</strong>
                    <div className="flex items-center gap-2 text-xs text-white/50 mt-0.5">
                      {l.email && <span className="flex items-center gap-1"><Mail size={10} />{l.email}</span>}
                      {l.phone && <span className="flex items-center gap-1"><Phone size={10} />{l.phone}</span>}
                    </div>
                  </td>
                  <td>{l.company ?? "—"}</td>
                  <td>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/70 capitalize">
                      {l.source}
                    </span>
                  </td>
                  <td><strong>R {l.value.toLocaleString("en-ZA")}</strong></td>
                  <td><Badge variant={STAGE_VARIANT[l.stage]}>{l.stage}</Badge></td>
                  <td>{l.createdAt}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      {NEXT_STAGE[l.stage] && (
                        <Button variant="secondary" size="sm" onClick={() => advanceStage(l.id)}>
                          <span>Next Stage</span>
                          <ArrowRight size={12} className="ml-1" />
                        </Button>
                      )}
                      {l.stage !== "won" && l.stage !== "lost" && (
                        <Button variant="ghost" size="sm" onClick={() => markWon(l.id)} className="text-emerald-400 hover:text-emerald-300">
                          Won
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

      {/* Add Lead Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add New Opportunity"
        description="Capture potential customer lead into pipeline"
      >
        <form onSubmit={handleAddLead} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Contact Name *</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Johan van der Merwe"
                className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Company Name</label>
              <input
                type="text"
                value={formData.company}
                onChange={e => setFormData(p => ({ ...p, company: e.target.value }))}
                placeholder="e.g. Cape Town Renovations"
                className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                placeholder="johan@ctreno.co.za"
                className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                placeholder="+27 82 555 1234"
                className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Estimated Deal Value (R) *</label>
              <input
                required
                type="number"
                value={formData.value}
                onChange={e => setFormData(p => ({ ...p, value: e.target.value }))}
                placeholder="35000"
                className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono text-emerald-400 font-semibold focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Acquisition Source</label>
              <select
                value={formData.source}
                onChange={e => setFormData(p => ({ ...p, source: e.target.value as LeadSource }))}
                className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="website">Website Inquiry</option>
                <option value="referral">Client Referral</option>
                <option value="pos">Walk-in / POS</option>
                <option value="campaign">Marketing Campaign</option>
                <option value="manual">Cold Outreach / Manual</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">Notes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
              placeholder="Project requirements, timing..."
              className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
            <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit">Create Lead</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
