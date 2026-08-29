import { db } from "@/lib/db";
import { sales } from "@/lib/db/schema";
import { eq, gte, and, desc } from "drizzle-orm";

export async function getSales(organisationId: string, filters?: {
  branchId?: string;
  status?:   string;
  page?:     number;
  pageSize?: number;
}) {
  const page     = filters?.page     ?? 1;
  const pageSize = filters?.pageSize ?? 50;
  const conditions = [eq(sales.organisationId, organisationId)];

  if (filters?.branchId) conditions.push(eq(sales.branchId, filters.branchId));
  if (filters?.status)   conditions.push(eq(sales.status,   filters.status));

  const data = await db
    .select()
    .from(sales)
    .where(and(...conditions))
    .orderBy(desc(sales.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return { data, page, pageSize };
}

export async function getDailySummary(organisationId: string, branchId?: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const conditions = [
    eq(sales.organisationId, organisationId),
    eq(sales.status, "completed"),
    gte(sales.completedAt, today),
  ];
  if (branchId) conditions.push(eq(sales.branchId, branchId));

  const data = await db
    .select({
      total:          sales.total,
      taxAmount:      sales.taxAmount,
      discountAmount: sales.discountAmount,
    })
    .from(sales)
    .where(and(...conditions));

  return {
    revenue:      data.reduce((s, r) => s + Number(r.total),          0),
    transactions: data.length,
    tax:          data.reduce((s, r) => s + Number(r.taxAmount),      0),
    discounts:    data.reduce((s, r) => s + Number(r.discountAmount), 0),
    date:         today.toISOString(),
  };
}

export async function getMonthlyRevenue(organisationId: string) {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  const data = await db
    .select({ total: sales.total })
    .from(sales)
    .where(
      and(
        eq(sales.organisationId, organisationId),
        eq(sales.status, "completed"),
        gte(sales.completedAt, start),
      )
    );

  return data.reduce((s, r) => s + Number(r.total), 0);
}
