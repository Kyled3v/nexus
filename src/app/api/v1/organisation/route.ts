import { NextResponse } from "next/server";
import { getOrgContext } from "@/lib/org/context";

export async function GET() {
  const ctx = await getOrgContext();
  if (!ctx) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  return NextResponse.json({
    organisation: {
      id:          ctx.organisationId,
      name:        ctx.orgName,
      tradingName: ctx.orgTradingName,
      logoUrl:     ctx.orgLogoUrl,
      plan:        ctx.orgPlan,
    },
    branches:    ctx.branches,
    entitlement: ctx.entitlement,
    source:      "live",
  });
}
