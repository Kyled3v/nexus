import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { DEMO_PRODUCTS } from "@/data/demo-products";
import { DEMO_SUPPLIERS } from "@/data/demo-suppliers";
import { DEMO_INVOICES } from "@/data/demo-invoices";
import { DEMO_TRANSFERS } from "@/data/demo-transfers";

let aiClient: GoogleGenAI | null = null;

function getAi(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const question = body.question || "";
    const analysisType = body.analysisType || "executive_overview";

    // Gather Live System Data
    const lowStockItems = DEMO_PRODUCTS.filter((p) => p.stockStatus === "low" || p.stockStatus === "critical");
    const outOfStockItems = DEMO_PRODUCTS.filter((p) => p.stockStatus === "out");
    const overdueInvoices = DEMO_INVOICES.filter((i) => i.status === "overdue");
    const overdueTotal = overdueInvoices.reduce((s, i) => s + i.balanceDue, 0);
    const inTransitTransfers = DEMO_TRANSFERS.filter((t) => t.status === "in_transit");

    const contextData = {
      totalProductsCount: DEMO_PRODUCTS.length,
      lowStockCount: lowStockItems.length,
      lowStockSample: lowStockItems.map((p) => ({ name: p.name, current: p.currentStock, reorder: p.reorderLevel })),
      outOfStockCount: outOfStockItems.length,
      outOfStockSample: outOfStockItems.map((p) => p.name),
      suppliersCount: DEMO_SUPPLIERS.length,
      overdueInvoicesCount: overdueInvoices.length,
      overdueTotalZAR: overdueTotal,
      inTransitTransfersCount: inTransitTransfers.length,
      timestamp: new Date().toISOString(),
    };

    const ai = getAi();

    if (ai) {
      const prompt = `
You are the Chief Commercial & AI Analytics Advisor for NEXUS ERP/POS (operating across retail hardware, paint manufacturing, and commercial distribution in South Africa).

Here is the current live ERP snapshot:
${JSON.stringify(contextData, null, 2)}

User Query / Analysis Focus: "${question || analysisType}"

Provide a concise, professional executive advisory containing:
1. Executive Summary & Revenue Health
2. High-Priority Inventory & Stockout Actions (specifically naming SKUs that need POs)
3. Working Capital & Cashflow Risk (overdue debtor recovery)
4. Strategic Optimization Recommendations

Keep the tone sharp, executive, clear, formatted in clean Markdown with bold bullet points. All currency in ZAR (R).
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      return NextResponse.json({
        success: true,
        source: "gemini-2.5-flash",
        insights: response.text,
        metricsSnapshot: contextData,
      });
    }

    // High-quality automated deterministic fallback when GEMINI_API_KEY is not configured
    const fallbackMarkdown = `
### **NEXUS Executive Intelligence Report**

#### **1. Operational & Revenue Pulse**
- **Catalogue Health**: Managing **${contextData.totalProductsCount} core SKUs** across active branches and central DC.
- **Supply Pipeline**: **${contextData.inTransitTransfersCount} inter-branch stock transfers** are currently in transit between warehouses and retail stores.

#### **2. Immediate Inventory & Stockout Warnings**
- **Critical Stockouts (${contextData.outOfStockCount} items)**: ${contextData.outOfStockSample.length ? contextData.outOfStockSample.join(", ") : "None"}. *Immediate purchase orders recommended to avoid lost till sales.*
- **Reorder Threshold Alerts (${contextData.lowStockCount} items)**: ${contextData.lowStockSample.map((p) => `${p.name} (${p.current} left / reorder at ${p.reorder})`).join("; ")}.

#### **3. Working Capital & Cashflow Management**
- **Overdue Accounts Receivable**: **R ${contextData.overdueTotalZAR.toLocaleString("en-ZA")}** across **${contextData.overdueInvoicesCount} overdue debtor invoices**.
- **Action Required**: Dispatch automated SARS tax invoice statement reminders to recover debtor capital before month-end supplier payables mature.

#### **4. Recommended Next Steps**
1. Generate replenishment Purchase Orders for Dulux & Plascon suppliers.
2. Confirm receipt (GRV) of in-transit waybill transfers at Sandton and Durban outlets.
3. Review gross profit margins on fast-moving enamel coatings and solvents.
`;

    return NextResponse.json({
      success: true,
      source: "analytics-engine-fallback",
      insights: fallbackMarkdown,
      metricsSnapshot: contextData,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to generate AI insights";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
