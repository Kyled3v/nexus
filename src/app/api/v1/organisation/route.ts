import { NextResponse } from "next/server";
import { DEMO_BUSINESS, DEMO_BRANCHES } from "@/data/demo-business";
import { DEV_ENTITLEMENT } from "@/config/modules";

// GET /api/v1/organisation
// Returns the current organisation context.
// In production: fetches from Supabase using the authenticated user session.
export async function GET() {
  // TODO: replace with real Supabase query using createServerClient
  return NextResponse.json({
    organisation: {
      id: DEMO_BUSINESS.id,
      name: DEMO_BUSINESS.name,
      tradingName: DEMO_BUSINESS.tradingName,
      currency: DEMO_BUSINESS.currency,
      timezone: DEMO_BUSINESS.timezone,
      status: DEMO_BUSINESS.status,
      settings: DEMO_BUSINESS.settings,
    },
    branches: DEMO_BRANCHES,
    entitlement: DEV_ENTITLEMENT,
  });
}
