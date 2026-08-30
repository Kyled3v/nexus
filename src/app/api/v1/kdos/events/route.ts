import { NextResponse } from "next/server";
import { getOrgContext } from "@/lib/org/context";
import { KdosClient } from "@/services/ai/kdos-client";

export async function POST(request: Request) {
  const ctx = await getOrgContext();
  if (!ctx) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const body = await request.json() as { type: string; data: Record<string, unknown> };
    if (!body.type) return NextResponse.json({ error: "Event type is required" }, { status: 400 });

    await KdosClient.submitEvent({
      type:       body.type,
      businessId: ctx.organisationId,
      data:       body.data ?? {},
    });
    return NextResponse.json({ success: true, published: body.type });
  } catch {
    return NextResponse.json({ error: "Failed to publish event" }, { status: 500 });
  }
}
