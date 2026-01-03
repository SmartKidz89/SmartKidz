import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdminSession } from "@/lib/admin/auth";
import { hashPassword } from "@/lib/admin/password";
import { logAudit } from "@/lib/admin/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdminSession({ minRole: "root" });
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("admin_users")
    .select("id, username, role, is_active, created_at, updated_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message || "Query failed" }, { status: 500 });
  return NextResponse.json({ users: data || [] });
}

export async function POST(req) {
  const auth = await requireAdminSession({ minRole: "root" });
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const actor = auth.session?.user?.username;

  const body = await req.json();
  const id = body?.id || null;
  const username = (body?.username || "").trim();
  const role = body?.role === "root" ? "root" : "admin";
  const is_active = body?.is_active !== false;

  if (!username) return NextResponse.json({ error: "username is required" }, { status: 400 });

  const admin = getSupabaseAdmin();
  const payload = { id: id || undefined, username, role, is_active, updated_at: new Date().toISOString() };

  if (body?.password) {
    payload.password_hash = await hashPassword(body.password);
  }

  const { data, error } = await admin.from("admin_users").upsert(payload, { onConflict: "id" }).select("id, username, role, is_active, created_at, updated_at").single();
  if (error) return NextResponse.json({ error: error.message || "Save failed" }, { status: 500 });

  await logAudit({ actor, action: "upsert", entity: "admin_users", entityId: data.id });
  return NextResponse.json({ user: data });
}

export async function DELETE(req) {
  const auth = await requireAdminSession({ minRole: "root" });
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const actor = auth.session?.user?.username;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const admin = getSupabaseAdmin();
  const { error } = await admin.from("admin_users").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message || "Delete failed" }, { status: 500 });

  await logAudit({ actor, action: "delete", entity: "admin_users", entityId: id });
  return NextResponse.json({ ok: true });
}
