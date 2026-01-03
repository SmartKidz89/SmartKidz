import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { clearAdminSessionCookie, ADMIN_COOKIE_NAME, jsonError } from "@/lib/admin/auth";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

    if (token) {
      const admin = getSupabaseAdmin();
      await admin.from("admin_sessions").delete().eq("token", token);
    }
    await clearAdminSessionCookie();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return jsonError(e?.message || "Logout failed", 500);
  }
}
