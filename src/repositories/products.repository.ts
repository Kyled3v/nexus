import { db } from "@/lib/db";
import { products, inventory } from "@/lib/db/schema";
import { eq, ilike, and, or } from "drizzle-orm";
import type { ProductWithStock } from "@/domain/products/types";

export async function getProducts(filters?: {
  organisationId?: string;
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 50;
  const conditions = [];

  if (filters?.organisationId) {
    conditions.push(eq(products.organisationId, filters.organisationId));
  }
  if (filters?.status && filters.status !== "all") {
    conditions.push(eq(products.status, filters.status));
  }

  const data = await db
    .select()
    .from(products)
    .where(conditions.length ? and(...conditions) : undefined)
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return { data, page, pageSize };
}

export async function getProductById(id: string) {
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, id));
  return product ?? null;
}

export async function getProductsWithStock(organisationId: string, branchId: string, search?: string) {
  const conditions = [
    eq(products.organisationId, organisationId),
    eq(products.status, "active"),
  ];
  if (search) {
    conditions.push(
      or(
        ilike(products.name,    `%${search}%`),
        ilike(products.sku,     `%${search}%`),
        ilike(products.barcode, `%${search}%`),
      )!
    );
  }

  const rows = await db
    .select({
      id:           products.id,
      sku:          products.sku,
      barcode:      products.barcode,
      name:         products.name,
      sellingPrice: products.sellingPrice,
      taxRate:      products.taxRate,
      taxInclusive: products.taxInclusive,
      currentStock: inventory.currentStock,
      reservedStock:inventory.reservedStock,
    })
    .from(products)
    .leftJoin(
      inventory,
      and(
        eq(inventory.productId,      products.id),
        eq(inventory.organisationId, organisationId),
        eq(inventory.branchId,       branchId),
      )
    )
    .where(and(...conditions))
    .limit(100);

  return rows.map(r => ({
    ...r,
    sellingPrice:   Number(r.sellingPrice),
    taxRate:        Number(r.taxRate),
    currentStock:   r.currentStock  ?? 0,
    reservedStock:  r.reservedStock ?? 0,
    availableStock: Math.max(0, (r.currentStock ?? 0) - (r.reservedStock ?? 0)),
  }));
}
