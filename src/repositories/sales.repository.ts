import { db } from "@/lib/db";
import { sales, saleItems } from "@/lib/db/schema";
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

export async function createSale(params: {
  organisationId: string;
  branchId:       string;
  cashierId:      string;
  items: {
    productId?:     string;
    sku:            string;
    name:           string;
    quantity:       number;
    unitPrice:      number;
    taxRate:        number;
    taxAmount:      number;
    discountPct:    number;
    discountAmount: number;
    lineTotal:      number;
  }[];
  subtotal:       number;
  taxAmount:      number;
  discountAmount: number;
  total:          number;
  paymentMethod:  string;
  customerId?:    string;
}) {
  const saleNumber = "S-" + Date.now().toString(36).toUpperCase();

  const [sale] = await db
    .insert(sales)
    .values({
      organisationId: params.organisationId,
      branchId:       params.branchId,
      tillId:         "TILL-01",
      saleNumber,
      cashierId:      params.cashierId,
      customerId:     params.customerId,
      status:         "completed",
      subtotal:       String(params.subtotal),
      taxAmount:      String(params.taxAmount),
      discountAmount: String(params.discountAmount),
      total:          String(params.total),
      completedAt:    new Date(),
    })
    .returning();

  if (params.items.length > 0) {
    await db.insert(saleItems).values(
      params.items.map(item => ({
        saleId:         sale.id,
        organisationId: params.organisationId,
        productId:      item.productId,
        sku:            item.sku,
        name:           item.name,
        quantity:       item.quantity,
        unitPrice:      String(item.unitPrice),
        taxRate:        String(item.taxRate),
        taxAmount:      String(item.taxAmount),
        discountPct:    String(item.discountPct),
        discountAmount: String(item.discountAmount),
        lineTotal:      String(item.lineTotal),
      }))
    );
  }

  return sale;
}

