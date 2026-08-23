import type { ID, BaseEntity, Status } from "@/types/core";

export interface Category extends BaseEntity {
  businessId: ID;
  name: string;
  code: string;
  parentId?: ID;
  description?: string;
  status: Status;
}

export interface Brand extends BaseEntity {
  businessId: ID;
  name: string;
  description?: string;
  status: Status;
}

export interface Product extends BaseEntity {
  businessId: ID;
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  categoryId?: ID;
  brandId?: ID;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  taxRate: number;
  taxInclusive: boolean;
  supplierId?: ID;
  reorderLevel: number;
  targetStock: number;
  minStock: number;
  maxStock: number;
  status: Status;
  imageUrl?: string;
  attributes: Record<string, string>;
}

export interface ProductVariant extends BaseEntity {
  productId: ID;
  businessId: ID;
  sku: string;
  barcode?: string;
  name: string;
  attributes: Record<string, string>;
  costPrice: number;
  sellingPrice: number;
  status: Status;
}

export interface ProductWithStock extends Product {
  currentStock: number;
  availableStock: number;
  reservedStock: number;
  stockStatus: "ok" | "low" | "critical" | "out" | "overstock";
  categoryName?: string;
  brandName?: string;
  supplierName?: string;
}
