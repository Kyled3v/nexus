import { NextResponse } from "next/server";
import { getOrganisationById, getOrganisationBranches, getOrganisationEntitlement } from "@/repositories/organisation.repository";
import { DEMO_BUSINESS, DEMO_BRANCHES } from "@/data/demo-business";
import { DEV_ENTITLEMENT } from "@/config/modules";

export async function GET() {
  return NextResponse.json({
    organisation: DEMO_BUSINESS,
    branches: DEMO_BRANCHES,
    entitlement: DEV_ENTITLEMENT,
    source: "demo",
  });
}
