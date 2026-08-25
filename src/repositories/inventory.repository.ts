import { createClient } from "@/lib/supabase/server";

const INVENTORY_SELECT = "*, products(id, sku, name, reorder_level, target_stock, min_stock, max_stock, cost_price, selling_price, status), branches(name)";

export async function getInventoryLevels(branchId?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("inventory")
    .select(INVENTORY_SELECT)
    .order("last_movement_at", { ascending: false });

  if (branchId) query = query.eq("branch_id", branchId);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function adjustStock(params: {
  organisationId: string;
  branchId: string;
  productId: string;
  quantity: number;
  type: string;
  notes?: string;
  createdBy: string;
}) {
  const supabase = await createClient();

  const { data: current, error: fetchError } = await supabase
    .from("inventory")
    .select("current_stock, reserved_stock")
    .eq("organisation_id", params.organisationId)
    .eq("branch_id", params.branchId)
    .eq("product_id", params.productId)
    .single();

  if (fetchError) throw fetchError;

  const quantityBefore = current?.current_stock ?? 0;
  const quantityAfter = quantityBefore + params.quantity;

  if (quantityAfter < 0) throw new Error("Insufficient stock");

  const { error: updateError } = await supabase
    .from("inventory")
    .upsert({
      organisation_id: params.organisationId,
      branch_id: params.branchId,
      product_id: params.productId,
      current_stock: quantityAfter,
      reserved_stock: current?.reserved_stock ?? 0,
      last_movement_at: new Date().toISOString(),
    });

  if (updateError) throw updateError;

  const { error: movementError } = await supabase
    .from("inventory_movements")
    .insert({
      organisation_id: params.organisationId,
      branch_id: params.branchId,
      product_id: params.productId,
      type: params.type,
      quantity: params.quantity,
      quantity_before: quantityBefore,
      quantity_after: quantityAfter,
      notes: params.notes,
      created_by: params.createdBy,
    });

  if (movementError) throw movementError;

  return { quantityBefore, quantityAfter };
}
