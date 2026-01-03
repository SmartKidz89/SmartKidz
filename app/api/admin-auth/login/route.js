import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyPassword } from "@/lib/admin/password";
import { createAdminSession, jsonError } from "@/lib/admin/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const body = await req.json();
    const username = (body?.username || "").trim();
    const password = body?.password || "";
    if (!username || !password) return jsonError("username and password are required", 400);

    const admin = getSupabaseAdmin();
    const { data: user, error } = await admin
      .from("admin_users")
      .select("id, username, password_hash, role, is_active")
      .ilike("username", username)
      .maybeSingle();

    if (error) {
      console.error("Supabase admin_users lookup failed", error);
      return jsonError("Auth service misconfigured", 500);
    }

    if (!user || !user.is_active) {
      return jsonError("Invalid credentials", 401);
    }

    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) return jsonError("Invalid credentials", 401);

    await createAdminSession({ adminUserId: user.id, role: user.role });
    return NextResponse.json({ ok: true, user: { id: user.id, username: user.username, role: user.role } });
  } catch (e) {
    return jsonError(e?.message || "Login failed", 500);
  }
}
