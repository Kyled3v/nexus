import { db } from "@/lib/db";
import { inventory, products } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function getInventoryLevels(organisationId: string, branchId?: string) {
  const conditions = [eq(inventory.organisationId, organisationId)];
  if (branchId) conditions.push(eq(inventory.branchId, branchId));

  return db
    .select({
      id:            inventory.id,
      productId:     inventory.productId,
      branchId:      inventory.branchId,
      currentStock:  inventory.currentStock,
      reservedStock: inventory.reservedStock,
      productName:   products.name,
      productSku:    products.sku,
      reorderLevel:  products.reorderLevel,
      targetStock:   products.targetStock,
      minStock:      products.minStock,
      maxStock:      products.maxStock,
    })
    .from(inventory)
    .leftJoin(products, eq(inventory.productId, products.id))
    .where(and(...conditions));
}

export async function adjustStock(params: {
  organisationId: string;
  branchId: string;
  productId: string;
  quantity: number;
}) {
  const [existing] = await db
    .select()
    .from(inventory)
    .where(
      and(
        eq(inventory.organisationId, params.organisationId),
        eq(inventory.branchId, params.branchId),
        eq(inventory.productId, params.productId)
      )
    );

  const currentStock = existing?.currentStock ?? 0;
  const newStock = currentStock + params.quantity;

  if (newStock < 0) throw new Error("Insufficient stock");

  if (existing) {
    await db
      .update(inventory)
      .set({ currentStock: newStock, lastMovementAt: new Date() })
      .where(eq(inventory.id, existing.id));
  } else {
    await db.insert(inventory).values({
      organisationId: params.organisationId,
      branchId:       params.branchId,
      productId:      params.productId,
      currentStock:   newStock,
      reservedStock:  0,
    });
  }

  return { quantityBefore: currentStock, quantityAfter: newStock };
}
