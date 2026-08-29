import { db } from "@/lib/db";
import { userOrganisationMemberships, userActiveOrganisation } from "@/lib/db/schema-multi-org";
import { organisations } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function getUserOrganisations(userId: string) {
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
  return memberships;
}

export async function getActiveOrganisation(userId: string) {
  const [active] = await db
    .select()
    .from(userActiveOrganisation)
    .where(eq(userActiveOrganisation.userId, userId));
  return active ?? null;
}

export async function setActiveOrganisation(userId: string, organisationId: string) {
  await db
    .insert(userActiveOrganisation)
    .values({ userId, organisationId })
    .onConflictDoUpdate({
      target: userActiveOrganisation.userId,
      set:    { organisationId, updatedAt: new Date() },
    });
}

export async function addUserToOrganisation(params: {
  userId:         string;
  organisationId: string;
  role:           string;
  isDefault?:     boolean;
  invitedBy?:     string;
}) {
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
}
