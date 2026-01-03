import { NextResponse } from "next/server";
import { clearAdminSessionCookie, jsonError } from "@/lib/admin/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await clearAdminSessionCookie();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return jsonError(e?.message || "Logout failed", 500);
  }
}
