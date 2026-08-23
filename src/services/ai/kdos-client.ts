// KDOS Integration Client
// This is the boundary between NEXUS and the KDOS intelligence/orchestration layer.
// When actual KDOS connectivity is available, implementations replace the dev stubs below.
// NEXUS business domain must never depend on KDOS internals.

export type KdosRecommendationType =
  | "restock"
  | "pricing"
  | "marketing"
  | "supplier_change"
  | "customer_engagement"
  | "sales_strategy"
  | "operational";

export type KdosRiskType =
  | "stockout"
  | "overstock"
  | "supplier_delay"
  | "sales_decline"
  | "cash_flow"
  | "customer_churn";

export interface KdosRecommendation {
  id: string;
  type: KdosRecommendationType;
  title: string;
  summary: string;
  detail: string;
  confidence: number;
  impact: "low" | "medium" | "high";
  urgency: "low" | "medium" | "high" | "critical";
  actions: KdosRecommendedAction[];
  dataPoints: string[];
  generatedAt: string;
  expiresAt?: string;
}

export interface KdosRecommendedAction {
  id: string;
  label: string;
  type: "approve" | "dismiss" | "view" | "external";
  requiresApproval: boolean;
  url?: string;
}

export interface KdosRiskAlert {
  id: string;
  type: KdosRiskType;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  affectedEntities: string[];
  detectedAt: string;
}

export interface KdosBusinessContext {
  businessId: string;
  branchId: string;
  period: "day" | "week" | "month";
  data: Record<string, unknown>;
}

// --- Integration contract ---
// Replace these stubs with real KDOS API calls when the integration is ready.

export const KdosClient = {
  async getRecommendations(_context: KdosBusinessContext): Promise<KdosRecommendation[]> {
    // DEV STUB: returns realistic demo recommendations
    return [
      {
        id: "kdos-rec-001",
        type: "restock",
        title: "Restock Plascon Exterior 5L",
        summary: "Current stock (1 unit) is critically below reorder level (12 units).",
        detail: "Based on current sales velocity and lead time of 5 days, stock will be exhausted before the next possible delivery. Recommend placing an order for 45 units to reach target stock.",
        confidence: 0.94,
        impact: "high",
        urgency: "critical",
        actions: [
          { id: "a1", label: "Create Purchase Order", type: "approve", requiresApproval: true },
          { id: "a2", label: "Dismiss",               type: "dismiss", requiresApproval: false },
        ],
        dataPoints: ["Current stock: 1", "Reorder level: 12", "Avg daily sales: 2.4", "Supplier lead time: 5 days"],
        generatedAt: new Date().toISOString(),
      },
      {
        id: "kdos-rec-002",
        type: "marketing",
        title: "Dulux Eggshell 5L — Overstock Opportunity",
        summary: "67 units in stock vs target of 40. Consider a promotional campaign.",
        detail: "Overstock is tying up capital. A 10% promotional discount could clear excess stock within 3 weeks based on current demand patterns.",
        confidence: 0.78,
        impact: "medium",
        urgency: "low",
        actions: [
          { id: "a3", label: "Review Promotion",      type: "approve", requiresApproval: true },
          { id: "a4", label: "Dismiss",               type: "dismiss", requiresApproval: false },
        ],
        dataPoints: ["Current stock: 67", "Target stock: 40", "Excess units: 27", "Tied capital: R3,510"],
        generatedAt: new Date().toISOString(),
      },
    ];
  },

  async getRiskAlerts(_context: KdosBusinessContext): Promise<KdosRiskAlert[]> {
    return [
      {
        id: "kdos-risk-001",
        type: "stockout",
        title: "Imminent stockout — Rust-Oleum Primer 1L",
        description: "Product is currently out of stock with no purchase order raised. Revenue impact estimated at R950/day.",
        severity: "critical",
        affectedEntities: ["prod-005"],
        detectedAt: new Date().toISOString(),
      },
    ];
  },

  async submitEvent(_event: { type: string; businessId: string; data: Record<string, unknown> }): Promise<void> {
    // DEV STUB: In production, this publishes to the KDOS event bus
    if (process.env.NEXT_PUBLIC_DEV_MODE === "true") {
      console.debug("[KDOS] Event submitted:", _event.type, _event.data);
    }
  },

  async requestApproval(_recommendation: KdosRecommendation, _businessId: string): Promise<{ approved: boolean; approvedBy?: string }> {
    // DEV STUB: In production, creates an approval request in KDOS
    return { approved: false };
  },
};
