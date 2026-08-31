import { db } from "@/lib/db";
import { products, inventory } from "@/lib/db/schema";
import { eq, ilike, and, or } from "drizzle-orm";
import type { ProductWithStock } from "@/domain/products/types";
import { DEMO_PRODUCTS } from "@/data/demo-products";

export async function getProducts(filters?: {
  organisationId?: string;
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 50;

  try {
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

    if (data.length > 0) {
      return { data, page, pageSize };
    }
  } catch {}

  let demoList = DEMO_PRODUCTS.map(p => ({
    id:           p.id,
    organisationId: p.businessId,
    sku:          p.sku,
    barcode:      p.barcode ?? null,
    name:         p.name,
    costPrice:    String(p.costPrice),
    sellingPrice: String(p.sellingPrice),
    taxRate:      String(p.taxRate),
    taxInclusive: p.taxInclusive,
    reorderLevel: p.reorderLevel,
    targetStock:  p.targetStock,
    minStock:     p.minStock,
    maxStock:     p.maxStock,
    status:       p.status,
    imageUrl:     null,
  }));

  if (filters?.status && filters.status !== "all") {
    demoList = demoList.filter(p => p.status === filters.status);
  }
  if (filters?.search) {
    const s = filters.search.toLowerCase();
    demoList = demoList.filter(p => p.name.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s) || (p.barcode ?? "").includes(s));
  }

  return { data: demoList, page, pageSize };
}

export async function getProductById(id: string) {
  try {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));
    if (product) return product;
  } catch {}

  const demo = DEMO_PRODUCTS.find(p => p.id === id);
  if (!demo) return null;
  return {
    id:           demo.id,
    organisationId: demo.businessId,
    sku:          demo.sku,
    barcode:      demo.barcode ?? null,
    name:         demo.name,
    costPrice:    String(demo.costPrice),
    sellingPrice: String(demo.sellingPrice),
    taxRate:      String(demo.taxRate),
    taxInclusive: demo.taxInclusive,
    reorderLevel: demo.reorderLevel,
    targetStock:  demo.targetStock,
    minStock:     demo.minStock,
    maxStock:     demo.maxStock,
    status:       demo.status,
    imageUrl:     null,
  };
}

export async function getProductsWithStock(organisationId: string, branchId: string, search?: string) {
  try {
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

    if (rows.length > 0) {
      return rows.map(r => ({
        ...r,
        sellingPrice:   Number(r.sellingPrice),
        taxRate:        Number(r.taxRate),
        currentStock:   r.currentStock  ?? 0,
        reservedStock:  r.reservedStock ?? 0,
        availableStock: Math.max(0, (r.currentStock ?? 0) - (r.reservedStock ?? 0)),
      }));
    }
  } catch {}

  let demoList = DEMO_PRODUCTS;
  if (search) {
    const s = search.toLowerCase();
    demoList = demoList.filter(p => p.name.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s) || (p.barcode ?? "").includes(s));
  }
  return demoList.map(p => ({
    id:           p.id,
    sku:          p.sku,
    barcode:      p.barcode ?? null,
    name:         p.name,
    sellingPrice: p.sellingPrice,
    taxRate:      p.taxRate,
    taxInclusive: p.taxInclusive,
    currentStock: p.currentStock,
    reservedStock:p.reservedStock,
    availableStock: p.availableStock,
  }));
}
