import type { ID, BaseEntity } from "@/types/core";

export type POStatus =
  | "draft" | "pending" | "approved" | "sent"
  | "partial" | "received" | "cancelled";

export interface Supplier extends BaseEntity {
  businessId: ID;
  name: string;
  code: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxNumber?: string;
  paymentTerms?: string;
  leadTimeDays: number;
  rating?: number;
  status: "active" | "inactive";
  notes?: string;
}

export interface SupplierProduct extends BaseEntity {
  businessId: ID;
  supplierId: ID;
  productId: ID;
  supplierSku?: string;
  unitCost: number;
  minOrderQty: number;
  leadTimeDays?: number;
  isPreferred: boolean;
}

export interface PurchaseOrder extends BaseEntity {
  businessId: ID;
  branchId: ID;
  supplierId: ID;
  supplierName: string;
  poNumber: string;
  status: POStatus;
  subtotal: number;
  taxAmount: number;
  total: number;
  notes?: string;
  expectedAt?: string;
  receivedAt?: string;
  approvedBy?: ID;
  approvedAt?: string;
  sentAt?: string;
}

export interface PurchaseOrderItem extends BaseEntity {
  purchaseOrderId: ID;
  productId: ID;
  sku: string;
  name: string;
  quantity: number;
  unitCost: number;
  taxRate: number;
  lineTotal: number;
  quantityReceived: number;
}
