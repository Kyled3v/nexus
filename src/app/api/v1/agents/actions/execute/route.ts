import { NextRequest, NextResponse } from "next/server";
import { getOrgContext } from "@/lib/org/context";
import { approveAgentAction, dismissAgentAction } from "@/services/ai/agents/registry";

export async function POST(req: NextRequest) {
  const ctx = await getOrgContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { actionId, decision } = body;

    if (!actionId) {
      return NextResponse.json({ error: "actionId is required" }, { status: 400 });
    }

    if (decision === "dismiss") {
      const dismissed = dismissAgentAction(actionId);
      return NextResponse.json({ success: true, dismissed });
    }

    // Default to approve & execute
    const executedAction = approveAgentAction(actionId, ctx.userName || "System Admin");
    if (!executedAction) {
      return NextResponse.json({ error: "Action not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      action: executedAction,
      message: `Action '${executedAction.title}' executed successfully.`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to execute agent action";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
