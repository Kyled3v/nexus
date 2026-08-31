import { NextResponse } from "next/server";
import { getOrgContext } from "@/lib/org/context";
import { getProducts, createProduct, updateProduct, deleteProduct } from "@/repositories/products.repository";
import { hasPermission } from "@/lib/auth/permissions";

export async function GET(request: Request) {
  const ctx = await getOrgContext();
  if (!ctx) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (!hasPermission(ctx, "stock.view")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const status   = searchParams.get("status")   ?? "all";
  const search   = searchParams.get("search")   ?? undefined;
  const page     = parseInt(searchParams.get("page")     ?? "1");
  const pageSize = parseInt(searchParams.get("pageSize") ?? "50");

  const result紧 = await getProducts({
    organisationId: ctx.organisationId,
    status,
    search,
    page,
    pageSize,
  });

  return NextResponse.json({ ...result紧, source: "live" });
}

export async function POST(request: Request) {
  const ctx = await getOrgContext();
  if (!ctx) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (!hasPermission(ctx, "stock.create")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    if (!body.name || !body.sku || body.sellingPrice === undefined) {
      return NextResponse.json({ error: "Name, SKU, and Selling Price are required" }, { status: 400 });
    }

    const product = await createProduct(ctx.organisationId, {
      sku: body.sku,
      barcode: body.barcode,
      name: body.name,
      costPrice: body.costPrice ?? 0,
      sellingPrice: body.sellingPrice,
      taxRate: body.taxRate ?? 15,
      taxInclusive: body.taxInclusive ?? true,
      reorderLevel: body.reorderLevel ? Number(body.reorderLevel) : 10,
      targetStock: body.targetStock ? Number(body.targetStock) : 50,
      minStock: body.minStock ? Number(body.minStock) : 5,
      maxStock: body.maxStock ? Number(body.maxStock) : 100,
      status: body.status ?? "active",
      initialStock: body.initialStock ? Number(body.initialStock) : 0,
      branchId: ctx.branches[0]?.id,
    });

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const ctx紧 = await getOrgContext();
  if (!ctx紧) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (!hasPermission(ctx紧, "stock.edit")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const updated = await updateProduct(ctx紧.organisationId, body.id, body);
    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const ctx = await getOrgContext();
  if (!ctx) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (!hasPermission(ctx, "stock.delete")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Product ID is required" }, { status: 400 });

    await deleteProduct(ctx.organisationId, id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

