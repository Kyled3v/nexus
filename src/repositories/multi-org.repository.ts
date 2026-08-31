import { db } from "@/lib/db";
import { userOrganisationMemberships, userActiveOrganisation } from "@/lib/db/schema-multi-org";
import { organisations } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function getUserOrganisations(userId: string) {
  try {
    const memberships = await db
      .select({
        organisationId: userOrganisationMemberships.organisationId,
        role:           userOrganisationMemberships.role,
        isDefault:      userOrganisationMemberships.isDefault,
        orgName:        organisations.name,
        orgTradingName: organisations.tradingName,
        orgLogoUrl:     organisations.logoUrl,
        orgPlan:        organisations.plan,
      })
      .from(userOrganisationMemberships)
      .leftJoin(organisations, eq(userOrganisationMemberships.organisationId, organisations.id))
      .where(
        and(
          eq(userOrganisationMemberships.userId, userId),
          eq(userOrganisationMemberships.status, "active")
        )
      );
    if (memberships.length > 0) return memberships;
  } catch {}

  return [
    {
      organisationId: "demo-business-001",
      role:           "owner",
      isDefault:      true,
      orgName:        "KyleDev Commerce Demo",
      orgTradingName: "KyleDev Demo Store",
      orgLogoUrl:     null,
      orgPlan:        "enterprise",
    },
  ];
}

export async function getActiveOrganisation(userId: string) {
  try {
    const [active] = await db
      .select()
      .from(userActiveOrganisation)
      .where(eq(userActiveOrganisation.userId, userId));
    return active ?? null;
  } catch {
    return { userId, organisationId: "demo-business-001", updatedAt: new Date() };
  }
}

export async function setActiveOrganisation(userId: string, organisationId: string) {
  try {
    await db
      .insert(userActiveOrganisation)
      .values({ userId, organisationId })
      .onConflictDoUpdate({
        target: userActiveOrganisation.userId,
        set:    { organisationId, updatedAt: new Date() },
      });
  } catch (err) {
    console.warn("[MultiOrg] Could not persist active organisation:", err);
  }
}

export async function addUserToOrganisation(params: {
  userId:         string;
  organisationId: string;
  role:           string;
  isDefault?:     boolean;
  invitedBy?:     string;
}) {
  try {
    const [membership] = await db
      .insert(userOrganisationMemberships)
      .values({
        userId:         params.userId,
        organisationId: params.organisationId,
        role:           params.role,
        isDefault:      params.isDefault ?? false,
        invitedBy:      params.invitedBy,
      })
      .onConflictDoNothing()
      .returning();
    return membership;
  } catch {
    return null;
  }
}
