import type { ID, BaseEntity } from "@/types/core";

export type CustomerStatus = "active" | "inactive" | "vip" | "blocked";
export type LeadStage = "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
export type LeadSource = "website" | "pos" | "referral" | "manual" | "campaign" | "social";

export interface Customer extends BaseEntity {
  businessId: ID;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxNumber?: string;
  status: CustomerStatus;
  tags: string[];
  notes?: string;
  totalSpend: number;
  transactionCount: number;
  lastPurchaseAt?: string;
  creditLimit?: number;
  outstandingBalance?: number;
}

export interface Lead extends BaseEntity {
  businessId: ID;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  source: LeadSource;
  stage: LeadStage;
  estimatedValue: number;
  ownerId: ID;
  customerId?: ID;
  notes?: string;
  followUpAt?: string;
  wonAt?: string;
  lostAt?: string;
  lostReason?: string;
}

export interface LeadActivity extends BaseEntity {
  leadId: ID;
  userId: ID;
  type: "note" | "call" | "email" | "meeting" | "stage_change";
  description: string;
  metadata?: Record<string, unknown>;
}
