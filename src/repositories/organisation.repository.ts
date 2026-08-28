import { db } from "@/lib/db";
import { organisations, branches, moduleEntitlements, userProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { ModuleEntitlement, ModuleId } from "@/config/modules";
import { DEV_ENTITLEMENT } from "@/config/modules";

export async function getOrganisationById(id: string) {
  const [org] = await db
    .select()
    .from(organisations)
    .where(eq(organisations.id, id));
  return org ?? null;
}

export async function getOrganisationBranches(organisationId: string) {
  return db
    .select()
    .from(branches)
    .where(eq(branches.organisationId, organisationId));
}

export async function getOrganisationEntitlement(organisationId: string): Promise<ModuleEntitlement> {
  const [row] = await db
    .select()
    .from(moduleEntitlements)
    .where(eq(moduleEntitlements.organisationId, organisationId));

  if (!row) return DEV_ENTITLEMENT;

  const [org] = await db
    .select({ plan: organisations.plan })
    .from(organisations)
    .where(eq(organisations.id, organisationId));

  return {
    organisationId,
    plan: (org?.plan ?? "starter") as ModuleEntitlement["plan"],
    enabledModules: (row.enabledModules ?? []) as ModuleId[],
  };
}

export async function getUserProfile(userId: string) {
  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId));
  return profile ?? null;
}

export async function createOrganisation(data: {
  name: string;
  tradingName?: string;
  slug: string;
  plan?: string;
  logoUrl?: string;
}) {
  const [org] = await db
    .insert(organisations)
    .values(data)
    .returning();
  return org;
}

export async function createUserProfile(data: {
  userId: string;
  organisationId: string;
  role: string;
}) {
  const [profile] = await db
    .insert(userProfiles)
    .values(data)
    .returning();
  return profile;
}

export async function createDefaultModuleEntitlement(organisationId: string) {
  const defaultModules = ["inventory", "crm", "reports"];
  const [entitlement] = await db
    .insert(moduleEntitlements)
    .values({
      organisationId,
      enabledModules: defaultModules,
    })
    .returning();
  return entitlement;
}
