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

const DEMO_ORG_CONTEXT: OrgContext = {
  userId:         "dev-user-owner",
  userName:       "Kyle (Owner)",
  userEmail:      "owner@kyledev.co.za",
  userRole:       "owner",
  organisationId: "demo-business-001",
  orgName:        "KyleDev Commerce Demo",
  orgTradingName: "KyleDev Demo Store",
  orgLogoUrl:     null,
  orgPlan:        "enterprise",
  branches: [
    { id: "demo-branch-main", name: "Main Branch", code: "MAIN", isHeadOffice: true },
    { id: "demo-branch-east", name: "East Branch", code: "EAST", isHeadOffice: false },
  ],
  entitlement:    DEV_ENTITLEMENT,
};

export async function getOrgContext(): Promise<OrgContext | null> {
  try {
    const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);
    if (!session?.user) {
      if (process.env.NEXT_PUBLIC_DEV_MODE !== "false" || !process.env.DATABASE_URL) {
        return DEMO_ORG_CONTEXT;
      }
      return null;
    }

    const profile = await getUserProfile(session.user.id).catch(() => null);
    if (!profile) {
      if (process.env.NEXT_PUBLIC_DEV_MODE !== "false" || !process.env.DATABASE_URL) {
        return DEMO_ORG_CONTEXT;
      }
      return null;
    }

    const [org, branches, entitlement] = await Promise.all([
      getOrganisationById(profile.organisationId).catch(() => null),
      getOrganisationBranches(profile.organisationId).catch(() => []),
      getOrganisationEntitlement(profile.organisationId).catch(() => DEV_ENTITLEMENT),
    ]);

    if (!org) {
      if (process.env.NEXT_PUBLIC_DEV_MODE !== "false" || !process.env.DATABASE_URL) {
        return DEMO_ORG_CONTEXT;
      }
      return null;
    }

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
    if (process.env.NEXT_PUBLIC_DEV_MODE !== "false" || !process.env.DATABASE_URL) {
      return DEMO_ORG_CONTEXT;
    }
    return null;
  }
}

