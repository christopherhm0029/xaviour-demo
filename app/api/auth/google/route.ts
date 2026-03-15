import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/auth/google
 *
 * Demo route — simulates OAuth redirect (no real Google auth).
 */
export async function GET() {
  // In demo mode, just redirect back to the app
  return NextResponse.redirect(new URL("/", "http://localhost:3000"));
}
