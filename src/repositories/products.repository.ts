import { db } from "@/lib/db";
import { products, inventory } from "@/lib/db/schema";
import { eq, ilike, and, or } from "drizzle-orm";
import { DEMO_PRODUCTS } from "@/data/demo-products";
import type { Status } from "@/types/core";

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

export async function createProduct(organisationId: string, data: {
  sku: string;
  barcode?: string | null;
  name: string;
  costPrice: number | string;
  sellingPrice: number | string;
  taxRate?: number | string;
  taxInclusive?: boolean;
  reorderLevel?: number;
  targetStock?: number;
  minStock?: number;
  maxStock?: number;
  status?: string;
  initialStock?: number;
  branchId?: string;
}) {
  try {
    const [created] = await db
      .insert(products)
      .values({
        organisationId,
        sku:          data.sku,
        barcode:      data.barcode ?? null,
        name:         data.name,
        costPrice:    String(data.costPrice),
        sellingPrice: String(data.sellingPrice),
        taxRate:      String(data.taxRate ?? "15"),
        taxInclusive: data.taxInclusive ?? true,
        reorderLevel: data.reorderLevel ?? 10,
        targetStock:  data.targetStock ?? 50,
        minStock:     data.minStock ?? 5,
        maxStock:     data.maxStock ?? 100,
        status:       data.status ?? "active",
      })
      .returning();

    if (data.initialStock && data.initialStock > 0 && created) {
      await db.insert(inventory).values({
        organisationId,
        branchId: data.branchId || "demo-branch-main",
        productId: created.id,
        currentStock: data.initialStock,
        reservedStock: 0,
      });
    }

    if (created) return created;
  } catch (err) {
    console.warn("[Products] DB createProduct fallback to memory:", err);
  }

  const newId = "prod-" + Date.now();
  const createdDemo = {
    id:           newId,
    organisationId,
    sku:          data.sku,
    barcode:      data.barcode ?? null,
    name:         data.name,
    costPrice:    String(data.costPrice),
    sellingPrice: String(data.sellingPrice),
    taxRate:      String(data.taxRate ?? "15"),
    taxInclusive: data.taxInclusive ?? true,
    reorderLevel: data.reorderLevel ?? 10,
    targetStock:  data.targetStock ?? 50,
    minStock:     data.minStock ?? 5,
    maxStock:     data.maxStock ?? 100,
    status:       data.status ?? "active",
    imageUrl:     null,
  };

  DEMO_PRODUCTS.unshift({
    id: newId,
    businessId: organisationId,
    sku: data.sku,
    barcode: data.barcode || undefined,
    name: data.name,
    costPrice: Number(data.costPrice),
    sellingPrice: Number(data.sellingPrice),
    taxRate: Number(data.taxRate ?? 15),
    taxInclusive: data.taxInclusive ?? true,
    reorderLevel: data.reorderLevel ?? 10,
    targetStock: data.targetStock ?? 50,
    minStock: data.minStock ?? 5,
    maxStock: data.maxStock ?? 100,
    status: (data.status as Status) ?? "active",
    currentStock: data.initialStock ?? 20,
    reservedStock: 0,
    availableStock: data.initialStock ?? 20,
    stockStatus: "ok",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    unit: "Each",
    attributes: {},
  });

  return createdDemo;
}

export async function updateProduct(organisationId: string, id: string, data: Partial<{
  sku: string;
  barcode?: string | null;
  name: string;
  costPrice: number | string;
  sellingPrice: number | string;
  taxRate?: number | string;
  taxInclusive?: boolean;
  reorderLevel?: number;
  targetStock?: number;
  minStock?: number;
  maxStock?: number;
  status?: string;
}>) {
  try {
    const updatePayload: Record<string, unknown> = { updatedAt: new Date() };
    if (data.sku !== undefined) updatePayload.sku = data.sku;
    if (data.barcode !== undefined) updatePayload.barcode = data.barcode;
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.costPrice !== undefined) updatePayload.costPrice = String(data.costPrice);
    if (data.sellingPrice !== undefined) updatePayload.sellingPrice = String(data.sellingPrice);
    if (data.taxRate !== undefined) updatePayload.taxRate = String(data.taxRate);
    if (data.taxInclusive !== undefined) updatePayload.taxInclusive = data.taxInclusive;
    if (data.reorderLevel !== undefined) updatePayload.reorderLevel = data.reorderLevel;
    if (data.targetStock !== undefined) updatePayload.targetStock = data.targetStock;
    if (data.minStock !== undefined) updatePayload.minStock = data.minStock;
    if (data.maxStock !== undefined) updatePayload.maxStock = data.maxStock;
    if (data.status !== undefined) updatePayload.status = data.status;

    const [updated] = await db
      .update(products)
      .set(updatePayload)
      .where(and(eq(products.id, id), eq(products.organisationId, organisationId)))
      .returning();

    if (updated) return updated;
  } catch {}

  const demo = DEMO_PRODUCTS.find(p => p.id === id);
  if (demo) {
    if (data.sku !== undefined) demo.sku = data.sku;
    if (data.name !== undefined) demo.name = data.name;
    if (data.barcode !== undefined) demo.barcode = data.barcode || undefined;
    if (data.costPrice !== undefined) demo.costPrice = Number(data.costPrice);
    if (data.sellingPrice !== undefined) demo.sellingPrice = Number(data.sellingPrice);
    if (data.taxRate !== undefined) demo.taxRate = Number(data.taxRate);
    if (data.status !== undefined) demo.status = data.status as Status;
    if (data.reorderLevel !== undefined) demo.reorderLevel = data.reorderLevel;
    if (data.targetStock !== undefined) demo.targetStock = data.targetStock;
  }

  return {
    id,
    organisationId,
    sku: data.sku ?? demo?.sku ?? "SKU",
    barcode: data.barcode ?? demo?.barcode ?? null,
    name: data.name ?? demo?.name ?? "Product",
    costPrice: String(data.costPrice ?? demo?.costPrice ?? "0"),
    sellingPrice: String(data.sellingPrice ?? demo?.sellingPrice ?? "0"),
    taxRate: String(data.taxRate ?? demo?.taxRate ?? "15"),
    taxInclusive: data.taxInclusive ?? demo?.taxInclusive ?? true,
    reorderLevel: data.reorderLevel ?? demo?.reorderLevel ?? 10,
    targetStock: data.targetStock ?? demo?.targetStock ?? 50,
    minStock: data.minStock ?? demo?.minStock ?? 5,
    maxStock: data.maxStock ?? demo?.maxStock ?? 100,
    status: data.status ?? demo?.status ?? "active",
    imageUrl: null,
  };
}

export async function deleteProduct(organisationId: string, id: string) {
  try {
    await db
      .delete(products)
      .where(and(eq(products.id, id), eq(products.organisationId, organisationId)));
  } catch {}

  const idx = DEMO_PRODUCTS.findIndex(p => p.id === id);
  if (idx >= 0) {
    DEMO_PRODUCTS.splice(idx, 1);
  }
  return { success: true };
}
