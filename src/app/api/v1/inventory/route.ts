import { NextResponse } from "next/server";
import { getOrgContext } from "@/lib/org/context";
import { getInventoryLevels, adjustStock } from "@/repositories/inventory.repository";
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

export async function POST(request: Request) {
  const ctx = await getOrgContext();
  if (!ctx) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  if (!hasPermission(ctx, "stock.adjust")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const { productId, quantity, branchId } = body;
    if (!productId || quantity === undefined) {
      return NextResponse.json({ error: "productId and quantity are required" }, { status: 400 });
    }

    const targetBranch = branchId || ctx.branches[0]?.id || "demo-branch-main";
    const result = await adjustStock({
      organisationId: ctx.organisationId,
      branchId: targetBranch,
      productId,
      quantity: Number(quantity),
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to adjust stock";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}




