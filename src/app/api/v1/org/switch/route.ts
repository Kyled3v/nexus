import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { setActiveOrganisation, getUserOrganisations } from "@/repositories/multi-org.repository";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const formData       = await request.formData();
    const organisationId = String(formData.get("organisationId") ?? "");

    if (!organisationId) {
      return NextResponse.json({ error: "Organisation ID required" }, { status: 400 });
    }

    // Verify user belongs to this org
    const orgs = await getUserOrganisations(session.user.id);
    const belongs = orgs.some(o => o.organisationId === organisationId);
    if (!belongs) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await setActiveOrganisation(session.user.id, organisationId);

    // Redirect back to dashboard
    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("Org switch error:", error);
    return NextResponse.json({ error: "Switch failed" }, { status: 500 });
  }
}

