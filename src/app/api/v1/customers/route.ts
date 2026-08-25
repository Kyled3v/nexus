import { NextResponse } from "next/server";
import { getCustomers, createCustomer } from "@/repositories/customers.repository";
import { CreateCustomerSchema } from "@/lib/validation/schemas";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const page = parseInt(searchParams.get("page") ?? "1");
  const pageSize = parseInt(searchParams.get("pageSize") ?? "50");

  try {
    const result = await getCustomers({ search, status, page, pageSize });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = CreateCustomerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }
    // TODO: get organisationId from authenticated session
    const organisationId = "demo-business-001";
    const customer = await createCustomer(organisationId, parsed.data);
    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
  }
}
