export type AgentId =
  | "inventory"
  | "pricing"
  | "debtor"
  | "logistics"
  | "sales"
  | "marketing"
  | "social"
  | "orchestrator";

export type AgentStatus = "active" | "running" | "idle" | "paused";

export type ActionStatus = "pending_approval" | "approved" | "executed" | "dismissed" | "rejected";

export type ActionSeverity = "low" | "medium" | "high" | "critical";

export type ActionCategory =
  | "purchase_order"
  | "price_adjustment"
  | "debtor_notice"
  | "stock_transfer"
  | "deal_followup"
  | "campaign_launch"
  | "social_post_publish"
  | "system_optimization";

export interface AgentAction {
  id: string;
  agentId: AgentId;
  title: string;
  description: string;
  category: ActionCategory;
  severity: ActionSeverity;
  estimatedImpact: string;
  payload: Record<string, unknown>;
  status: ActionStatus;
  createdAt: string;
  executedAt?: string;
  approvedBy?: string;
}

export interface AgentRunResult {
  agentId: AgentId;
  agentName: string;
  summary: string;
  confidenceScore: number;
  healthStatus: "optimal" | "warning" | "critical";
  keyFindings: string[];
  suggestedActions: AgentAction[];
  rawInsightsMarkdown: string;
  timestamp: string;
  source: string;
}

export interface AgentProfile {
  id: AgentId;
  name: string;
  code: string;
  title: string;
  description: string;
  specialization: string;
  iconName: string;
  accentColor: string;
  badgeBg: string;
  status: AgentStatus;
  capabilities: string[];
  schedule: string;
  lastRunTime?: string;
  pendingActionsCount: number;
}

export interface AgentLogEntry {
  id: string;
  agentId: AgentId;
  agentName: string;
  level: "info" | "warning" | "error" | "action";
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface AgentChatMessage {
  id: string;
  sender: "user" | "assistant" | "agent";
  agentId?: AgentId;
  text: string;
  proposedActions?: AgentAction[];
  timestamp: string;
}
