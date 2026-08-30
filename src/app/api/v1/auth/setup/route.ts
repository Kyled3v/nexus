import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  createOrganisation,
  createUserProfile,
  createDefaultModuleEntitlement,
  getUserProfile,
  createBranch,
} from "@/repositories/organisation.repository";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET() {
  // Check if current user has completed setup
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ setupRequired: true, authenticated: false });
    }
    const profile = await getUserProfile(session.user.id);
    return NextResponse.json({
      setupRequired: !profile,
      authenticated:  true,
      userId:         session.user.id,
    });
  } catch {
    return NextResponse.json({ setupRequired: true, authenticated: false });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check if user already has a profile
    const existing = await getUserProfile(session.user.id);
    if (existing) {
      const response = NextResponse.json({ success: true, organisationId: existing.organisationId, alreadySetup: true });
      response.cookies.set("nexus_org_setup", existing.organisationId, {
        httpOnly: true,
        maxAge:   60 * 60 * 24 * 365,
        path:     "/",
      });
      return response;
    }

    const contentType = request.headers.get("content-type") ?? "";
    let businessName = "";
    let tradingName  = "";
    let industry     = "";
    let taxNumber    = "";
    let logoUrl      = "";

    if (contentType.includes("multipart/form-data")) {
      const formData   = await request.formData();
      businessName     = String(formData.get("businessName") ?? "").trim();
      tradingName      = String(formData.get("tradingName")  ?? "").trim();
      industry         = String(formData.get("industry")     ?? "").trim();
      taxNumber        = String(formData.get("taxNumber")    ?? "").trim();

      const logoFile = formData.get("logo") as File | null;
      if (logoFile && logoFile.size > 0) {
        const bytes    = await logoFile.arrayBuffer();
        const buffer   = Buffer.from(bytes);
        const ext      = logoFile.name.split(".").pop() ?? "png";
        const filename = "logo-" + session.user.id + "-" + Date.now() + "." + ext;
        const uploadDir = path.join(process.cwd(), "public", "uploads", "logos");
        await mkdir(uploadDir, { recursive: true });
        await writeFile(path.join(uploadDir, filename), buffer);
        logoUrl = "/uploads/logos/" + filename;
      }
    } else {
      const body   = await request.json() as Record<string, string>;
      businessName = (body.businessName ?? "").trim();
      tradingName  = (body.tradingName  ?? "").trim();
      industry     = (body.industry     ?? "").trim();
      taxNumber    = (body.taxNumber    ?? "").trim();
    }

    if (!businessName) {
      return NextResponse.json({ error: "Business name is required" }, { status: 400 });
    }

    const slug = businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/, "")
      .slice(0, 50) + "-" + Date.now().toString(36);

    const org = await createOrganisation({
      name:        businessName,
      tradingName: tradingName || undefined,
      slug,
      plan:        "starter",
      logoUrl:     logoUrl || undefined,
    });

    await createUserProfile({
      userId:         session.user.id,
      organisationId: org.id,
      role:           "owner",
    });

    await createDefaultModuleEntitlement(org.id);

    await createBranch({
      organisationId: org.id,
      name:           businessName + " - Main Branch",
      code:           "MAIN",
      isHeadOffice:   true,
    });

    const response = NextResponse.json({ success: true, organisationId: org.id });
    response.cookies.set("nexus_org_setup", org.id, {
      httpOnly: true,
      maxAge:   60 * 60 * 24 * 365,
      path:     "/",
    });
    return response;
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json({ error: "Setup failed" }, { status: 500 });
  }
}








