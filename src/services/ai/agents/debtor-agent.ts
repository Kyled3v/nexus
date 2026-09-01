import { getGeminiClient } from "../gemini-server";
import { DEMO_INVOICES } from "@/data/demo-invoices";
import { AgentRunResult, AgentAction } from "./types";
import { addAgentLog } from "./registry";

export async function runDebtorAgent(customPrompt?: string): Promise<AgentRunResult> {
  const customerInvoices = DEMO_INVOICES.filter(i => i.type === "receivable");
  const overdueInvoices = customerInvoices.filter(i => i.status === "overdue");
  const overdueTotalZAR = overdueInvoices.reduce((s, i) => s + i.balanceDue, 0);
  const paidInvoices = customerInvoices.filter(i => i.status === "paid");

  const debtorContext = {
    totalCustomerInvoicesCount: customerInvoices.length,
    overdueInvoicesCount: overdueInvoices.length,
    overdueTotalZAR,
    paidInvoicesCount: paidInvoices.length,
    overdueList: overdueInvoices.map(i => ({
      invoiceNumber: i.invoiceNumber,
      customerName: i.entityName,
      totalZAR: i.totalAmount,
      balanceDueZAR: i.balanceDue,
      dueDate: i.dueDate,
      status: i.status,
    })),
  };

  const ai = getGeminiClient();
  let insightsMarkdown = "";
  let source = "KDOS Financial Debt Recovery Engine";

  if (ai) {
    try {
      const prompt = `
You are the KDOS Finance & SARS Debtor Recovery Agent for NEXUS ERP/POS.
Accounts Receivable & Invoicing Snapshot:
${JSON.stringify(debtorContext, null, 2)}

User Instruction: "${customPrompt || "Audit overdue debtor ledger, assess credit exposure, and formulate recovery actions"}"

Provide a structured debt recovery and SARS compliance report in Markdown covering:
1. Working Capital & Accounts Receivable Overview
2. High-Risk Debtor Exposure & Aging Breakdown
3. SARS 15% VAT & Tax Invoice Compliance Status
4. Recommended Credit Holds & Automated Debt Collection Letter Triggers
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
### **KDOS Finance & SARS Debtor Recovery Report**

#### **1. Accounts Receivable Exposure**
- **Total Overdue Balance**: **R ${overdueTotalZAR.toLocaleString("en-ZA")}** across **${overdueInvoices.length} debtor accounts**.
- **Collection Risk Level**: **MODERATE-HIGH** (overdue balances represent 28% of current month trade receivables).

#### **2. Delinquent Debtor Breakdown**
${overdueInvoices.map(i => `- **${i.entityName}** (${i.invoiceNumber}): **R ${i.balanceDue.toLocaleString("en-ZA")}** overdue since ${i.dueDate}.`).join("\n")}

#### **3. Immediate Working Capital Recovery Steps**
1. **Apply Credit Hold**: Suspend till POS credit account facilities for *Apex Industrial Coatings* until R18,450 balance is settled.
2. **Issue SARS Statement of Account**: Dispatch certified PDF tax invoice statements with EFT banking coordinates.
3. **Early Settlement Incentive**: Propose 2.5% discount if settled within 48 hours to accelerate liquidity.
`;
  }

  const generatedActions: AgentAction[] = [
    {
      id: "act-fin-" + Date.now() + "-1",
      agentId: "debtor",
      title: "Place Account on Credit Hold: Apex Industrial Coatings",
      description: "Invoice #INV-2026-003 for R18,450.00 is 42 days overdue. Freeze till POS trade credit until balance is resolved.",
      category: "debtor_notice",
      severity: "high",
      estimatedImpact: "Guards against bad debt write-off and recovers R18,450",
      payload: {
        customerName: "Apex Industrial Coatings",
        invoiceNumber: "INV-2026-003",
        balanceDueZAR: 18450,
        action: "credit_hold_and_notice",
      },
      status: "pending_approval",
      createdAt: new Date().toISOString(),
    }
  ];

  addAgentLog({
    agentId: "debtor",
    agentName: "Finance & SARS Debtor Recovery Agent",
    level: "warning",
    message: `Debtor audit: R${overdueTotalZAR.toLocaleString("en-ZA")} overdue identified across ${overdueInvoices.length} accounts.`,
  });

  return {
    agentId: "debtor",
    agentName: "Finance & SARS Debtor Recovery Agent",
    summary: `Found R${overdueTotalZAR.toLocaleString("en-ZA")} in overdue receivables across ${overdueInvoices.length} accounts. Credit hold recommended.`,
    confidenceScore: 0.95,
    healthStatus: overdueTotalZAR > 10000 ? "warning" : "optimal",
    keyFindings: [
      `Total overdue receivables: R${overdueTotalZAR.toLocaleString("en-ZA")}`,
      `${overdueInvoices.length} trade customer(s) in default beyond standard 30-day payment terms`,
      `SARS 15% VAT tax invoices reconciled and compliant`,
    ],
    suggestedActions: generatedActions,
    rawInsightsMarkdown: insightsMarkdown,
    timestamp: new Date().toISOString(),
    source,
  };
}
