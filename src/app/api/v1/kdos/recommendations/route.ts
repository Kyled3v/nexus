import { NextResponse } from "next/server";
import { KdosClient } from "@/services/ai/kdos-client";
import { DEMO_BUSINESS, DEMO_BRANCHES } from "@/data/demo-business";

// GET /api/v1/kdos/recommendations
// Returns KDOS intelligence recommendations for the current organisation.
// In production: authenticated, rate-limited, cached.
export async function GET() {
  const context = {
    businessId: DEMO_BUSINESS.id,
    branchId: DEMO_BRANCHES[0].id,
    period: "day" as const,
    data: {},
  };

  const [recommendations, risks] = await Promise.all([
    KdosClient.getRecommendations(context),
    KdosClient.getRiskAlerts(context),
  ]);

  return NextResponse.json({ recommendations, risks });
}
