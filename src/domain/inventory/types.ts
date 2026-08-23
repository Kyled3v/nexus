import type { ID, BaseEntity } from "@/types/core";

export type MovementType =
  | "sale"
  | "purchase_receipt"
  | "adjustment_in"
  | "adjustment_out"
  | "transfer_in"
  | "transfer_out"
  | "return_in"
  | "return_out"
  | "damaged"
  | "loss"
  | "opening_stock";

export interface Inventory extends BaseEntity {
  businessId: ID;
  branchId: ID;
  productId: ID;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  lastMovementAt: string;
}

export interface InventoryMovement extends BaseEntity {
  businessId: ID;
  branchId: ID;
  productId: ID;
  type: MovementType;
  quantity: number;
  quantityBefore: number;
  quantityAfter: number;
  referenceType?: string;
  referenceId?: ID;
  notes?: string;
  createdBy: ID;
}

export interface StockLevel {
  productId: ID;
  productName: string;
  sku: string;
  currentStock: number;
  reorderLevel: number;
  targetStock: number;
  minStock: number;
  maxStock: number;
  status: "ok" | "low" | "critical" | "out" | "overstock";
  branchId: ID;
  branchName: string;
}
