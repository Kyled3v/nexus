"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { CheckCircle2, Building2, MapPin, ShieldCheck, Bell, CreditCard, Share2, Globe, Key } from "lucide-react";
import { DEMO_BUSINESS, DEMO_BRANCHES } from "@/data/demo-business";
import type { Branch } from "@/domain/business/types";

const SECTIONS = [
  { id: "business",      label: "Business Profile",    icon: Building2 },
  { id: "branches",      label: "Branches",            icon: MapPin },
  { id: "channels",      label: "Social & Marketing",  icon: Share2 },
  { id: "permissions",   label: "Roles & Permissions", icon: ShieldCheck },
  { id: "notifications", label: "Notifications",       icon: Bell },
  { id: "billing",       label: "Billing & Plan",      icon: CreditCard },
];

const ROLES = [
  { name: "Owner", count: 1, desc: "Full administrative & financial authority", permissions: ["ALL_PERMISSIONS", "FINANCE_MANAGE", "ORG_DELETE"] },
  { name: "Store Manager", count: 2, desc: "Inventory adjustments, staff oversight, and reporting", permissions: ["STOCK_MANAGE", "POS_SELL", "REPORTS_VIEW", "PURCHASING_MANAGE"] },
  { name: "Cashier", count: 4, desc: "Till operations and customer checkout", permissions: ["POS_SELL", "CUSTOMER_VIEW"] },
  { name: "Stock Controller", count: 1, desc: "Warehouse stock receiving and stock counts", permissions: ["STOCK_MANAGE", "STOCK_VIEW", "PURCHASING_VIEW"] },
  { name: "Accountant", count: 1, desc: "Financial ledger, VAT reports, and invoice auditing", permissions: ["FINANCE_VIEW", "REPORTS_VIEW", "SALES_VIEW"] },
];

export default function SettingsPage() {
  const [section, setSection] = useState("business");
  const [branches, setBranches] = useState(DEMO_BRANCHES);
  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Business profile form state
  const [businessData, setBusinessData] = useState({
    name: DEMO_BUSINESS.name,
    tradingName: DEMO_BUSINESS.tradingName ?? "Trade Direct",
    registrationNumber: DEMO_BUSINESS.registrationNumber ?? "2021/892019/07",
    taxNumber: DEMO_BUSINESS.taxNumber ?? "4890123456",
    phone: DEMO_BUSINESS.contact.phone ?? "+27 11 555 0100",
    email: DEMO_BUSINESS.contact.email ?? "info@kyledev.co.za",
    website: DEMO_BUSINESS.contact.website ?? "https://nexus-erp.co.za",
    timezone: DEMO_BUSINESS.timezone,
    taxRate: String(DEMO_BUSINESS.settings.defaultTaxRate),
    currency: DEMO_BUSINESS.currency.code,
    invoicePrefix: DEMO_BUSINESS.settings.invoicePrefix,
    poPrefix: DEMO_BUSINESS.settings.purchaseOrderPrefix,
  });

  // Branch form state
  const [newBranch, setNewBranch] = useState({
    name: "",
    code: "",
    address: "",
    city: "Johannesburg",
    phone: "",
    email: "",
  });

  // Channels state
  const [channels, setChannels] = useState([
    {
      id: "meta",
      name: "Meta for Business (Instagram & Facebook)",
      handle: "@welcomepaint_sa",
      pageId: "fb_page_89210934",
      connected: true,
      iconColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      description: "Auto-publishes feed posts, promotional stories, and product reels across Facebook & Instagram.",
      lastSync: "Today, 06:40 SAST",
    },
    {
      id: "linkedin",
      name: "LinkedIn Commercial Page",
      handle: "Welcome Paint Center Commercial",
      pageId: "urn:li:organization:7812903",
      connected: true,
      iconColor: "text-sky-400 bg-sky-500/10 border-sky-500/20",
      description: "B2B contractor case studies, commercial architectural coating specs, and SARS VAT trade credit highlights.",
      lastSync: "Yesterday, 14:15 SAST",
    },
    {
      id: "gmb",
      name: "Google Business Profile (Local SEO)",
      handle: "Sandton Central & Durban Hubs",
      pageId: "gmb_loc_sandton_01",
      connected: true,
      iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      description: "Local store updates, special holiday trading hours, and computerized paint-tinting turnarounds to boost Google Maps ranking.",
      lastSync: "Today, 07:00 SAST",
    },
    {
      id: "whatsapp",
      name: "WhatsApp Business Cloud API",
      handle: "+27 11 555 0100 (Trade Desk)",
      pageId: "waba_phone_992140",
      connected: true,
      iconColor: "text-green-400 bg-green-500/10 border-green-500/20",
      description: "Direct trade contractor broadcast specials, PDF tax invoice links, and instant quotation follow-ups.",
      lastSync: "Today, 06:50 SAST",
    },
  ]);

  const toggleChannel = (id: string) => {
    setChannels(prev => prev.map(c => {
      if (c.id === id) {
        const nextState = !c.connected;
        showToast(`${c.name} ${nextState ? "connected successfully" : "disconnected"}`);
        return { ...c, connected: nextState };
      }
      return c;
    }));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Business profile updated successfully!");
  };

  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    const createdBranch: Branch = {
      id: "br-" + Date.now(),
      businessId: DEMO_BUSINESS.id,
      name: newBranch.name,
      code: newBranch.code || "BR-" + (branches.length + 1),
      isHeadOffice: false,
      status: "active",
      address: { line1: newBranch.address, city: newBranch.city, country: "South Africa" },
      contact: { phone: newBranch.phone, email: newBranch.email },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setBranches(prev => [...prev, createdBranch]);
    setIsAddBranchOpen(false);
    showToast(`Branch ${createdBranch.name} created!`);
  };

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
          <h1 className="page-header__title">Settings</h1>
          <p className="page-header__sub">Business configuration, multi-branch, and system preferences</p>
        </div>
      </header>

      <div className="settings-layout">
        <nav className="settings-nav" aria-label="Settings sections">
          <ul>
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              return (
                <li key={s.id}>
                  <button
                    onClick={() => setSection(s.id)}
                    aria-current={section === s.id ? "page" : undefined}
                    className={["settings-nav__item flex items-center gap-2", section === s.id ? "settings-nav__item--active" : ""].join(" ").trim()}
                  >
                    <Icon size={15} />
                    <span>{s.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="settings-content">
          {section === "business" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between w-full">
                  <CardTitle>Business Legal Profile</CardTitle>
                  <Button size="sm" onClick={handleSaveProfile}>Save Changes</Button>
                </div>
              </CardHeader>
              <form className="settings-form" onSubmit={handleSaveProfile}>
                <div className="form-field">
                  <label htmlFor="name">Business Legal Name</label>
                  <input
                    id="name"
                    value={businessData.name}
                    onChange={e => setBusinessData(p => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="tradingName">Trading Name</label>
                  <input
                    id="tradingName"
                    value={businessData.tradingName}
                    onChange={e => setBusinessData(p => ({ ...p, tradingName: e.target.value }))}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="registrationNumber">Company Reg Number</label>
                  <input
                    id="registrationNumber"
                    value={businessData.registrationNumber}
                    onChange={e => setBusinessData(p => ({ ...p, registrationNumber: e.target.value }))}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="taxNumber">VAT Number</label>
                  <input
                    id="taxNumber"
                    value={businessData.taxNumber}
                    onChange={e => setBusinessData(p => ({ ...p, taxNumber: e.target.value }))}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="phone">Official Telephone</label>
                  <input
                    id="phone"
                    value={businessData.phone}
                    onChange={e => setBusinessData(p => ({ ...p, phone: e.target.value }))}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="email">Official Email</label>
                  <input
                    id="email"
                    value={businessData.email}
                    onChange={e => setBusinessData(p => ({ ...p, email: e.target.value }))}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="taxRate">Default VAT Rate (%)</label>
                  <input
                    id="taxRate"
                    value={businessData.taxRate}
                    onChange={e => setBusinessData(p => ({ ...p, taxRate: e.target.value }))}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="invoicePrefix">Invoice Prefix</label>
                  <input
                    id="invoicePrefix"
                    value={businessData.invoicePrefix}
                    onChange={e => setBusinessData(p => ({ ...p, invoicePrefix: e.target.value }))}
                  />
                </div>
              </form>
            </Card>
          )}

          {section === "branches" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between w-full">
                  <CardTitle>Branch Locations & Warehouses</CardTitle>
                  <Button size="sm" onClick={() => setIsAddBranchOpen(true)}>Add Branch</Button>
                </div>
              </CardHeader>
              <ul className="branch-list">
                {branches.map((b) => (
                  <li key={b.id} className="branch-list__item">
                    <div className="branch-list__body">
                      <div className="flex items-center gap-2">
                        <strong className="text-white text-base">{b.name}</strong>
                        {b.isHeadOffice && <Badge variant="default">Head Office</Badge>}
                        <Badge variant="success">{b.status}</Badge>
                      </div>
                      <p className="text-white/60 text-xs mt-1">{b.address.line1}, {b.address.city}</p>
                      <p className="text-white/40 text-xs">{b.contact.phone} · {b.contact.email}</p>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => showToast(`Editing branch ${b.name}`)}>
                      Edit Branch
                    </Button>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {section === "channels" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <CardTitle>Connected Social & Marketing Channels</CardTitle>
                      <p className="text-xs text-white/50 mt-1">
                        Active integration bridges managed by KDOS Self-Marketing (KDOS-MKT-07) and Social Media (KDOS-SOC-08) agents
                      </p>
                    </div>
                    <Badge variant="success" className="flex items-center gap-1">
                      <Globe size={12} /> 4 Channels Operational
                    </Badge>
                  </div>
                </CardHeader>

                <div className="space-y-3 p-1">
                  {channels.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-lg border text-sm font-semibold ${c.iconColor}`}>
                          <Share2 size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-white text-sm font-semibold">{c.name}</strong>
                            <Badge variant={c.connected ? "success" : "muted"}>
                              {c.connected ? "Active & Linked" : "Disconnected"}
                            </Badge>
                          </div>
                          <p className="text-xs text-white/60 mt-1 max-w-xl leading-relaxed">
                            {c.description}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-[11px] text-white/40">
                            <span>Account: <strong className="text-white/70">{c.handle}</strong></span>
                            <span>•</span>
                            <span>ID: <code className="bg-black/30 px-1.5 py-0.5 rounded text-cyan-400 font-mono text-[10px]">{c.pageId}</code></span>
                            <span>•</span>
                            <span>Last Synced: {c.lastSync}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center">
                        <Button
                          variant={c.connected ? "secondary" : "primary"}
                          size="sm"
                          onClick={() => toggleChannel(c.id)}
                        >
                          {c.connected ? "Disconnect" : "Connect via OAuth"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Developer & Platform Requirements Guide */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Key size={16} className="text-amber-400" />
                    <CardTitle>What You Need: Production Credentials & Developer Setup</CardTitle>
                  </div>
                  <p className="text-xs text-white/50 mt-1">
                    To link your official business accounts for live broadcast and automated post dispatching, here are the required credentials from each provider:
                  </p>
                </CardHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-white text-sm flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-400" /> Meta for Business
                      </strong>
                      <span className="text-[11px] text-white/40">Instagram & Facebook</span>
                    </div>
                    <ul className="text-white/60 space-y-1.5 list-disc pl-4 text-[11px]">
                      <li><strong>Meta Developer App</strong> created at <code className="text-cyan-300">developers.facebook.com</code></li>
                      <li>Permissions: <code className="text-amber-300">pages_manage_posts</code>, <code className="text-amber-300">instagram_content_publish</code></li>
                      <li>Facebook Business Page linked to an Instagram Professional Account.</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-white text-sm flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-sky-400" /> LinkedIn Commercial
                      </strong>
                      <span className="text-[11px] text-white/40">B2B Trade Network</span>
                    </div>
                    <ul className="text-white/60 space-y-1.5 list-disc pl-4 text-[11px]">
                      <li><strong>LinkedIn Developer App</strong> created at <code className="text-cyan-300">developer.linkedin.com</code></li>
                      <li>Permissions: <code className="text-amber-300">w_organization_social</code> (Share on LinkedIn API)</li>
                      <li>Admin rights on your company’s LinkedIn Page.</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-white text-sm flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" /> Google Business Profile
                      </strong>
                      <span className="text-[11px] text-white/40">Local Store SEO</span>
                    </div>
                    <ul className="text-white/60 space-y-1.5 list-disc pl-4 text-[11px]">
                      <li><strong>Google Cloud Project</strong> with <code className="text-cyan-300">Google My Business API</code> enabled</li>
                      <li>OAuth Scope: <code className="text-amber-300">https://www.googleapis.com/auth/business.manage</code></li>
                      <li>Verified physical store addresses (e.g. Sandton Trade Counter).</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-white text-sm flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-green-400" /> WhatsApp Cloud API
                      </strong>
                      <span className="text-[11px] text-white/40">Contractor Broadcasts</span>
                    </div>
                    <ul className="text-white/60 space-y-1.5 list-disc pl-4 text-[11px]">
                      <li><strong>WhatsApp Business Platform</strong> Account (Meta Business Manager)</li>
                      <li>A dedicated South African business phone number (e.g. <code className="text-cyan-300">+27 11 555 0100</code>)</li>
                      <li>Opted-in contractor database for SARS invoice delivery and clearance promos.</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {section === "permissions" && (
            <Card>
              <CardHeader><CardTitle>Roles & Access Governance</CardTitle></CardHeader>
              <ul className="role-list">
                {ROLES.map((role) => (
                  <li key={role.name} className="role-list__item">
                    <div className="role-list__body">
                      <div className="flex items-center gap-2">
                        <strong className="text-white">{role.name}</strong>
                        <Badge variant="muted">{role.count} assigned</Badge>
                      </div>
                      <p className="text-xs text-white/60 mt-0.5">{role.desc}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {role.permissions.map(p => (
                          <code key={p} className="text-[10px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-white/50">
                            {p}
                          </code>
                        ))}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => showToast(`Configuring role permissions for ${role.name}`)}>
                      Configure
                    </Button>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {section === "notifications" && (
            <Card>
              <CardHeader><CardTitle>Notification Channels & Alerts</CardTitle></CardHeader>
              <div className="space-y-4 text-xs">
                {[
                  { title: "Low Stock Trigger Alerts", desc: "Instant alert when inventory hits reorder thresholds", enabled: true },
                  { title: "Daily Sales Summary", desc: "End of day revenue and cash reconciliation report", enabled: true },
                  { title: "Large Purchase Order Approvals", desc: "Orders over R10,000 require executive sign-off", enabled: true },
                  { title: "Till Cash Difference Warning", desc: "Discrepancy alerts on shift closures", enabled: false },
                ].map((n) => (
                  <div key={n.title} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                    <div>
                      <strong className="text-white block text-sm">{n.title}</strong>
                      <span className="text-white/50">{n.desc}</span>
                    </div>
                    <Badge variant={n.enabled ? "success" : "muted"}>
                      {n.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {section === "billing" && (
            <Card>
              <CardHeader><CardTitle>Subscription & Entitlements</CardTitle></CardHeader>
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 to-blue-950/40 border border-cyan-500/30 flex justify-between items-center">
                  <div>
                    <Badge variant="default" className="mb-1">ENTERPRISE PLAN</Badge>
                    <h4 className="text-white text-base font-bold">NEXUS All-Access & KDOS AI Engine</h4>
                    <p className="text-white/60">Active licence provided by KyleDev Software Systems Pty Ltd</p>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-white/40 block">Branches</span>
                    <strong className="text-white text-base">Unlimited</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-white/40 block">User Seats</span>
                    <strong className="text-white text-base">Unlimited</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-white/40 block">KDOS Engine</span>
                    <strong className="text-cyan-400 text-base">Enabled</strong>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Add Branch Modal */}
      <Modal
        isOpen={isAddBranchOpen}
        onClose={() => setIsAddBranchOpen(false)}
        title="Add New Branch Location"
        description="Register a secondary outlet or warehouse depot"
      >
        <form onSubmit={handleAddBranch} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Branch Name *</label>
              <input
                required
                type="text"
                value={newBranch.name}
                onChange={e => setNewBranch(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Pretoria North Depot"
                className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Branch Code</label>
              <input
                type="text"
                value={newBranch.code}
                onChange={e => setNewBranch(p => ({ ...p, code: e.target.value }))}
                placeholder="e.g. BR-PTA02"
                className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">Street Address</label>
            <input
              type="text"
              value={newBranch.address}
              onChange={e => setNewBranch(p => ({ ...p, address: e.target.value }))}
              placeholder="e.g. 144 Zambesi Drive"
              className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">City</label>
              <input
                type="text"
                value={newBranch.city}
                onChange={e => setNewBranch(p => ({ ...p, city: e.target.value }))}
                className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Phone</label>
              <input
                type="tel"
                value={newBranch.phone}
                onChange={e => setNewBranch(p => ({ ...p, phone: e.target.value }))}
                placeholder="+27 12 555 0199"
                className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Email</label>
              <input
                type="email"
                value={newBranch.email}
                onChange={e => setNewBranch(p => ({ ...p, email: e.target.value }))}
                placeholder="pta@kyledev.co.za"
                className="w-full bg-[#161c24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
            <Button type="button" variant="ghost" onClick={() => setIsAddBranchOpen(false)}>Cancel</Button>
            <Button type="submit">Create Branch</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
