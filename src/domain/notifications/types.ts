import type { ID, BaseEntity } from "@/types/core";

export type NotificationType =
  | "info" | "warning" | "danger" | "success";

export type NotificationCategory =
  | "stock" | "sales" | "purchasing" | "customers"
  | "automation" | "finance" | "system" | "leads";

export interface Notification extends BaseEntity {
  businessId: ID;
  userId?: ID;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  sourceType?: "automation" | "system" | "user";
  sourceId?: ID;
  expiresAt?: string;
}
