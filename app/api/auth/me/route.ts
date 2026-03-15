import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/auth/me
 *
 * Demo route — returns a mock authenticated user.
 */
export async function GET() {
  return NextResponse.json({ email: "chris@example.com" });
}
