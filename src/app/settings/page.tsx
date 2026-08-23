"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DEMO_BUSINESS, DEMO_BRANCHES } from "@/data/demo-business";
import { Building2, GitBranch, Shield, Bell, Zap, CreditCard } from "lucide-react";

const SECTIONS = [
  { id: "business",    label: "Business Profile",   icon: Building2  },
  { id: "branches",    label: "Branches",           icon: GitBranch  },
  { id: "permissions", label: "Roles & Permissions",icon: Shield     },
  { id: "notifications",label: "Notifications",     icon: Bell       },
  { id: "automation",  label: "Automation",         icon: Zap        },
  { id: "billing",     label: "Billing & Plan",     icon: CreditCard },
];

export default function SettingsPage() {
  const [section, setSection] = useState("business");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-primary">Settings</h1>
        <p className="text-sm text-secondary mt-0.5">Business configuration and preferences</p>
      </div>

      <div className="flex gap-5">
        <div className="w-48 shrink-0 space-y-0.5">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className={[
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left",
                  section === s.id ? "bg-accent-subtle accent" : "text-secondary hover:text-primary hover:bg-page",
                ].join(" ")}
              >
                <Icon size={15} />
                {s.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 space-y-4">
          {section === "business" && (
            <Card>
              <CardHeader><CardTitle>Business Profile</CardTitle><Button size="sm">Save Changes</Button></CardHeader>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Business Name",         value: DEMO_BUSINESS.name },
                  { label: "Trading Name",          value: DEMO_BUSINESS.tradingName ?? "" },
                  { label: "Registration Number",   value: DEMO_BUSINESS.registrationNumber ?? "" },
                  { label: "Tax Number (VAT)",      value: DEMO_BUSINESS.taxNumber ?? "" },
                  { label: "Phone",                 value: DEMO_BUSINESS.contact.phone ?? "" },
                  { label: "Email",                 value: DEMO_BUSINESS.contact.email ?? "" },
                  { label: "Website",               value: DEMO_BUSINESS.contact.website ?? "" },
                  { label: "Timezone",              value: DEMO_BUSINESS.timezone },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="block text-xs font-medium text-muted mb-1">{f.label}</label>
                    <input
                      defaultValue={f.value}
                      className="w-full px-3 py-2 text-sm bg-page border border-base rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-base grid grid-cols-2 gap-4">
                {[
                  { label: "Default Tax Rate (%)", value: String(DEMO_BUSINESS.settings.defaultTaxRate) },
                  { label: "Currency",             value: DEMO_BUSINESS.currency.code },
                  { label: "Invoice Prefix",       value: DEMO_BUSINESS.settings.invoicePrefix },
                  { label: "PO Prefix",            value: DEMO_BUSINESS.settings.purchaseOrderPrefix },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="block text-xs font-medium text-muted mb-1">{f.label}</label>
                    <input defaultValue={f.value} className="w-full px-3 py-2 text-sm bg-page border border-base rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {section === "branches" && (
            <Card>
              <CardHeader><CardTitle>Branches</CardTitle><Button size="sm">Add Branch</Button></CardHeader>
              <div className="space-y-3">
                {DEMO_BRANCHES.map((b) => (
                  <div key={b.id} className="flex items-center justify-between p-4 rounded-lg border border-base hover:bg-page transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-primary">{b.name}</p>
                        {b.isHeadOffice && <Badge variant="default">Head Office</Badge>}
                        <Badge variant="success">{b.status}</Badge>
                      </div>
                      <p className="text-xs text-muted mt-0.5">{b.address.line1}, {b.address.city}</p>
                      <p className="text-xs text-muted">{b.contact.phone} · {b.contact.email}</p>
                    </div>
                    <Button variant="secondary" size="sm">Edit</Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {section === "permissions" && (
            <Card>
              <CardHeader><CardTitle>Roles & Permissions</CardTitle></CardHeader>
              <div className="space-y-2">
                {["Owner","Manager","Cashier","Stock Controller","Purchasing","Accountant","Marketing","Administrator"].map((role) => (
                  <div key={role} className="flex items-center justify-between px-4 py-3 rounded-lg border border-base hover:bg-page transition-colors">
                    <div>
                      <p className="font-medium text-primary text-sm">{role}</p>
                      <p className="text-xs text-muted">Permission set active</p>
                    </div>
                    <Button variant="ghost" size="sm">Configure</Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {(section === "notifications" || section === "automation" || section === "billing") && (
            <Card>
              <CardHeader><CardTitle>{SECTIONS.find(s => s.id === section)?.label}</CardTitle></CardHeader>
              <div className="py-8 text-center">
                <p className="text-sm text-muted">This section will be configured in a later phase.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
