import { db } from "@/lib/db";
import { customers } from "@/lib/db/schema";
import { eq, ilike, or, and } from "drizzle-orm";
import type { CreateCustomerInput } from "@/lib/validation/schemas";

export async function getCustomers(organisationId: string, filters?: {
  search?:   string;
  status?:   string;
  page?:     number;
  pageSize?: number;
}) {
  const page     = filters?.page     ?? 1;
  const pageSize = filters?.pageSize ?? 50;
  const conditions = [eq(customers.organisationId, organisationId)];

  if (filters?.status && filters.status !== "all") {
    conditions.push(eq(customers.status, filters.status));
  }
  if (filters?.search) {
    conditions.push(
      or(
        ilike(customers.name,  `%${filters.search}%`),
        ilike(customers.email, `%${filters.search}%`),
        ilike(customers.phone, `%${filters.search}%`),
      )!
    );
  }

  const data = await db
    .select()
    .from(customers)
    .where(and(...conditions))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return { data, page, pageSize };
}

export async function createCustomer(organisationId: string, input: CreateCustomerInput) {
  const [customer] = await db
    .insert(customers)
    .values({
      organisationId,
      ...input,
      creditLimit: input.creditLimit != null ? String(input.creditLimit) : null,
    })
    .returning();
  return customer;
}

export async function getCustomerById(organisationId: string, id: string) {
  const [customer] = await db
    .select()
    .from(customers)
    .where(and(eq(customers.organisationId, organisationId), eq(customers.id, id)));
  return customer ?? null;
}

export async function getCustomerCount(organisationId: string) {
  const rows = await db
    .select({ id: customers.id })
    .from(customers)
    .where(and(eq(customers.organisationId, organisationId), eq(customers.status, "active")));
  return rows.length;
}
