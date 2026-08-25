import { createClient } from "@/lib/supabase/server";
import type { ProductWithStock } from "@/domain/products/types";

const PRODUCT_SELECT = "*, categories(name), brands(name), suppliers(name), inventory(current_stock, reserved_stock, available_stock)";

export async function getProducts(filters?: {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  const supabase = await createClient();
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 50;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT, { count: "exact" })
    .order("name");

  if (filters?.search) {
    const s = filters.search;
    query = query.or("name.ilike.%" + s + "%,sku.ilike.%" + s + "%,barcode.ilike.%" + s + "%");
  }

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data: (data ?? []).map(mapProductRow),
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  };
}

export async function getProductById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", id)
    .single();
  if (error) throw error;
  return mapProductRow(data);
}

export async function getProductBySku(sku: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, inventory(current_stock, reserved_stock, available_stock)")
    .eq("sku", sku)
    .single();
  if (error) throw error;
  return mapProductRow(data);
}

function mapProductRow(row: Record<string, unknown>): ProductWithStock {
  const inv = Array.isArray(row.inventory) ? row.inventory[0] : row.inventory;
  const currentStock = (inv as Record<string, number> | null)?.current_stock ?? 0;
  const reservedStock = (inv as Record<string, number> | null)?.reserved_stock ?? 0;
  const availableStock = (inv as Record<string, number> | null)?.available_stock ?? 0;
  const reorderLevel = Number(row.reorder_level ?? 0);
  const minStock = Number(row.min_stock ?? 0);
  const maxStock = Number(row.max_stock ?? 0);

  let stockStatus: ProductWithStock["stockStatus"] = "ok";
  if (currentStock <= 0) stockStatus = "out";
  else if (currentStock <= minStock) stockStatus = "critical";
  else if (currentStock <= reorderLevel) stockStatus = "low";
  else if (maxStock > 0 && currentStock >= maxStock * 0.9) stockStatus = "overstock";

  const cats = row.categories as Record<string, string> | null;
  const brnds = row.brands as Record<string, string> | null;
  const sups = row.suppliers as Record<string, string> | null;

  return {
    id: String(row.id),
    businessId: String(row.organisation_id),
    sku: String(row.sku),
    barcode: row.barcode as string | undefined,
    name: String(row.name),
    description: row.description as string | undefined,
    categoryId: row.category_id as string | undefined,
    brandId: row.brand_id as string | undefined,
    unit: String(row.unit ?? "Each"),
    costPrice: Number(row.cost_price ?? 0),
    sellingPrice: Number(row.selling_price ?? 0),
    taxRate: Number(row.tax_rate ?? 15),
    taxInclusive: Boolean(row.tax_inclusive ?? true),
    supplierId: row.supplier_id as string | undefined,
    reorderLevel,
    targetStock: Number(row.target_stock ?? 0),
    minStock,
    maxStock,
    status: (row.status as "active" | "inactive" | "archived") ?? "active",
    imageUrl: row.image_url as string | undefined,
    attributes: (row.attributes as Record<string, string>) ?? {},
    currentStock,
    availableStock,
    reservedStock,
    stockStatus,
    categoryName: cats?.name,
    brandName: brnds?.name,
    supplierName: sups?.name,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}
