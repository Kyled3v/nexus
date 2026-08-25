import { createClient } from "@/lib/supabase/server";
import type { CreateCustomerInput } from "@/lib/validation/schemas";

export async function getCustomers(filters?: {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  const supabase = await createClient();
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 50;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("customers")
    .select("*", { count: "exact" })
    .order("name");

  if (filters?.search) {
    const s = filters.search;
    query = query.or("name.ilike.%" + s + "%,email.ilike.%" + s + "%,phone.ilike.%" + s + "%");
  }

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

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

export async function createCustomer(organisationId: string, input: CreateCustomerInput) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .insert({ organisation_id: organisationId, ...input })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getCustomerById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}
