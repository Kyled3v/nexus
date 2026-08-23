import type { ID, BaseEntity } from "@/types/core";

export type TriggerEvent =
  | "inventory.level.changed"
  | "sale.completed"
  | "purchase.order.created"
  | "purchase.order.received"
  | "customer.created"
  | "customer.inactive"
  | "supplier.price.changed"
  | "sales.daily.summary"
  | "system.scheduled";

export type AutomationActionType =
  | "notify"
  | "recommend"
  | "require_approval"
  | "create_purchase_order"
  | "send_alert"
  | "update_record";

export type AutomationStatus = "active" | "inactive" | "paused";
export type ExecutionStatus = "pending" | "running" | "completed" | "failed" | "cancelled" | "awaiting_approval";

export interface AutomationRule extends BaseEntity {
  businessId: ID;
  name: string;
  description?: string;
  triggerEvent: TriggerEvent;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  status: AutomationStatus;
  requiresApproval: boolean;
  lastTriggeredAt?: string;
  triggerCount: number;
}

export interface AutomationCondition {
  field: string;
  operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "contains" | "not_contains";
  value: string | number | boolean;
}

export interface AutomationAction {
  type: AutomationActionType;
  config: Record<string, unknown>;
}

export interface AutomationExecution extends BaseEntity {
  businessId: ID;
  ruleId: ID;
  ruleName: string;
  triggerEvent: TriggerEvent;
  triggerData: Record<string, unknown>;
  status: ExecutionStatus;
  result?: string;
  error?: string;
  approvedBy?: ID;
  approvedAt?: string;
  completedAt?: string;
}
