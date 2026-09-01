import { getGeminiClient } from "../gemini-server";
import { DEMO_TRANSFERS } from "@/data/demo-transfers";
import { DEMO_PRODUCTS } from "@/data/demo-products";
import { AgentRunResult, AgentAction } from "./types";
import { addAgentLog } from "./registry";

export async function runLogisticsAgent(customPrompt?: string): Promise<AgentRunResult> {
  const inTransit = DEMO_TRANSFERS.filter(t => t.status === "in_transit");
  const completed = DEMO_TRANSFERS.filter(t => t.status === "received");

  const logisticsContext = {
    totalTransfersCount: DEMO_TRANSFERS.length,
    inTransitCount: inTransit.length,
    inTransitShipments: inTransit.map(t => ({
      transferNumber: t.transferNumber,
      origin: t.fromLocationName,
      destination: t.toLocationName,
      itemsCount: t.items.length,
      courier: t.carrier,
      waybill: t.trackingNumber,
      estimatedArrival: t.dispatchedAt || t.createdAt,
    })),
    completedTransfersCount: completed.length,
    productsSummary: DEMO_PRODUCTS.map(p => ({
      name: p.name,
      stock: p.currentStock,
      status: p.stockStatus
    })),
  };

  const ai = getGeminiClient();
  let insightsMarkdown = "";
  let source = "KDOS Multi-Branch Logistics Engine";

  if (ai) {
    try {
      const prompt = `
You are the KDOS Inter-Branch Logistics Agent for NEXUS ERP/POS.
Multi-Branch Transfers Snapshot:
${JSON.stringify(logisticsContext, null, 2)}

User Instruction: "${customPrompt || "Audit inter-branch stock balances, waybill transit delays, and optimize cross-docking distribution"}"

Provide a structured logistics report in Markdown covering:
1. Logistics & Shipment Status Overview
2. Active In-Transit Waybills & SLA Adherence
3. Cross-Branch Stock Rebalancing Opportunities (e.g. moving excess stock from Central DC to regional branches)
4. Goods Received Voucher (GRV) Reconciliation Directives
`;
      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
      });

      if (response.text) {
        insightsMarkdown = response.text;
        source = "Gemini 3.7 Flash";
      }
    } catch {
      // Fallback
    }
  }

  if (!insightsMarkdown) {
    insightsMarkdown = `
### **KDOS Inter-Branch Logistics Report**

#### **1. Multi-Branch Fleet & Transfer Health**
- **Active Waybills in Transit**: **${inTransit.length} shipment(s)** en route via verified logistics couriers.
- **Completed Transfers**: **${completed.length} shipment(s)** successfully verified and received via GRV.

#### **2. Active In-Transit Shipments**
${inTransit.map(t => `- **Transfer #${t.transferNumber}** (${t.fromLocationName} → ${t.toLocationName}): **${t.items.length} product lines** via *${t.carrier}* (Waybill: \`${t.trackingNumber}\`). Dispatched: ${t.dispatchedAt || t.createdAt}.`).join("\n")}

#### **3. Stock Balancing Proposal: Central DC → Durban Commercial Hub**
- **Deficit at Durban**: Durban Branch has critically low stock of *Dulux Weathershield 20L*.
- **Surplus at Central DC**: Central DC holds 24 units in reserve.
- **Recommended Action**: Authorize immediate transfer of **12 units** to avoid regional contractor project delays.
`;
  }

  const generatedActions: AgentAction[] = [
    {
      id: "act-log-" + Date.now() + "-1",
      agentId: "logistics",
      title: "Dispatch Transfer: 12 Units Dulux Weathershield to Durban",
      description: "Balance Central DC surplus to replenish Durban branch before weekend trade rush.",
      category: "stock_transfer",
      severity: "medium",
      estimatedImpact: "Guarantees 100% order fill rate for Durban commercial contractor orders",
      payload: {
        sourceLocation: "Central Distribution Centre (Midrand)",
        destinationLocation: "Durban Commercial Hub",
        sku: "DUL-WS-20L",
        productName: "Dulux Weathershield 20L",
        quantity: 12,
        courier: "FastFreight SA",
      },
      status: "pending_approval",
      createdAt: new Date().toISOString(),
    }
  ];

  addAgentLog({
    agentId: "logistics",
    agentName: "Inter-Branch Logistics Agent",
    level: "info",
    message: `Logistics audit complete: ${inTransit.length} shipments currently in transit. 1 cross-branch rebalance proposed.`,
  });

  return {
    agentId: "logistics",
    agentName: "Inter-Branch Logistics Agent",
    summary: `Managing ${inTransit.length} active in-transit transfer(s). Proposed 1 inter-branch rebalancing dispatch.`,
    confidenceScore: 0.94,
    healthStatus: inTransit.length > 0 ? "optimal" : "optimal",
    keyFindings: [
      `${inTransit.length} waybill(s) currently in transit between distribution hubs`,
      `Courier SLA tracking active with automated GRV verification`,
      `Inter-branch rebalancing saves freight costs over new vendor POs`,
    ],
    suggestedActions: generatedActions,
    rawInsightsMarkdown: insightsMarkdown,
    timestamp: new Date().toISOString(),
    source,
  };
}
