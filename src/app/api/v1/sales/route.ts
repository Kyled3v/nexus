import { NextResponse } from "next/server";
import { getOrgContext } from "@/lib/org/context";
import { getSales, getDailySummary } from "@/repositories/sales.repository";

export async function GET(request: Request) {
  const ctx = await getOrgContext();
  if (!ctx) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const branchId = searchParams.get("branchId") ?? undefined;
  const status   = searchParams.get("status")   ?? undefined;
  const summary  = searchParams.get("summary")  === "true";
  const page     = parseInt(searchParams.get("page")     ?? "1");
  const pageSize = parseInt(searchParams.get("pageSize") ?? "50");

  if (summary) {
    const daily = await getDailySummary(ctx.organisationId, branchId);
    return NextResponse.json(daily);
  }

  const result = await getSales(ctx.organisationId, { branchId, status, page, pageSize });
  return NextResponse.json(result);
}
