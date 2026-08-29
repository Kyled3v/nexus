import { NextResponse } from "next/server";
import { getOrgContext } from "@/lib/org/context";
import { getCustomers, createCustomer } from "@/repositories/customers.repository";
import { CreateCustomerSchema } from "@/lib/validation/schemas";

export async function GET(request: Request) {
  const ctx = await getOrgContext();
  if (!ctx) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const result = await getCustomers(ctx.organisationId, {
    search:   searchParams.get("search")   ?? undefined,
    status:   searchParams.get("status")   ?? undefined,
    page:     parseInt(searchParams.get("page")     ?? "1"),
    pageSize: parseInt(searchParams.get("pageSize") ?? "50"),
  });
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const ctx = await getOrgContext();
  if (!ctx) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body   = await request.json();
  const parsed = CreateCustomerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const customer = await createCustomer(ctx.organisationId, parsed.data);
  return NextResponse.json(customer, { status: 201 });
}
