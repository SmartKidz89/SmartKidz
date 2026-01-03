import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdminSession } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  const auth = await requireAdminSession();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { searchParams } = new URL(req.url);
  const scope = searchParams.get("scope");

  const admin = getSupabaseAdmin();
  let q = admin.from("cms_navigation_items").select("*").order("sort", { ascending: true }).limit(500);
  if (scope) q = q.eq("scope", scope);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message || "Query failed" }, { status: 500 });
  return NextResponse.json({ items: data || [] });
}

export async function POST(req) {
  const auth = await requireAdminSession();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const session = auth.session;

  const admin = getSupabaseAdmin();
  const body = await req.json();

  // Reorder support
  if (body?.action === "reorder") {
    const items = Array.isArray(body?.items) ? body.items : [];
    for (const it of items) {
      if (!it?.id) continue;
      await admin.from("cms_navigation_items").update({ sort: Number(it.sort || 0), updated_at: new Date().toISOString() }).eq("id", it.id);
    }
    await logAudit({ actor: session.user?.username, action: "reorder", entity: "cms_navigation_items" });
    return NextResponse.json({ ok: true });
  }

  const payload = {
    id: body?.id || undefined,
    scope: body?.scope || "app",
    label: body?.label,
    href: body?.href,
    icon: body?.icon || null,
    sort: Number.isFinite(Number(body?.sort)) ? Number(body.sort) : 0,
    is_active: body?.is_active !== false,
    min_role: body?.min_role || "admin",
    updated_at: new Date().toISOString(),
  };

  if (!payload.label || !payload.href) {
    return NextResponse.json({ error: "label and href are required" }, { status: 400 });
  }

  const { data, error } = await admin
    .from("cms_navigation_items")
    .upsert(payload, { onConflict: "id" })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message || "Save failed" }, { status: 500 });

  await logAudit({ actor: session.user?.username, action: "upsert", entity: "cms_navigation_items", entityId: data?.id });
  return NextResponse.json({ item: data });
}

export async function DELETE(req) {
  const auth = await requireAdminSession({ minRole: "root" });
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const session = auth.session;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const admin = getSupabaseAdmin();
  const { error } = await admin.from("cms_navigation_items").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message || "Delete failed" }, { status: 500 });

  await logAudit({ actor: session.user?.username, action: "delete", entity: "cms_navigation_items", entityId: id });
  return NextResponse.json({ ok: true });
}
