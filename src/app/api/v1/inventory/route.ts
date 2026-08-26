import { NextResponse } from "next/server";
import { getInventoryLevels } from "@/repositories/inventory.repository";
import { DEMO_PRODUCTS } from "@/data/demo-products";
import { generateStockIntelligenceReport } from "@/services/automation/stock-intelligence";
import { DEMO_BUSINESS, DEMO_BRANCHES } from "@/data/demo-business";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const branchId = searchParams.get("branchId") ?? undefined;

  try {
    const inventory = await getInventoryLevels("demo-business-001", branchId);
    return NextResponse.json({ inventory, source: "live" });
  } catch {
    const report = generateStockIntelligenceReport(DEMO_PRODUCTS, DEMO_BUSINESS.id, DEMO_BRANCHES[0].id);
    return NextResponse.json({
      inventory: DEMO_PRODUCTS.map(p => ({
        productId: p.id, sku: p.sku, name: p.name,
        currentStock: p.currentStock, availableStock: p.availableStock,
        reservedStock: p.reservedStock, stockStatus: p.stockStatus,
        reorderLevel: p.reorderLevel, targetStock: p.targetStock,
      })),
      intelligence: { summary: report.summary, alerts: report.alerts, totalValue: report.totalValue },
      source: "demo",
    });
  }
}
