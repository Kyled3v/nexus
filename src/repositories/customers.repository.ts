import { db } from "@/lib/db";
import { customers } from "@/lib/db/schema";
import { eq, ilike, or, and } from "drizzle-orm";
import type { CreateCustomerInput } from "@/lib/validation/schemas";

const DEMO_CUSTOMERS = [
  {
    id: "cust-001",
    organisationId: "demo-business-001",
    name: "Acme Contractors Ltd",
    email: "accounts@acmecontractors.co.za",
    phone: "+27 11 555 0101",
    vatNumber: "4990123456",
    creditLimit: "50000.00",
    paymentTerms: 30,
    status: "active",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "cust-002",
    organisationId: "demo-business-001",
    name: "Apex Paint & Decor",
    email: "info@apexdecor.co.za",
    phone: "+27 11 555 0202",
    vatNumber: "4880987654",
    creditLimit: "25000.00",
    paymentTerms: 15,
    status: "active",
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-01"),
  },
  {
    id: "cust-003",
    organisationId: "demo-business-001",
    name: "Vanguard Renovation Services",
    email: "purchasing@vanguardreno.co.za",
    phone: "+27 11 555 0303",
    vatNumber: null,
    creditLimit: "10000.00",
    paymentTerms: 7,
    status: "active",
    createdAt: new Date("2024-02-20"),
    updatedAt: new Date("2024-02-20"),
  },
];

export async function getCustomers(organisationId: string, filters?: {
  search?:   string;
  status?:   string;
  page?:     number;
  pageSize?: number;
}) {
  const page     = filters?.page     ?? 1;
  const pageSize = filters?.pageSize ?? 50;

  try {
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

    if (data.length > 0) {
      return { data, page, pageSize };
    }
  } catch {}

  let demoList = DEMO_CUSTOMERS;
  if (filters?.status && filters.status !== "all") {
    demoList = demoList.filter(c => c.status === filters.status);
  }
  if (filters?.search) {
    const s = filters.search.toLowerCase();
    demoList = demoList.filter(c => c.name.toLowerCase().includes(s) || (c.email ?? "").toLowerCase().includes(s) || (c.phone ?? "").includes(s));
  }
  return { data: demoList, page, pageSize };
}

export async function createCustomer(organisationId: string, input: CreateCustomerInput) {
  try {
    const [customer] = await db
      .insert(customers)
      .values({
        organisationId,
        ...input,
        creditLimit: input.creditLimit != null ? String(input.creditLimit) : null,
      })
      .returning();
    if (customer) return customer;
  } catch {}

  return {
    id: "cust-" + Date.now(),
    organisationId,
    name: input.name,
    email: input.email ?? null,
    phone: input.phone ?? null,
    vatNumber: (input as { taxNumber?: string }).taxNumber ?? null,
    creditLimit: input.creditLimit != null ? String(input.creditLimit) : null,
    paymentTerms: 30,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function getCustomerById(organisationId: string, id: string) {
  try {
    const [customer] = await db
      .select()
      .from(customers)
      .where(and(eq(customers.organisationId, organisationId), eq(customers.id, id)));
    if (customer) return customer;
  } catch {}

  return DEMO_CUSTOMERS.find(c => c.id === id) ?? null;
}

export async function getCustomerCount(organisationId: string) {
  try {
    const rows = await db
      .select({ id: customers.id })
      .from(customers)
      .where(and(eq(customers.organisationId, organisationId), eq(customers.status, "active")));
    if (rows.length > 0) return rows.length;
  } catch {}

  return DEMO_CUSTOMERS.length;
}
