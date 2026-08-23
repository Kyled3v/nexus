import type { ID, BaseEntity } from "@/types/core";

export type AuditAction =
  | "create" | "update" | "delete"
  | "sale.complete" | "sale.refund" | "sale.void"
  | "stock.adjust" | "stock.transfer" | "stock.receive"
  | "purchase.create" | "purchase.approve" | "purchase.receive"
  | "customer.create" | "customer.update"
  | "lead.create" | "lead.update" | "lead.stage.change"
  | "automation.trigger" | "automation.execute" | "automation.approve"
  | "user.login" | "user.logout" | "user.role.change"
  | "settings.update";

export interface AuditLog extends BaseEntity {
  businessId: ID;
  branchId?: ID;
  userId: ID;
  userRole: string;
  action: AuditAction;
  entityType: string;
  entityId: ID;
  description: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  source: "user" | "automation" | "system";
  automationRuleId?: ID;
  ipAddress?: string;
}
