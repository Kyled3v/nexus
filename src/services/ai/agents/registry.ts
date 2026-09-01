import { AgentProfile, AgentAction, AgentLogEntry } from "./types";

export const AGENT_PROFILES: AgentProfile[] = [
  {
    id: "orchestrator",
    name: "KDOS Master Orchestrator",
    code: "KDOS-ORCH-01",
    title: "Autonomous Enterprise Operations Director",
    description: "Coordinates all specialized sub-agents, resolves conflicting recommendations, and provides unified executive decision intelligence.",
    specialization: "Multi-Agent Coordination & Executive Decisions",
    iconName: "Cpu",
    accentColor: "text-indigo-400 border-indigo-500/30",
    badgeBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    status: "active",
    capabilities: [
      "Autonomous Agent Task Delegation",
      "Executive Financial & Operational Synthesis",
      "Conflicting Strategy Arbitration",
      "Natural Language Ledger Q&A"
    ],
    schedule: "Continuous (Every 15 min)",
    lastRunTime: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    pendingActionsCount: 3,
  },
  {
    id: "inventory",
    name: "Stock & Replenishment Agent",
    code: "KDOS-INV-02",
    title: "Inventory Intelligence & Replenishment Specialist",
    description: "Monitors stock levels across central DC and retail branches. Predicts stockout velocity and automatically proposes optimized supplier Purchase Orders.",
    specialization: "Reorder Forecasting, Stockouts & Safety Stock",
    iconName: "Warehouse",
    accentColor: "text-emerald-400 border-emerald-500/30",
    badgeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    status: "active",
    capabilities: [
      "Dynamic Safety Stock Recalculation",
      "Supplier Lead Time & MOQ Optimization",
      "Automated Draft Purchase Order Generation",
      "Imminent Stockout Velocity Prediction"
    ],
    schedule: "Every 30 min",
    lastRunTime: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    pendingActionsCount: 2,
  },
  {
    id: "pricing",
    name: "Pricing & Margin Optimization Agent",
    code: "KDOS-PRC-03",
    title: "Commercial Margin & Elasticity Strategist",
    description: "Identifies capital trapped in dead or slow-moving stock, proposes clearance discounts, and safeguards gross profit margins on fast-moving coatings.",
    specialization: "Gross Profit Margins, Dynamic Markups & Clearance",
    iconName: "DollarSign",
    accentColor: "text-amber-400 border-amber-500/30",
    badgeBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    status: "active",
    capabilities: [
      "Slow-Moving Capital Clearance Analysis",
      "Gross Margin Elasticity Modeling",
      "Contractor Tiered Discount Recommendations",
      "Inflation & Supplier Price Hike Adjustment"
    ],
    schedule: "Every 2 hours",
    lastRunTime: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    pendingActionsCount: 1,
  },
  {
    id: "debtor",
    name: "Finance & SARS Debtor Recovery Agent",
    code: "KDOS-FIN-04",
    title: "Accounts Receivable & Working Capital Guard",
    description: "Tracks aging balances (30/60/90 days), enforces SARS tax compliance, identifies credit breach risks, and drafts automated debt collection notices.",
    specialization: "Accounts Receivable, SARS Tax & Credit Control",
    iconName: "FileText",
    accentColor: "text-rose-400 border-rose-500/30",
    badgeBg: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    status: "active",
    capabilities: [
      "30/60/90 Day Aging Exposure Tracking",
      "SARS 15% VAT Invoicing Compliance Audit",
      "Debtor Credit Limit Hold Triggers",
      "Automated Statement & Reminder Notice Drafting"
    ],
    schedule: "Hourly",
    lastRunTime: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    pendingActionsCount: 2,
  },
  {
    id: "logistics",
    name: "Inter-Branch Logistics Agent",
    code: "KDOS-LOG-05",
    title: "Multi-Location Dispatch & Route Balancer",
    description: "Monitors warehouse-to-store shipments, detects delayed or anomalous waybills, and balances inventory from overstocked branches to deficit stores.",
    specialization: "Inter-Branch Stock Transfers & Waybill Tracking",
    iconName: "Truck",
    accentColor: "text-cyan-400 border-cyan-500/30",
    badgeBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    status: "active",
    capabilities: [
      "Inter-Branch Cross-Docking & Rebalancing",
      "Waybill In-Transit SLA Tracking",
      "Goods Received Voucher (GRV) Reconciliation",
      "Multi-Branch Stock Deficit Resolution"
    ],
    schedule: "Every 45 min",
    lastRunTime: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    pendingActionsCount: 1,
  },
  {
    id: "sales",
    name: "CRM & Deal Acceleration Agent",
    code: "KDOS-CRM-06",
    title: "Sales Pipeline & Trade Account Growth Specialist",
    description: "Analyzes contractor sales cycles, identifies dormant commercial accounts, and recommends proactive quote follow-ups for high-probability deals.",
    specialization: "Commercial Trade Accounts & Deal Velocity",
    iconName: "TrendingUp",
    accentColor: "text-purple-400 border-purple-500/30",
    badgeBg: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    status: "active",
    capabilities: [
      "Dormant Contractor Account Reactivation",
      "High-Value Quotation Follow-up Triggers",
      "Pipeline Stage Bottleneck Detection",
      "Contractor Reorder Cycle Prediction"
    ],
    schedule: "Every 3 hours",
    lastRunTime: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    pendingActionsCount: 1,
  },
  {
    id: "marketing",
    name: "Self-Marketing & Campaign Agent",
    code: "KDOS-MKT-07",
    title: "Omni-Channel Campaign & Clearance Promotion Strategist",
    description: "Formulates high-ROI trade contractor campaigns, aligns discount promotions with overstocked inventory lines, and automates WhatsApp/Email contractor outreach.",
    specialization: "Commercial Campaigns, Lead Generation & Overstock Monetization",
    iconName: "Megaphone",
    accentColor: "text-amber-400 border-amber-500/30",
    badgeBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    status: "active",
    capabilities: [
      "Contractor Broadcast Campaign Generation",
      "Overstocked Inventory Clearance Specials",
      "Email & WhatsApp Copywriting",
      "Campaign ROI & Conversion Forecasting",
      "Promotional Pricing Guardrails"
    ],
    schedule: "Daily at 07:00",
    lastRunTime: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    pendingActionsCount: 1,
  },
  {
    id: "social",
    name: "Social Media & Engagement Agent",
    code: "KDOS-SOC-08",
    title: "Multi-Platform Content Planner & Local SEO Specialist",
    description: "Plans, drafts, and schedules high-engagement social media posts across Instagram, Facebook, LinkedIn, and Google Business Profile with localized hashtag strategies.",
    specialization: "Social Content Calendars, Creative Hooks & Local Foot Traffic",
    iconName: "Share2",
    accentColor: "text-pink-400 border-pink-500/30",
    badgeBg: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    status: "active",
    capabilities: [
      "7-Day Multi-Platform Content Scheduling",
      "Visual Creative Prompts & Split-Image Demos",
      "Google Business Profile Local SEO Updates",
      "Hashtag & Peak Time Engagement Optimization",
      "Human-in-the-Loop Post Publishing Workflow"
    ],
    schedule: "Daily at 08:00",
    lastRunTime: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
    pendingActionsCount: 1,
  },
];

// In-memory state store for interactive Agent Actions
const agentActionsStore: AgentAction[] = [
  {
    id: "act-inv-001",
    agentId: "inventory",
    title: "Auto-Generate PO for Plascon Velvaglo White 5L",
    description: "Stock reached 0 units (below reorder threshold of 10). Recommend raising PO for 35 units from Plascon South Africa.",
    category: "purchase_order",
    severity: "critical",
    estimatedImpact: "Prevents R14,200/wk in lost till revenue",
    payload: {
      productId: "prod-002",
      productName: "Plascon Velvaglo White 5L",
      supplierId: "sup-002",
      supplierName: "Plascon South Africa",
      recommendedQty: 35,
      estimatedCostZAR: 15750,
    },
    status: "pending_approval",
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
  {
    id: "act-inv-002",
    agentId: "inventory",
    title: "Replenish Mineral Turpentine 5L at Sandton Branch",
    description: "Sandton branch inventory at 3 units (safety min: 8). Supplier lead time is 4 days.",
    category: "purchase_order",
    severity: "high",
    estimatedImpact: "Avoids project stoppage for 4 commercial painters",
    payload: {
      productId: "prod-004",
      productName: "Powafix Mineral Turpentine 5L",
      supplierId: "sup-003",
      supplierName: "Powafix Chemicals",
      recommendedQty: 25,
      estimatedCostZAR: 3625,
    },
    status: "pending_approval",
    createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
  },
  {
    id: "act-prc-001",
    agentId: "pricing",
    title: "Apply 12% Promotional Clearance on Overstocked Enamel Primer",
    description: "Sandton branch holds 67 units vs target 40 units. Holding cost is R420/month with slow velocity.",
    category: "price_adjustment",
    severity: "medium",
    estimatedImpact: "Unlocks R8,900 in trapped working capital within 14 days",
    payload: {
      productId: "prod-005",
      productName: "Rust-Oleum Clean Metal Primer 1L",
      currentPriceZAR: 245,
      proposedPriceZAR: 215.60,
      discountPercent: 12,
    },
    status: "pending_approval",
    createdAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
  },
  {
    id: "act-fin-001",
    agentId: "debtor",
    title: "Issue Final SARS Tax Statement & Credit Hold: Apex Coatings",
    description: "Invoice #INV-2026-003 for R18,450 is 42 days overdue, exceeding credit term of 30 days.",
    category: "debtor_notice",
    severity: "high",
    estimatedImpact: "Recovers R18,450 in overdue working capital before month-end",
    payload: {
      invoiceId: "inv-003",
      invoiceNumber: "INV-2026-003",
      customerName: "Apex Industrial Coatings",
      overdueDays: 42,
      balanceDueZAR: 18450,
      action: "freeze_credit_and_send_statement",
    },
    status: "pending_approval",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "act-log-001",
    agentId: "logistics",
    title: "Rebalance 20 units Dulux Weathershield from Central DC to Durban",
    description: "Durban Branch has 2 units remaining while Central DC has 48 units. Inter-branch transfer is faster and cheaper than a new factory PO.",
    category: "stock_transfer",
    severity: "medium",
    estimatedImpact: "Saves R1,800 freight premium and fulfils pending Durban contractor order",
    payload: {
      sourceBranch: "Central Distribution Centre",
      destBranch: "Durban Commercial Hub",
      productId: "prod-001",
      quantity: 20,
    },
    status: "pending_approval",
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: "act-crm-001",
    agentId: "sales",
    title: "Reactivate High-Value Contractor: Buildmax Developments",
    description: "Account typically orders R45,000 every 3 weeks. No purchase logged in 38 days. Pipeline opportunity active.",
    category: "deal_followup",
    severity: "medium",
    estimatedImpact: "Potential R52,000 commercial order recovery",
    payload: {
      customerId: "cust-002",
      customerName: "Buildmax Developments Pty Ltd",
      lastOrderDate: "38 days ago",
      suggestedOffer: "5% Tier 1 Trade Rebate on Acrylic Bulk Packs",
    },
    status: "pending_approval",
    createdAt: new Date(Date.now() - 1000 * 60 * 70).toISOString(),
  },
  {
    id: "act-mkt-001",
    agentId: "marketing",
    title: "Launch Contractor WhatsApp Blast: Primer Clearance Special",
    description: "Send automated promo to 18 trade contractor accounts offering 25% discount on overstocked Rust-Oleum Metal Primers with Dulux 20L orders.",
    category: "campaign_launch",
    severity: "medium",
    estimatedImpact: "Projected R48,500 trade revenue & R8,900 overstock capital recovery",
    payload: {
      campaignName: "Spring Contractor Coat & Seal Special",
      channels: ["WhatsApp Broadcast", "Direct Email", "POS Counter Display"],
      targetAudience: "Tier 1 & Tier 2 Trade Contractors (18 accounts)",
      discountRate: "25% on Primer when bundled with 20L Weathershield",
    },
    status: "pending_approval",
    createdAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
  },
  {
    id: "act-soc-001",
    agentId: "social",
    title: "Publish Instagram & Facebook Campaign: 'Highveld Summer Protection'",
    description: "Schedule multi-channel social post highlighting Dulux Weathershield 20L with water-resistant demonstration visual across Facebook and Instagram.",
    category: "social_post_publish",
    severity: "low",
    estimatedImpact: "Est. reach 3,400+ targeted local DIYers & 45 contractor inquiries",
    payload: {
      platforms: ["Instagram Feed", "Facebook Page", "Google Business Profile"],
      scheduledTime: "Tomorrow, 08:30 SAST",
      productFocus: "Dulux Weathershield 20L",
      callToAction: "Visit Sandton Store / WhatsApp Trade Desk",
    },
    status: "pending_approval",
    createdAt: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
  }
];

const agentLogsStore: AgentLogEntry[] = [
  {
    id: "log-1",
    agentId: "orchestrator",
    agentName: "KDOS Master Orchestrator",
    level: "info",
    message: "Completed autonomous enterprise diagnostic sweep across 8 active modules.",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: "log-mkt",
    agentId: "marketing",
    agentName: "Self-Marketing & Campaign Agent",
    level: "action",
    message: "Formulated 'Spring Contractor Coat & Seal' campaign. Awaiting approval to dispatch.",
    timestamp: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
  },
  {
    id: "log-soc",
    agentId: "social",
    agentName: "Social Media & Engagement Agent",
    level: "info",
    message: "Generated 7-day multi-channel social calendar and drafted Instagram/LinkedIn posts.",
    timestamp: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
  },
  {
    id: "log-2",
    agentId: "inventory",
    agentName: "Stock & Replenishment Agent",
    level: "warning",
    message: "Detected 0 stock for Plascon Velvaglo White 5L. Generated PO proposal #act-inv-001.",
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
  {
    id: "log-3",
    agentId: "debtor",
    agentName: "Finance & SARS Debtor Recovery Agent",
    level: "action",
    message: "Flagged overdue debtor Apex Industrial Coatings (42 days overdue). Awaiting credit hold approval.",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "log-4",
    agentId: "logistics",
    agentName: "Inter-Branch Logistics Agent",
    level: "info",
    message: "Calculated optimal transfer route: Central DC -> Durban for 20 units Dulux Weathershield.",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  }
];

export function getAgentProfiles(): AgentProfile[] {
  return AGENT_PROFILES.map(profile => ({
    ...profile,
    pendingActionsCount: agentActionsStore.filter(a => a.agentId === profile.id && a.status === "pending_approval").length,
  }));
}

export function getAgentActions(status?: string): AgentAction[] {
  if (status) {
    return agentActionsStore.filter(a => a.status === status);
  }
  return agentActionsStore;
}

export function approveAgentAction(actionId: string, user: string = "Admin"): AgentAction | null {
  const action = agentActionsStore.find(a => a.id === actionId);
  if (!action) return null;

  action.status = "executed";
  action.executedAt = new Date().toISOString();
  action.approvedBy = user;

  agentLogsStore.unshift({
    id: "log-" + Date.now(),
    agentId: action.agentId,
    agentName: AGENT_PROFILES.find(p => p.id === action.agentId)?.name || "Agent",
    level: "action",
    message: `Action executed [Approved by ${user}]: ${action.title}`,
    details: action.payload,
    timestamp: new Date().toISOString(),
  });

  return action;
}

export function dismissAgentAction(actionId: string): boolean {
  const action = agentActionsStore.find(a => a.id === actionId);
  if (!action) return false;

  action.status = "dismissed";
  return true;
}

export function addAgentLog(entry: Omit<AgentLogEntry, "id" | "timestamp">) {
  agentLogsStore.unshift({
    ...entry,
    id: "log-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
    timestamp: new Date().toISOString(),
  });
}

export function getAgentLogs(limit: number = 30): AgentLogEntry[] {
  return agentLogsStore.slice(0, limit);
}
