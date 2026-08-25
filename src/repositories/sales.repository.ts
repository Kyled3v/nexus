import { createClient } from "@/lib/supabase/server";

export async function getSales(filters?: {
  branchId?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}) {
  const supabase = await createClient();
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 50;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("sales")
    .select("*, customers(name), sale_items(*)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (filters?.branchId) query = query.eq("branch_id", filters.branchId);
  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.from) query = query.gte("completed_at", filters.from);
  if (filters?.to) query = query.lte("completed_at", filters.to);

  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data: data ?? [],
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  };
}

export async function getDailySummary(branchId?: string) {
  const supabase = await createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let query = supabase
    .from("sales")
    .select("total, tax_amount, discount_amount, status")
    .eq("status", "completed")
    .gte("completed_at", today.toISOString());

  if (branchId) query = query.eq("branch_id", branchId);

  const { data, error } = await query;
  if (error) throw error;

  const sales = data ?? [];
  return {
    revenue: sales.reduce((s, r) => s + Number(r.total), 0),
    transactions: sales.length,
    tax: sales.reduce((s, r) => s + Number(r.tax_amount), 0),
    discounts: sales.reduce((s, r) => s + Number(r.discount_amount), 0),
    date: today.toISOString(),
  };
}
