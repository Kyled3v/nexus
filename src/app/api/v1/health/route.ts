import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "nexus-api",
    version: process.env.NEXT_PUBLIC_APP_VERSION ?? "0.1.0",
    environment: process.env.NEXT_PUBLIC_APP_ENV ?? "development",
    timestamp: new Date().toISOString(),
  });
}
