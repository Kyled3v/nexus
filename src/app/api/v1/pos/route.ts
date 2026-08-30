import { NextResponse } from "next/server";
import { getOrgContext } from "@/lib/org/context";
import { getProductsWithStock } from "@/repositories/products.repository";

export async function GET(request: Request) {
  const ctx = await getOrgContext();
  if (!ctx) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const branchId = ctx.branches[0]?.id;
  if (!branchId) return NextResponse.json({ error: "No branch configured" }, { status: 400 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? undefined;

  const products = await getProductsWithStock(ctx.organisationId, branchId, search);
  return NextResponse.json({ products, branchId, source: products.length > 0 ? "live" : "empty" });
}
