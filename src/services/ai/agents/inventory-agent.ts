import { getGeminiClient } from "../gemini-server";
import { DEMO_PRODUCTS } from "@/data/demo-products";
import { DEMO_SUPPLIERS } from "@/data/demo-suppliers";
import { AgentRunResult, AgentAction } from "./types";
import { addAgentLog } from "./registry";

export async function runInventoryAgent(customPrompt?: string): Promise<AgentRunResult> {
  const lowStock = DEMO_PRODUCTS.filter(p => p.stockStatus === "low" || p.stockStatus === "critical");
  const outOfStock = DEMO_PRODUCTS.filter(p => p.stockStatus === "out");
  const overStock = DEMO_PRODUCTS.filter(p => p.stockStatus === "overstock");

  const inventoryContext = {
    totalSkus: DEMO_PRODUCTS.length,
    outOfStockItems: outOfStock.map(p => ({
      sku: p.sku,
      name: p.name,
      supplier: p.supplierName,
      targetStock: p.targetStock,
      costPriceZAR: p.costPrice
    })),
    lowStockItems: lowStock.map(p => ({
      sku: p.sku,
      name: p.name,
      current: p.currentStock,
      reorder: p.reorderLevel,
      targetStock: p.targetStock,
      supplier: p.supplierName
    })),
    overstockedItems: overStock.map(p => ({
      sku: p.sku,
      name: p.name,
      current: p.currentStock,
      max: p.maxStock,
      tiedCapitalZAR: (p.currentStock - p.targetStock) * p.costPrice
    })),
    suppliers: DEMO_SUPPLIERS.map(s => ({ name: s.name, leadTime: s.leadTimeDays, terms: s.paymentTerms }))
  };

  const ai = getGeminiClient();
  let insightsMarkdown = "";
  let source = "KDOS Stock Automation Engine";

  if (ai) {
    try {
      const prompt = `
You are the KDOS Stock & Replenishment Agent for NEXUS ERP/POS.
Live Inventory Context:
${JSON.stringify(inventoryContext, null, 2)}

User Instruction: "${customPrompt || "Perform an immediate replenishment and stockout audit across all warehouse branches"}"

Generate a structured inventory report in Markdown with:
1. Executive Inventory Summary
2. Imminent Stockout & Critical Replenishment Priorities (calculate exact order quantities = targetStock - currentStock)
3. Supplier Lead Time & Delivery SLA Risks
4. Recommended 1-Click Purchase Orders

Keep formatting crisp with bullet points and ZAR currency (R).
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
      // Fallback cleanly if quota/offline
    }
  }

  if (!insightsMarkdown) {
    insightsMarkdown = `
### **KDOS Stock & Replenishment Agent Report**

#### **1. Warehouse Stock Health Status**
- **Out of Stock (${outOfStock.length} SKUs)**: ${outOfStock.map(p => p.name).join(", ")}. Immediate PO required.
- **Low Stock Reorder (${lowStock.length} SKUs)**: ${lowStock.map(p => `${p.name} (${p.currentStock}/${p.reorderLevel} min)`).join("; ")}.
- **Overstocked Items (${overStock.length} SKUs)**: ${overStock.map(p => `${p.name} (${p.currentStock} units)`).join("; ")}.

#### **2. Automated Replenishment Action Plan**
- **PO #1**: Order **60 units** Rust-Oleum Primer 1L from *Rust-Oleum SA* (Est. Cost: R3,300).
- **PO #2**: Order **44 units** Plascon Exterior 5L from *Plascon SA* (Est. Cost: R7,040).
- **PO #3**: Order **42 units** Plascon Velvaglo 5L from *Plascon SA* (Est. Cost: R6,090).

#### **3. Supplier Lead Time Buffer**
- Plascon SA current lead time is **3 days**. Placing orders today ensures stock arrives before Saturday trade peak.
`;
  }

  const generatedActions: AgentAction[] = [
    {
      id: "act-inv-" + Date.now() + "-1",
      agentId: "inventory",
      title: "Generate PO: Rust-Oleum Primer 1L (60 units)",
      description: "Stock is at 0 units. Immediate order to Rust-Oleum SA required to prevent lost retail till sales.",
      category: "purchase_order",
      severity: "critical",
      estimatedImpact: "Recovers R5,700/wk in retail revenue",
      payload: {
        sku: "RUS-PRI-1L",
        productName: "Rust-Oleum Primer 1L",
        supplier: "Rust-Oleum SA",
        quantity: 60,
        unitCostZAR: 55,
        totalCostZAR: 3300,
      },
      status: "pending_approval",
      createdAt: new Date().toISOString(),
    },
    {
      id: "act-inv-" + Date.now() + "-2",
      agentId: "inventory",
      title: "Generate PO: Plascon Exterior 5L (44 units)",
      description: "Critical stock level: 1 unit remaining. Lead time 3 days.",
      category: "purchase_order",
      severity: "high",
      estimatedImpact: "Protects high-margin exterior paint contractor orders",
      payload: {
        sku: "PLA-EXT-5L",
        productName: "Plascon Exterior 5L",
        supplier: "Plascon SA",
        quantity: 44,
        unitCostZAR: 160,
        totalCostZAR: 7040,
      },
      status: "pending_approval",
      createdAt: new Date().toISOString(),
    }
  ];

  addAgentLog({
    agentId: "inventory",
    agentName: "Stock & Replenishment Agent",
    level: "info",
    message: `Replenishment analysis complete: ${outOfStock.length} stockouts, ${lowStock.length} low stock items identified.`,
  });

  return {
    agentId: "inventory",
    agentName: "Stock & Replenishment Agent",
    summary: `Identified ${outOfStock.length} out-of-stock SKUs and ${lowStock.length} critical reorder thresholds requiring Purchase Orders.`,
    confidenceScore: 0.96,
    healthStatus: outOfStock.length > 0 ? "critical" : lowStock.length > 0 ? "warning" : "optimal",
    keyFindings: [
      `${outOfStock.length} product(s) completely out of stock with daily demand`,
      `${lowStock.length} SKU(s) below safety stock reorder levels`,
      `Overstocked capital tied in ${overStock.length} SKU(s): R${overStock.reduce((s, p) => s + (p.currentStock - p.targetStock) * p.costPrice, 0).toLocaleString("en-ZA")}`,
    ],
    suggestedActions: generatedActions,
    rawInsightsMarkdown: insightsMarkdown,
    timestamp: new Date().toISOString(),
    source,
  };
}
