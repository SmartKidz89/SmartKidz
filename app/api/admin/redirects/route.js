import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdminSession } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdminSession();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const admin = getSupabaseAdmin();
  const { data, error } = await admin.from("cms_redirects").select("*").order("updated_at", { ascending: false }).limit(500);
  if (error) return NextResponse.json({ error: error.message || "Query failed" }, { status: 500 });
  return NextResponse.json({ redirects: data || [] });
}

export async function POST(req) {
  const auth = await requireAdminSession();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const session = auth.session;

  const body = await req.json();
  const payload = {
    id: body?.id || undefined,
    from_path: body?.from_path,
    to_path: body?.to_path,
    status: Number(body?.status || 301),
    is_active: body?.is_active !== false,
    updated_at: new Date().toISOString(),
  };
  if (!payload.from_path || !payload.to_path) return NextResponse.json({ error: "from_path and to_path required" }, { status: 400 });

  const admin = getSupabaseAdmin();
  const { data, error } = await admin.from("cms_redirects").upsert(payload, { onConflict: "id" }).select("*").single();
  if (error) return NextResponse.json({ error: error.message || "Save failed" }, { status: 500 });

  await logAudit({ actor: session.user?.username, action: "upsert", entity: "cms_redirects", entityId: data?.id });
  return NextResponse.json({ redirect: data });
}

export async function DELETE(req) {
  const auth = await requireAdminSession({ minRole: "root" });
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const session = auth.session;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const admin = getSupabaseAdmin();
  const { error } = await admin.from("cms_redirects").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message || "Delete failed" }, { status: 500 });

  await logAudit({ actor: session.user?.username, action: "delete", entity: "cms_redirects", entityId: id });
  return NextResponse.json({ ok: true });
}
