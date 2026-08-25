import { createClient } from "@/lib/supabase/server";
import type { ModuleEntitlement, ModuleId } from "@/config/modules";
import { DEV_ENTITLEMENT } from "@/config/modules";

export async function getOrganisation() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("organisation_id, role, permissions, branch_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) return null;

  const { data: org, error: orgError } = await supabase
    .from("organisations")
    .select("*")
    .eq("id", profile.organisation_id)
    .single();

  if (orgError || !org) return null;

  const { data: entitlementRow } = await supabase
    .from("module_entitlements")
    .select("enabled_modules, custom_limits")
    .eq("organisation_id", profile.organisation_id)
    .single();

  const entitlement: ModuleEntitlement = entitlementRow
    ? {
        organisationId: profile.organisation_id,
        plan: org.plan,
        enabledModules: (entitlementRow.enabled_modules as ModuleId[]) ?? [],
      }
    : DEV_ENTITLEMENT;

  const { data: branches } = await supabase
    .from("branches")
    .select("*")
    .eq("organisation_id", profile.organisation_id)
    .eq("status", "active");

  return { organisation: org, profile, entitlement, branches: branches ?? [] };
}
