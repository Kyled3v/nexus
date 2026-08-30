import { NextResponse } from "next/server";
import { getOrgContext } from "@/lib/org/context";
import { KdosClient } from "@/services/ai/kdos-client";

export async function GET() {
  const ctx = await getOrgContext();
  if (!ctx) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const context = {
    businessId: ctx.organisationId,
    branchId:   ctx.branches[0]?.id ?? "main",
    period:     "day" as const,
    data:       {},
  };

  const [recommendations, risks] = await Promise.all([
    KdosClient.getRecommendations(context),
    KdosClient.getRiskAlerts(context),
  ]);

  return NextResponse.json({ recommendations, risks });
}
