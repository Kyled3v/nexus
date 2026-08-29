import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getUserProfile, getOrganisationById, getOrganisationBranches, getOrganisationEntitlement } from "@/repositories/organisation.repository";
import { DEV_ENTITLEMENT } from "@/config/modules";
import type { ModuleEntitlement } from "@/config/modules";

export interface OrgContext {
  userId:         string;
  userName:       string;
  userEmail:      string;
  userRole:       string;
  organisationId: string;
  orgName:        string;
  orgTradingName: string | null;
  orgLogoUrl:     string | null;
  orgPlan:        string;
  branches:       { id: string; name: string; code: string; isHeadOffice: boolean }[];
  entitlement:    ModuleEntitlement;
}

export async function getOrgContext(): Promise<OrgContext | null> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return null;

    const profile = await getUserProfile(session.user.id);
    if (!profile) return null;

    const [org, branches, entitlement] = await Promise.all([
      getOrganisationById(profile.organisationId),
      getOrganisationBranches(profile.organisationId),
      getOrganisationEntitlement(profile.organisationId),
    ]);

    if (!org) return null;

    return {
      userId:         session.user.id,
      userName:       session.user.name,
      userEmail:      session.user.email,
      userRole:       profile.role,
      organisationId: org.id,
      orgName:        org.name,
      orgTradingName: org.tradingName ?? null,
      orgLogoUrl:     org.logoUrl ?? null,
      orgPlan:        org.plan,
      branches:       branches.map(b => ({
        id:          b.id,
        name:        b.name,
        code:        b.code,
        isHeadOffice:b.isHeadOffice,
      })),
      entitlement,
    };
  } catch (error) {
    console.error("[OrgContext] Error:", error);
    return null;
  }
}
