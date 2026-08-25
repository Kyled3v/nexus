import { NextResponse } from "next/server";
import { DEMO_PRODUCTS } from "@/data/demo-products";

// GET /api/v1/products
// Returns products for the current organisation.
// In production: fetches from Supabase with RLS enforcing organisation isolation.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "all";
  const page = parseInt(searchParams.get("page") ?? "1");
  const pageSize = parseInt(searchParams.get("pageSize") ?? "50");

  let products = DEMO_PRODUCTS;

  if (search) {
    const q = search.toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.barcode ?? "").includes(q)
    );
  }

  if (status !== "all") {
    products = products.filter(p => p.stockStatus === status);
  }

  const total = products.length;
  const paginated = products.slice((page - 1) * pageSize, page * pageSize);

  return NextResponse.json({
    data: paginated,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}
