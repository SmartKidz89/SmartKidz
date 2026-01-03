import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdminSession } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  const auth = await requireAdminSession({ minRole: "root" });
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { searchParams } = new URL(req.url);
  const page = Math.max(Number(searchParams.get("page") || 1), 1);
  const perPage = Math.min(Math.max(Number(searchParams.get("perPage") || 25), 1), 100);

  const admin = getSupabaseAdmin();
  const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
  if (error) return NextResponse.json({ error: error.message || "Failed to list users" }, { status: 500 });

  return NextResponse.json({ users: data?.users || [], page, perPage, total: data?.total || null });
}

export async function POST(req) {
  const auth = await requireAdminSession({ minRole: "root" });
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const actor = auth.session?.user?.username;

  const body = await req.json();
  const user_id = body?.user_id;
  const role = body?.role || "user";
  if (!user_id) return NextResponse.json({ error: "user_id is required" }, { status: 400 });

  const admin = getSupabaseAdmin();
  // assumes profiles table has user_id primary key
  const { data, error } = await admin.from("profiles").upsert({ user_id, role }, { onConflict: "user_id" }).select("*").single();
  if (error) return NextResponse.json({ error: error.message || "Failed to update profile role" }, { status: 500 });

  await logAudit({ actor, action: "set_role", entity: "profiles", entityId: user_id, meta: { role } });
  return NextResponse.json({ profile: data });
}
