import { NextRequest, NextResponse } from "next/server";
import { getOrgContext } from "@/lib/org/context";
import { DEMO_SUPPLIERS } from "@/data/demo-suppliers";

let suppliersStore = [...DEMO_SUPPLIERS];

export async function GET(req: NextRequest) {
  const ctx = await getOrgContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.toLowerCase();
  const status = searchParams.get("status");

  let filtered = [...suppliersStore];

  if (search) {
    filtered = filtered.filter(
      (s) =>
        s.name.toLowerCase().includes(search) ||
        s.code.toLowerCase().includes(search) ||
        s.contactName?.toLowerCase().includes(search) ||
        s.email?.toLowerCase().includes(search)
    );
  }

  if (status && status !== "all") {
    filtered = filtered.filter((s) => s.status === status);
  }

  return NextResponse.json({
    success: true,
    data: filtered,
    total: filtered.length,
  });
}

export async function POST(req: NextRequest) {
  const ctx = await getOrgContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.name || !body.code) {
      return NextResponse.json({ error: "Name and Code are required" }, { status: 400 });
    }

    const newSupplier = {
      id: `sup-${Date.now()}`,
      businessId: ctx.organisationId || "demo-business-001",
      name: String(body.name),
      code: String(body.code).toUpperCase(),
      contactName: body.contactName ? String(body.contactName) : undefined,
      email: body.email ? String(body.email) : undefined,
      phone: body.phone ? String(body.phone) : undefined,
      address: body.address ? String(body.address) : undefined,
      taxNumber: body.taxNumber ? String(body.taxNumber) : undefined,
      paymentTerms: body.paymentTerms ? String(body.paymentTerms) : "Net 30 Days",
      leadTimeDays: Number(body.leadTimeDays) || 3,
      rating: Number(body.rating) || 5.0,
      status: (body.status === "inactive" ? "inactive" : "active") as "active" | "inactive",
      notes: body.notes ? String(body.notes) : undefined,
      bankName: body.bankName ? String(body.bankName) : undefined,
      accountNumber: body.accountNumber ? String(body.accountNumber) : undefined,
      branchCode: body.branchCode ? String(body.branchCode) : undefined,
      totalOrdersCount: 0,
      totalSpend: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    suppliersStore = [newSupplier, ...suppliersStore];
    return NextResponse.json({ success: true, data: newSupplier }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create supplier";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const ctx = await getOrgContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: "Supplier ID required" }, { status: 400 });
    }

    const index = suppliersStore.findIndex((s) => s.id === body.id);
    if (index === -1) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
    }

    suppliersStore[index] = {
      ...suppliersStore[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, data: suppliersStore[index] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update supplier";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const ctx = await getOrgContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Supplier ID required" }, { status: 400 });
  }

  suppliersStore = suppliersStore.filter((s) => s.id !== id);
  return NextResponse.json({ success: true });
}
