import { NextResponse } from "next/server";
import { getOrgContext } from "@/lib/org/context";
import { getAgentProfiles, getAgentActions, getAgentLogs } from "@/services/ai/agents/registry";

export async function GET() {
  const ctx = await getOrgContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profiles = getAgentProfiles();
  const pendingActions = getAgentActions("pending_approval");
  const allActions = getAgentActions();
  const logs = getAgentLogs(25);

  const fleetMetrics = {
    totalAgents: profiles.length,
    activeAgents: profiles.filter(p => p.status === "active").length,
    pendingApprovalsCount: pendingActions.length,
    executedActionsCount: allActions.filter(a => a.status === "executed").length,
    systemOperationalHealth: "optimal",
  };

  return NextResponse.json({
    success: true,
    fleetMetrics,
    agents: profiles,
    pendingActions,
    recentLogs: logs,
  });
}
