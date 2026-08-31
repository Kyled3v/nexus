import { db } from "@/lib/db";
import { organisations, branches, moduleEntitlements, userProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { ModuleEntitlement, ModuleId } from "@/config/modules";
import { DEV_ENTITLEMENT } from "@/config/modules";

export async function getOrganisationById(id: string) {
  try {
    const [org] = await db
      .select()
      .from(organisations)
      .where(eq(organisations.id, id));
    if (org) return org;
  } catch {}

  return {
    id:          id || "demo-business-001",
    name:        "KyleDev Commerce Demo",
    tradingName: "KyleDev Demo Store",
    slug:        "kyledev-commerce-demo",
    plan:        "enterprise",
    logoUrl:     null,
    createdAt:   new Date(),
    updatedAt:   new Date(),
  };
}

export async function getOrganisationBranches(organisationId: string) {
  try {
    const data = await db
      .select()
      .from(branches)
      .where(eq(branches.organisationId, organisationId));
    if (data.length > 0) return data;
  } catch {}

  return [
    {
      id:             "demo-branch-main",
      organisationId: organisationId || "demo-business-001",
      name:           "Main Branch",
      code:           "MAIN",
      isHeadOffice:   true,
      createdAt:      new Date(),
      updatedAt:      new Date(),
    },
    {
      id:             "demo-branch-east",
      organisationId: organisationId || "demo-business-001",
      name:           "East Branch",
      code:           "EAST",
      isHeadOffice:   false,
      createdAt:      new Date(),
      updatedAt:      new Date(),
    },
  ];
}

export async function getOrganisationEntitlement(organisationId: string): Promise<ModuleEntitlement> {
  try {
    const [row] = await db
      .select()
      .from(moduleEntitlements)
      .where(eq(moduleEntitlements.organisationId, organisationId));

    if (row) {
      const [org] = await db
        .select({ plan: organisations.plan })
        .from(organisations)
        .where(eq(organisations.id, organisationId));

      return {
        organisationId,
        plan: (org?.plan ?? "enterprise") as ModuleEntitlement["plan"],
        enabledModules: (row.enabledModules ?? []) as ModuleId[],
      };
    }
  } catch {}

  return DEV_ENTITLEMENT;
}

export async function getUserProfile(userId: string) {
  try {
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));
    if (profile) return profile;
  } catch {}

  return {
    id:             "demo-profile-001",
    userId,
    organisationId: "demo-business-001",
    role:           "owner",
    createdAt:      new Date(),
    updatedAt:      new Date(),
  };
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

export async function createBranch(data: {
  organisationId: string;
  name:           string;
  code:           string;
  isHeadOffice?:  boolean;
}) {
  const [branch] = await db
    .insert(branches)
    .values({
      organisationId: data.organisationId,
      name:           data.name,
      code:           data.code,
      isHeadOffice:   data.isHeadOffice ?? true,
    })
    .returning();
  return branch;
}
