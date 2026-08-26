import { db } from "@/lib/db";
import { customers } from "@/lib/db/schema";
import { eq, ilike, or, and } from "drizzle-orm";
import type { CreateCustomerInput } from "@/lib/validation/schemas";

export async function getCustomers(filters?: {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 50;
  const conditions = [];

  if (filters?.status && filters.status !== "all") {
    conditions.push(eq(customers.status, filters.status));
  }

  const data = await db
    .select()
    .from(customers)
    .where(conditions.length ? and(...conditions) : undefined)
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return { data, page, pageSize };
}

export async function createCustomer(organisationId: string, input: CreateCustomerInput) {
  const [customer] = await db
    .insert(customers)
    .values({ organisationId, ...input, creditLimit: input.creditLimit != null ? String(input.creditLimit) : null })
    .returning();
  return customer;
}

export async function getCustomerById(id: string) {
  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, id));
  return customer ?? null;
}
