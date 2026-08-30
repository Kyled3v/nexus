import { NextResponse } from "next/server";
import { getOrgContext } from "@/lib/org/context";
import { getInventoryLevels } from "@/repositories/inventory.repository";
import { hasPermission } from "@/lib/auth/permissions";
import { DEMO_PRODUCTS } from "@/data/demo-products";
import { generateStockIntelligenceReport } from "@/services/automation/stock-intelligence";

export async function GET(request: Request) {
  const ctx = await getOrgContext();
  if (!ctx) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  if (!hasPermission(ctx, "stock.view")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const branchId = searchParams.get("branchId") ?? undefined;

  try {
    const inventory = await getInventoryLevels(ctx.organisationId, branchId);
    return NextResponse.json({ inventory, source: "live" });
  } catch {
    const brId = ctx.branches[0]?.id ?? "main";
    const report = generateStockIntelligenceReport(DEMO_PRODUCTS, ctx.organisationId, brId);
    return NextResponse.json({
      inventory: DEMO_PRODUCTS.map(p => ({
        productId:    p.id,
        sku:          p.sku,
        name:         p.name,
        currentStock: p.currentStock,
        reservedStock:p.reservedStock,
        stockStatus:  p.stockStatus,
        reorderLevel: p.reorderLevel,
        targetStock:  p.targetStock,
      })),
      intelligence: { summary: report.summary, alerts: report.alerts, totalValue: report.totalValue },
      source: "demo",
    });
  }
}


