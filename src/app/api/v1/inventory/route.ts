import { NextResponse } from "next/server";
import { DEMO_PRODUCTS } from "@/data/demo-products";
import { generateStockIntelligenceReport } from "@/services/automation/stock-intelligence";
import { DEMO_BUSINESS, DEMO_BRANCHES } from "@/data/demo-business";

// GET /api/v1/inventory
// Returns inventory levels and stock intelligence for the current organisation.
export async function GET() {
  const report = generateStockIntelligenceReport(
    DEMO_PRODUCTS,
    DEMO_BUSINESS.id,
    DEMO_BRANCHES[0].id
  );

  return NextResponse.json({
    inventory: DEMO_PRODUCTS.map(p => ({
      productId: p.id,
      sku: p.sku,
      name: p.name,
      currentStock: p.currentStock,
      availableStock: p.availableStock,
      reservedStock: p.reservedStock,
      stockStatus: p.stockStatus,
      reorderLevel: p.reorderLevel,
      targetStock: p.targetStock,
    })),
    intelligence: {
      summary: report.summary,
      alerts: report.alerts,
      totalValue: report.totalValue,
    },
  });
}
