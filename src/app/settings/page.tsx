"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DEMO_BUSINESS, DEMO_BRANCHES } from "@/data/demo-business";

const SECTIONS = [
  { id: "business",      label: "Business Profile"    },
  { id: "branches",      label: "Branches"            },
  { id: "permissions",   label: "Roles & Permissions" },
  { id: "notifications", label: "Notifications"       },
  { id: "automation",    label: "Automation"          },
  { id: "billing",       label: "Billing & Plan"      },
];

const ROLES = ["Owner","Manager","Cashier","Stock Controller","Purchasing","Accountant","Marketing","Administrator"];

export default function SettingsPage() {
  const [section, setSection] = useState("business");

  return (
    <div className="page">
      <header className="page-header">
        <div className="page-header__text">
          <h1 className="page-header__title">Settings</h1>
          <p className="page-header__sub">Business configuration and preferences</p>
        </div>
      </header>

      <div className="settings-layout">
        <nav className="settings-nav" aria-label="Settings sections">
          <ul>
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <button onClick={() => setSection(s.id)} aria-current={section === s.id ? "page" : undefined} className={["settings-nav__item", section === s.id ? "settings-nav__item--active" : ""].join(" ").trim()}>
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="settings-content">
          {section === "business" && (
            <Card>
              <CardHeader><CardTitle>Business Profile</CardTitle><Button size="sm">Save Changes</Button></CardHeader>
              <form className="settings-form" onSubmit={(e) => e.preventDefault()}>
                {[
                  { label: "Business Name",       name: "name",               value: DEMO_BUSINESS.name },
                  { label: "Trading Name",         name: "tradingName",        value: DEMO_BUSINESS.tradingName ?? "" },
                  { label: "Registration Number",  name: "registrationNumber", value: DEMO_BUSINESS.registrationNumber ?? "" },
                  { label: "Tax Number (VAT)",     name: "taxNumber",          value: DEMO_BUSINESS.taxNumber ?? "" },
                  { label: "Phone",                name: "phone",              value: DEMO_BUSINESS.contact.phone ?? "" },
                  { label: "Email",                name: "email",              value: DEMO_BUSINESS.contact.email ?? "" },
                  { label: "Website",              name: "website",            value: DEMO_BUSINESS.contact.website ?? "" },
                  { label: "Timezone",             name: "timezone",           value: DEMO_BUSINESS.timezone },
                  { label: "Default Tax Rate (%)", name: "taxRate",            value: String(DEMO_BUSINESS.settings.defaultTaxRate) },
                  { label: "Currency",             name: "currency",           value: DEMO_BUSINESS.currency.code },
                  { label: "Invoice Prefix",       name: "invoicePrefix",      value: DEMO_BUSINESS.settings.invoicePrefix },
                  { label: "PO Prefix",            name: "poPrefix",           value: DEMO_BUSINESS.settings.purchaseOrderPrefix },
                ].map((f) => (
                  <div key={f.name} className="form-field">
                    <label htmlFor={f.name}>{f.label}</label>
                    <input id={f.name} name={f.name} defaultValue={f.value} />
                  </div>
                ))}
              </form>
            </Card>
          )}

          {section === "branches" && (
            <Card>
              <CardHeader><CardTitle>Branches</CardTitle><Button size="sm">Add Branch</Button></CardHeader>
              <ul className="branch-list">
                {DEMO_BRANCHES.map((b) => (
                  <li key={b.id} className="branch-list__item">
                    <div className="branch-list__body">
                      <strong>{b.name}</strong>
                      {b.isHeadOffice && <Badge variant="default">Head Office</Badge>}
                      <Badge variant="success">{b.status}</Badge>
                      <p>{b.address.line1}, {b.address.city}</p>
                      <p>{b.contact.phone} · {b.contact.email}</p>
                    </div>
                    <Button variant="secondary" size="sm">Edit</Button>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {section === "permissions" && (
            <Card>
              <CardHeader><CardTitle>Roles and Permissions</CardTitle></CardHeader>
              <ul className="role-list">
                {ROLES.map((role) => (
                  <li key={role} className="role-list__item">
                    <div className="role-list__body">
                      <strong>{role}</strong>
                      <p>Permission set active</p>
                    </div>
                    <Button variant="ghost" size="sm">Configure</Button>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {["notifications","automation","billing"].includes(section) && (
            <Card>
              <CardHeader><CardTitle>{SECTIONS.find(s => s.id === section)?.label}</CardTitle></CardHeader>
              <p className="empty-state">This section will be configured in a later phase.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
