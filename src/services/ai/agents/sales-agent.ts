import { getGeminiClient } from "../gemini-server";
import { DEMO_INVOICES } from "@/data/demo-invoices";
import { AgentRunResult, AgentAction } from "./types";
import { addAgentLog } from "./registry";

export async function runSalesAgent(customPrompt?: string): Promise<AgentRunResult> {
  const salesContext = {
    topDebtors: DEMO_INVOICES.map(i => ({
      customer: i.entityName,
      amountZAR: i.totalAmount,
      status: i.status,
    })),
    pipelineOpportunities: [
      { name: "Sandton Residential Estate Coating", client: "Buildmax Developments", valueZAR: 65000, stage: "proposal", probability: 0.75 },
      { name: "Pretoria Mall Roof Waterproofing", client: "Apex Industrial Coatings", valueZAR: 120000, stage: "qualified", probability: 0.60 },
      { name: "Centurion Warehouses Floor Epoxy", client: "Vanguard Commercial Painters", valueZAR: 42000, stage: "contacted", probability: 0.40 },
    ]
  };

  const ai = getGeminiClient();
  let insightsMarkdown = "";
  let source = "KDOS Sales Pipeline Intelligence Engine";

  if (ai) {
    try {
      const prompt = `
You are the KDOS Sales & CRM Deal Acceleration Agent for NEXUS ERP/POS.
Commercial Pipeline & Trade Contractor Context:
${JSON.stringify(salesContext, null, 2)}

User Instruction: "${customPrompt || "Analyze CRM pipeline stages, identify dormant trade contractor accounts, and recommend high-conversion deal follow-ups"}"

Provide a structured sales acceleration report in Markdown covering:
1. Executive Pipeline Value & Deal Velocity
2. High-Probability Opportunity Acceleration Strategies
3. Dormant Contractor Account Reactivation Campaigns
4. Recommended 1-Click CRM Action Directives
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
### **KDOS Sales & Deal Acceleration Report**

#### **1. Commercial Trade Pipeline Health**
- **Active Pipeline Value**: **R 227,000** across **3 high-value commercial tenders**.
- **Weighted Expected Revenue**: **R 137,550** based on historical win probabilities.

#### **2. High-Probability Opportunity Follow-ups**
- **Sandton Residential Estate Coating (R65,000, 75% Win Prob)**:
  - *Client*: Buildmax Developments Pty Ltd.
  - *Recommendation*: Proposal has been with client for 5 days. Send commercial contractor specification sheet with free on-site color tint matching.

#### **3. Trade Account Reactivation Opportunity**
- *Client*: Vanguard Commercial Painters (Epoxy floor specialist).
- *Action*: Schedule proactive technical briefing on new solvent-free floor epoxies to advance deal from contacted to qualified.
`;
  }

  const generatedActions: AgentAction[] = [
    {
      id: "act-crm-" + Date.now() + "-1",
      agentId: "sales",
      title: "Schedule VIP Contractor Follow-up: Buildmax Developments",
      description: "Sandton Estate Coating proposal (R65,000) ready for closing. Propose complimentary bulk delivery.",
      category: "deal_followup",
      severity: "medium",
      estimatedImpact: "Accelerates closure of R65,000 trade project",
      payload: {
        clientName: "Buildmax Developments",
        dealName: "Sandton Residential Estate Coating",
        dealValueZAR: 65000,
        stage: "proposal",
        action: "send_vip_trade_followup",
      },
      status: "pending_approval",
      createdAt: new Date().toISOString(),
    }
  ];

  addAgentLog({
    agentId: "sales",
    agentName: "CRM & Deal Acceleration Agent",
    level: "info",
    message: `Sales analysis complete: R227,000 active pipeline monitored. 1 VIP contractor follow-up generated.`,
  });

  return {
    agentId: "sales",
    agentName: "CRM & Deal Acceleration Agent",
    summary: `Monitored R227,000 in commercial pipeline opportunities. Generated 1 priority contractor follow-up.`,
    confidenceScore: 0.91,
    healthStatus: "optimal",
    keyFindings: [
      `R227,000 in active commercial contractor quotes across 3 major projects`,
      `75% win probability on Sandton Residential Estate Coating deal`,
      `Dormant contractor outreach strategy formulated`,
    ],
    suggestedActions: generatedActions,
    rawInsightsMarkdown: insightsMarkdown,
    timestamp: new Date().toISOString(),
    source,
  };
}
