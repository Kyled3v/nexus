import { NextRequest, NextResponse } from "next/server";
import { getOrgContext } from "@/lib/org/context";
import { chatWithOrchestrator } from "@/services/ai/agents/orchestrator";

export async function POST(req: NextRequest) {
  const ctx = await getOrgContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { message, history } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const response = await chatWithOrchestrator(message, history || []);

    return NextResponse.json({
      success: true,
      reply: response.text,
      source: response.source,
      proposedActions: response.proposedActions || [],
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to process chat message";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
