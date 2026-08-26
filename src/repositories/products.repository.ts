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
