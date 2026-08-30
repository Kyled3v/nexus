import { NextResponse } from "next/server";
import { getOrgContext } from "@/lib/org/context";
import { getProducts } from "@/repositories/products.repository";
import { hasPermission } from "@/lib/auth/permissions";

export async function GET(request: Request) {
  const ctx = await getOrgContext();
  if (!ctx) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (!hasPermission(ctx, "stock.view")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const status   = searchParams.get("status")   ?? "all";
  const page     = parseInt(searchParams.get("page")     ?? "1");
  const pageSize = parseInt(searchParams.get("pageSize") ?? "50");

  const result = await getProducts({
    organisationId: ctx.organisationId,
    status,
    page,
    pageSize,
  });

  return NextResponse.json({ ...result, source: "live" });
}
