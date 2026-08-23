import type { ProductWithStock } from "@/domain/products/types";
import type { StockLevel } from "@/domain/inventory/types";

export type StockRisk = "none" | "low_stock" | "critical" | "stockout" | "overstock" | "slow_moving";

export interface StockInsight {
  productId: string;
  productName: string;
  sku: string;
  currentStock: number;
  reorderLevel: number;
  targetStock: number;
  minStock: number;
  maxStock: number;
  risk: StockRisk;
  riskLabel: string;
  recommendation: string;
  recommendedOrderQty?: number;
  daysOfStock?: number;
  stockValue: number;
  urgency: "none" | "low" | "medium" | "high" | "critical";
}

export interface StockIntelligenceReport {
  generatedAt: string;
  businessId: string;
  branchId: string;
  totalProducts: number;
  totalValue: number;
  insights: StockInsight[];
  summary: {
    ok: number;
    lowStock: number;
    critical: number;
    outOfStock: number;
    overstock: number;
  };
  alerts: StockAlert[];
}

export interface StockAlert {
  id: string;
  type: StockRisk;
  severity: "info" | "warning" | "critical";
  productId: string;
  productName: string;
  message: string;
  action: string;
  createdAt: string;
}

export function classifyStockRisk(product: ProductWithStock): StockRisk {
  if (product.currentStock <= 0) return "stockout";
  if (product.currentStock <= product.minStock) return "critical";
  if (product.currentStock <= product.reorderLevel) return "low_stock";
  if (product.currentStock >= product.maxStock * 0.9) return "overstock";
  return "none";
}

export function calculateRecommendedOrderQty(product: ProductWithStock): number {
  if (product.currentStock >= product.reorderLevel) return 0;
  return Math.max(0, product.targetStock - product.currentStock);
}

export function generateStockInsight(product: ProductWithStock, costPrice: number): StockInsight {
  const risk = classifyStockRisk(product);
  const recommendedOrderQty = calculateRecommendedOrderQty(product);
  const stockValue = product.currentStock * costPrice;

  const riskConfig: Record<StockRisk, { label: string; urgency: StockInsight["urgency"]; recommendation: string }> = {
    none:         { label: "OK",           urgency: "none",     recommendation: "Stock level is healthy." },
    low_stock:    { label: "Low Stock",    urgency: "medium",   recommendation: "Stock is approaching reorder level. Consider placing a purchase order." },
    critical:     { label: "Critical",     urgency: "high",     recommendation: "Stock is critically low. Place a purchase order immediately." },
    stockout:     { label: "Out of Stock", urgency: "critical", recommendation: "Product is out of stock. Urgent reorder required." },
    overstock:    { label: "Overstock",    urgency: "low",      recommendation: "Stock exceeds maximum level. Consider promotions or pausing orders." },
    slow_moving:  { label: "Slow Moving",  urgency: "low",      recommendation: "Product has low sales velocity. Review pricing or consider clearance." },
  };

  const cfg = riskConfig[risk];

  return {
    productId: product.id,
    productName: product.name,
    sku: product.sku,
    currentStock: product.currentStock,
    reorderLevel: product.reorderLevel,
    targetStock: product.targetStock,
    minStock: product.minStock,
    maxStock: product.maxStock,
    risk,
    riskLabel: cfg.label,
    recommendation: cfg.recommendation,
    recommendedOrderQty: recommendedOrderQty > 0 ? recommendedOrderQty : undefined,
    stockValue,
    urgency: cfg.urgency,
  };
}

export function generateStockIntelligenceReport(
  products: ProductWithStock[],
  businessId: string,
  branchId: string
): StockIntelligenceReport {
  const insights = products.map(p => generateStockInsight(p, p.costPrice));
  const totalValue = insights.reduce((s, i) => s + i.stockValue, 0);

  const summary = {
    ok:          insights.filter(i => i.risk === "none").length,
    lowStock:    insights.filter(i => i.risk === "low_stock").length,
    critical:    insights.filter(i => i.risk === "critical").length,
    outOfStock:  insights.filter(i => i.risk === "stockout").length,
    overstock:   insights.filter(i => i.risk === "overstock").length,
  };

  const alerts: StockAlert[] = insights
    .filter(i => i.urgency !== "none")
    .map(i => ({
      id: "alert-" + i.productId,
      type: i.risk,
      severity: i.urgency === "critical" ? "critical" : i.urgency === "high" ? "critical" : "warning",
      productId: i.productId,
      productName: i.productName,
      message: i.productName + ": " + i.riskLabel + " (" + i.currentStock + " units remaining)",
      action: i.recommendation,
      createdAt: new Date().toISOString(),
    }));

  return {
    generatedAt: new Date().toISOString(),
    businessId,
    branchId,
    totalProducts: products.length,
    totalValue,
    insights,
    summary,
    alerts,
  };
}
