import { z } from "zod";

export const IdSchema = z.string().min(1);

export const AddressSchema = z.object({
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().min(1),
});

export const CreateProductSchema = z.object({
  sku: z.string().min(1).max(50),
  barcode: z.string().optional(),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  unit: z.string().min(1),
  costPrice: z.number().min(0),
  sellingPrice: z.number().min(0),
  taxRate: z.number().min(0).max(100),
  taxInclusive: z.boolean(),
  supplierId: z.string().optional(),
  reorderLevel: z.number().int().min(0),
  targetStock: z.number().int().min(0),
  minStock: z.number().int().min(0),
  maxStock: z.number().int().min(0),
  attributes: z.record(z.string(), z.string()).default({}),
});

export const StockAdjustmentSchema = z.object({
  productId: z.string().min(1),
  branchId: z.string().min(1),
  quantity: z.number().int(),
  type: z.enum(["adjustment_in", "adjustment_out", "damaged", "loss"]),
  notes: z.string().optional(),
});

export const CreateSaleSchema = z.object({
  branchId: z.string().min(1),
  tillId: z.string().min(1),
  customerId: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().int().min(1),
    unitPrice: z.number().min(0),
    discountPercent: z.number().min(0).max(100).default(0),
  })).min(1),
  paymentMethod: z.enum(["cash", "card", "eft", "split", "account", "voucher"]),
  cashTendered: z.number().optional(),
  notes: z.string().optional(),
});

export const CreatePurchaseOrderSchema = z.object({
  supplierId: z.string().min(1),
  branchId: z.string().min(1),
  expectedAt: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().int().min(1),
    unitCost: z.number().min(0),
  })).min(1),
});

export const CreateCustomerSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  taxNumber: z.string().optional(),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
  creditLimit: z.number().min(0).optional(),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type StockAdjustmentInput = z.infer<typeof StockAdjustmentSchema>;
export type CreateSaleInput = z.infer<typeof CreateSaleSchema>;
export type CreatePurchaseOrderInput = z.infer<typeof CreatePurchaseOrderSchema>;
export type CreateCustomerInput = z.infer<typeof CreateCustomerSchema>;
