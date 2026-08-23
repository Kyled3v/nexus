import type { ID, BaseEntity } from "@/types/core";

export type SaleStatus = "pending" | "completed" | "voided" | "refunded" | "partial_refund";
export type PaymentMethod = "cash" | "card" | "eft" | "split" | "account" | "voucher";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

export interface Sale extends BaseEntity {
  businessId: ID;
  branchId: ID;
  tillId: ID;
  sessionId: ID;
  saleNumber: string;
  customerId?: ID;
  cashierId: ID;
  status: SaleStatus;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  notes?: string;
  completedAt?: string;
}

export interface SaleItem extends BaseEntity {
  saleId: ID;
  productId: ID;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  taxRate: number;
  taxAmount: number;
  discountPercent: number;
  discountAmount: number;
  lineTotal: number;
}

export interface Payment extends BaseEntity {
  saleId: ID;
  businessId: ID;
  method: PaymentMethod;
  amount: number;
  reference?: string;
  status: PaymentStatus;
  processedAt?: string;
}

export interface TillSession extends BaseEntity {
  businessId: ID;
  branchId: ID;
  tillId: string;
  cashierId: ID;
  openedAt: string;
  closedAt?: string;
  openingFloat: number;
  closingFloat?: number;
  expectedFloat?: number;
  variance?: number;
  totalSales: number;
  totalRefunds: number;
  transactionCount: number;
  status: "open" | "closed";
}
