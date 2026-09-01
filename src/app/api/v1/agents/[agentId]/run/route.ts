import { NextRequest, NextResponse } from "next/server";
import { getOrgContext } from "@/lib/org/context";
import { runOrchestratorAgent } from "@/services/ai/agents/orchestrator";
import { runInventoryAgent } from "@/services/ai/agents/inventory-agent";
import { runPricingAgent } from "@/services/ai/agents/pricing-agent";
import { runDebtorAgent } from "@/services/ai/agents/debtor-agent";
import { runLogisticsAgent } from "@/services/ai/agents/logistics-agent";
import { runSalesAgent } from "@/services/ai/agents/sales-agent";
import { runMarketingAgent } from "@/services/ai/agents/marketing-agent";
import { runSocialAgent } from "@/services/ai/agents/social-agent";
import { AgentId, AgentRunResult } from "@/services/ai/agents/types";

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ agentId: string }> }
) {
  const ctx = await getOrgContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { agentId } = await props.params;
  const body = await req.json().catch(() => ({}));
  const customPrompt = body.prompt || "";

  try {
    let result: AgentRunResult;

    switch (agentId as AgentId) {
      case "orchestrator":
        result = await runOrchestratorAgent(customPrompt);
        break;
      case "inventory":
        result = await runInventoryAgent(customPrompt);
        break;
      case "pricing":
        result = await runPricingAgent(customPrompt);
        break;
      case "debtor":
        result = await runDebtorAgent(customPrompt);
        break;
      case "logistics":
        result = await runLogisticsAgent(customPrompt);
        break;
      case "sales":
        result = await runSalesAgent(customPrompt);
        break;
      case "marketing":
        result = await runMarketingAgent(customPrompt);
        break;
      case "social":
        result = await runSocialAgent(customPrompt);
        break;
      default:
        return NextResponse.json({ error: `Unknown agent identifier: ${agentId}` }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to execute agent analysis";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
