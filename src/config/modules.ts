// NEXUS Module System
// Each module represents a feature set that can be enabled per organisation.
// Module availability is controlled by the organisation plan and configuration.
// KDOS will eventually control module entitlements through the licensing API.

export type ModuleId =
  | "pos"
  | "inventory"
  | "purchasing"
  | "crm"
  | "leads"
  | "finance"
  | "reports"
  | "automation"
  | "hr"
  | "projects"
  | "documents"
  | "website"
  | "analytics"
  | "ai_assistant";

export interface NexusModule {
  id: ModuleId;
  name: string;
  description: string;
  category: "operations" | "commerce" | "people" | "intelligence" | "growth";
  requiredModules?: ModuleId[];
  plans: NexusPlan[];
}

export type NexusPlan = "starter" | "business" | "professional" | "enterprise";

export const NEXUS_MODULES: Record<ModuleId, NexusModule> = {
  pos: {
    id: "pos",
    name: "Point of Sale",
    description: "Multi-terminal POS with sessions, payments and receipts",
    category: "commerce",
    requiredModules: ["inventory"],
    plans: ["business", "professional", "enterprise"],
  },
  inventory: {
    id: "inventory",
    name: "Inventory",
    description: "Stock management, movements, transfers and intelligence",
    category: "operations",
    plans: ["starter", "business", "professional", "enterprise"],
  },
  purchasing: {
    id: "purchasing",
    name: "Purchasing",
    description: "Purchase orders, supplier management and goods receiving",
    category: "operations",
    requiredModules: ["inventory"],
    plans: ["business", "professional", "enterprise"],
  },
  crm: {
    id: "crm",
    name: "CRM",
    description: "Customer profiles, purchase history and relationship management",
    category: "commerce",
    plans: ["starter", "business", "professional", "enterprise"],
  },
  leads: {
    id: "leads",
    name: "Leads",
    description: "Sales pipeline, lead tracking and opportunity management",
    category: "growth",
    requiredModules: ["crm"],
    plans: ["business", "professional", "enterprise"],
  },
  finance: {
    id: "finance",
    name: "Finance",
    description: "Revenue tracking, expenses, payments and financial summaries",
    category: "operations",
    plans: ["business", "professional", "enterprise"],
  },
  reports: {
    id: "reports",
    name: "Reports",
    description: "Business reports, performance analytics and exports",
    category: "intelligence",
    plans: ["starter", "business", "professional", "enterprise"],
  },
  automation: {
    id: "automation",
    name: "Automation",
    description: "Event-driven rules, workflows and automated recommendations",
    category: "intelligence",
    plans: ["professional", "enterprise"],
  },
  hr: {
    id: "hr",
    name: "Human Resources",
    description: "Employee management, roles, scheduling and HR records",
    category: "people",
    plans: ["professional", "enterprise"],
  },
  projects: {
    id: "projects",
    name: "Projects",
    description: "Project management, tasks and team collaboration",
    category: "operations",
    plans: ["professional", "enterprise"],
  },
  documents: {
    id: "documents",
    name: "Documents",
    description: "Document storage, management and sharing",
    category: "operations",
    plans: ["professional", "enterprise"],
  },
  website: {
    id: "website",
    name: "Website",
    description: "Business website creation with owner approval workflow",
    category: "growth",
    plans: ["professional", "enterprise"],
  },
  analytics: {
    id: "analytics",
    name: "Analytics",
    description: "Advanced business intelligence and trend analysis",
    category: "intelligence",
    plans: ["enterprise"],
  },
  ai_assistant: {
    id: "ai_assistant",
    name: "AI Assistant",
    description: "KDOS-powered AI insights, recommendations and automation",
    category: "intelligence",
    plans: ["professional", "enterprise"],
  },
};

// Plan definitions
export const NEXUS_PLANS: Record<NexusPlan, { name: string; description: string; moduleLimit: number | null }> = {
  starter:      { name: "Starter",      description: "Essential tools for small businesses",           moduleLimit: 4    },
  business:     { name: "Business",     description: "Full operations for growing businesses",         moduleLimit: 8    },
  professional: { name: "Professional", description: "Advanced capabilities for established businesses",moduleLimit: null },
  enterprise:   { name: "Enterprise",   description: "Full platform with AI and advanced intelligence", moduleLimit: null },
};

// Module entitlement context
// In production this is fetched from Supabase and validated against KDOS licensing.
// In development, all modules are enabled.
export interface ModuleEntitlement {
  organisationId: string;
  plan: NexusPlan;
  enabledModules: ModuleId[];
  customLimits?: Partial<Record<ModuleId, Record<string, number>>>;
}

export function isModuleEnabled(entitlement: ModuleEntitlement, moduleId: ModuleId): boolean {
  return entitlement.enabledModules.includes(moduleId);
}

export function getEnabledModules(entitlement: ModuleEntitlement): NexusModule[] {
  return entitlement.enabledModules
    .map(id => NEXUS_MODULES[id])
    .filter(Boolean);
}

export function canEnableModule(entitlement: ModuleEntitlement, moduleId: ModuleId): boolean {
  const mod = NEXUS_MODULES[moduleId];
  if (!mod) return false;
  if (!mod.plans.includes(entitlement.plan)) return false;
  if (mod.requiredModules) {
    return mod.requiredModules.every(dep => entitlement.enabledModules.includes(dep));
  }
  return true;
}

// Development entitlement — all modules enabled
export const DEV_ENTITLEMENT: ModuleEntitlement = {
  organisationId: "demo-business-001",
  plan: "enterprise",
  enabledModules: Object.keys(NEXUS_MODULES) as ModuleId[],
};
