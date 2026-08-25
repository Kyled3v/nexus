import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Service role client — bypasses RLS for server-side admin operations.
// NEVER expose this to the browser. Server-side only.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase admin credentials not configured");
  return createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
