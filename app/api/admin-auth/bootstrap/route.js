import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { hashPassword } from "@/lib/admin/password";
import { jsonError } from "@/lib/admin/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  const token = req.headers.get("x-bootstrap-token") || "";
  const expected = process.env.ADMIN_BOOTSTRAP_TOKEN || "";
  if (!expected || token !== expected) {
    return jsonError("Bootstrap token missing or invalid", 401);
  }

  try {
    const body = await req.json();
    const username = (body?.username || "").trim();
    const password = body?.password || "";
    if (!username || !password) return jsonError("username and password are required", 400);

    const admin = getSupabaseAdmin();

    // If there is already a root user, prevent accidental overwrite.
    const { data: existing } = await admin
      .from("admin_users")
      .select("id")
      .eq("role", "root")
      .limit(1);

    if (existing && existing.length > 0) {
      return jsonError("Root user already exists", 409);
    }

    const password_hash = await hashPassword(password);
    const { data: created, error } = await admin
      .from("admin_users")
      .insert({ username, password_hash, role: "root", is_active: true })
      .select("id, username, role")
      .single();

    if (error) return jsonError(error.message || "Failed to create root user", 500);
    return NextResponse.json({ ok: true, user: created });
  } catch (e) {
    return jsonError(e?.message || "Bootstrap failed", 500);
  }
}
