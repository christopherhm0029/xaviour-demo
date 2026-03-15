import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/signout
 *
 * Demo route — simulates sign-out (no real session to clear).
 */
export async function POST() {
  return NextResponse.json({ ok: true });
}
