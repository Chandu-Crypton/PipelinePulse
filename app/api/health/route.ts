import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Used by Docker HEALTHCHECK and post-deploy smoke tests in CI
export function GET() {
  return NextResponse.json({ status: "ok", uptime: process.uptime(), version: process.env.APP_VERSION ?? "dev" });
}
