import { NextResponse } from "next/server";
import { getOrgContext } from "@/lib/org/context";
import { createSale, decrementStockForSale } from "@/repositories/sales.repository";
import { hasPermission } from "@/lib/auth/permissions";

export async function POST(request: Request) {
  const ctx = await getOrgContext();
  if (!ctx) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  if (!hasPermission(ctx, "pos.sell")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const branchId = ctx.branches[0]?.id;
  if (!branchId) return NextResponse.json({ error: "No branch configured" }, { status: 400 });

  const body = await request.json();
  const { items, subtotal, taxAmount, discountAmount, total, paymentMethod, customerId } = body;

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const sale = await createSale({
    organisationId: ctx.organisationId,
    branchId,
    cashierId:      ctx.userId,
    items,
    subtotal,
    taxAmount,
    discountAmount,
    total,
    paymentMethod,
    customerId,
  });

  await decrementStockForSale({
    organisationId: ctx.organisationId,
    branchId,
    items,
  });

  return NextResponse.json({ success: true, saleId: sale.id, saleNumber: sale.saleNumber });
}
