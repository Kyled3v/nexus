import { NextResponse } from "next/server";
import { getOrganisation } from "@/repositories/organisation.repository";
import { DEMO_BUSINESS, DEMO_BRANCHES } from "@/data/demo-business";
import { DEV_ENTITLEMENT } from "@/config/modules";

export async function GET() {
  try {
    const context = await getOrganisation();
    if (context) return NextResponse.json({ ...context, source: "live" });
    // Not authenticated yet — return demo context
    return NextResponse.json({
      organisation: DEMO_BUSINESS,
      branches: DEMO_BRANCHES,
      entitlement: DEV_ENTITLEMENT,
      source: "demo",
    });
  } catch {
    return NextResponse.json({
      organisation: DEMO_BUSINESS,
      branches: DEMO_BRANCHES,
      entitlement: DEV_ENTITLEMENT,
      source: "demo",
    });
  }
}
