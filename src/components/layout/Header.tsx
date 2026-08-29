import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getUserProfile } from "@/repositories/organisation.repository";
import { getOrganisationById } from "@/repositories/organisation.repository";
import { HeaderClient } from "./HeaderClient";

export async function Header() {
  let userName    = "User";
  let userRole    = "owner";
  let orgName     = "NEXUS";
  let orgLogoUrl  = null as string | null;

  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (session?.user) {
      userName = session.user.name ?? session.user.email ?? "User";
      const profile = await getUserProfile(session.user.id);
      if (profile) {
        userRole = profile.role;
        const org = await getOrganisationById(profile.organisationId);
        if (org) {
          orgName    = org.tradingName ?? org.name;
          orgLogoUrl = org.logoUrl ?? null;
        }
      }
    }
  } catch {
    // fallback to defaults
  }

  return (
    <HeaderClient
      userName={userName}
      userRole={userRole}
      orgName={orgName}
      orgLogoUrl={orgLogoUrl}
    />
  );
}

