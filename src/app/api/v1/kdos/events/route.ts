import { NextResponse } from "next/server";
import { KdosClient } from "@/services/ai/kdos-client";
import { DEMO_BUSINESS } from "@/data/demo-business";

// POST /api/v1/kdos/events
// Publishes a business event to the KDOS integration layer.
export async function POST(request: Request) {
  try {
    const body = await request.json() as { type: string; data: Record<string, unknown> };

    if (!body.type) {
      return NextResponse.json({ error: "Event type is required" }, { status: 400 });
    }

    await KdosClient.submitEvent({
      type: body.type,
      businessId: DEMO_BUSINESS.id,
      data: body.data ?? {},
    });

    return NextResponse.json({ success: true, published: body.type });
  } catch {
    return NextResponse.json({ error: "Failed to publish event" }, { status: 500 });
  }
}
