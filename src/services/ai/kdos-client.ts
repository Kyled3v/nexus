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

import { getAgentActions, approveAgentAction, addAgentLog } from "./agents/registry";

// --- Integration contract ---
// KDOS Integration Client bridging NEXUS ERP domain and the KDOS Multi-Agent Network.

export const KdosClient = {
  async getRecommendations(_context: KdosBusinessContext): Promise<KdosRecommendation[]> {
    const actions = getAgentActions("pending_approval");
    return actions.map(act => ({
      id: act.id,
      type: (act.category === "purchase_order" ? "restock" : act.category === "price_adjustment" ? "pricing" : "operational") as KdosRecommendationType,
      title: act.title,
      summary: act.description,
      detail: `Estimated Impact: ${act.estimatedImpact}`,
      confidence: 0.95,
      impact: (act.severity === "critical" ? "high" : act.severity === "high" ? "high" : "medium") as "low" | "medium" | "high",
      urgency: (act.severity === "critical" ? "critical" : act.severity === "high" ? "high" : "medium") as "low" | "medium" | "high" | "critical",
      actions: [
        { id: `approve-${act.id}`, label: "Approve & Execute", type: "approve", requiresApproval: true },
        { id: `dismiss-${act.id}`, label: "Dismiss", type: "dismiss", requiresApproval: false },
      ],
      dataPoints: [
        `Agent: ${act.agentId}`,
        `Severity: ${act.severity}`,
        `Impact: ${act.estimatedImpact}`,
      ],
      generatedAt: act.createdAt,
    }));
  },

  async getRiskAlerts(_context: KdosBusinessContext): Promise<KdosRiskAlert[]> {
    const actions = getAgentActions("pending_approval");
    return actions
      .filter(a => a.severity === "critical" || a.severity === "high")
      .map(act => ({
        id: `risk-${act.id}`,
        type: (act.category === "purchase_order" ? "stockout" : "cash_flow") as KdosRiskType,
        title: act.title,
        description: act.description,
        severity: act.severity,
        affectedEntities: [act.agentId],
        detectedAt: act.createdAt,
      }));
  },

  async submitEvent(_event: { type: string; businessId: string; data: Record<string, unknown> }): Promise<void> {
    addAgentLog({
      agentId: "orchestrator",
      agentName: "KDOS Event Dispatcher",
      level: "info",
      message: `Event [${_event.type}] recorded from business ${_event.businessId}`,
      details: _event.data,
    });
  },

  async requestApproval(_recommendation: KdosRecommendation, _businessId: string): Promise<{ approved: boolean; approvedBy?: string }> {
    const executed = approveAgentAction(_recommendation.id, "Executive User");
    return {
      approved: !!executed,
      approvedBy: executed?.approvedBy,
    };
  },
};
