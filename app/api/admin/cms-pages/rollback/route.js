import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdminSession } from "@/lib/admin/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  const auth = await requireAdminSession();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await req.json().catch(() => ({}));
  const page_id = body.page_id;
  const version_id = body.version_id;
  if (!page_id || !version_id) return NextResponse.json({ error: "page_id and version_id are required" }, { status: 400 });

  const admin = getSupabaseAdmin();

  const { data: v, error: vErr } = await admin
    .from("cms_page_versions")
    .select("id,content_json")
    .eq("id", version_id)
    .eq("page_id", page_id)
    .maybeSingle();

  if (vErr || !v) return NextResponse.json({ error: vErr?.message || "Version not found" }, { status: 404 });

  const content_json = v.content_json;

    const created_by = auth.session?.user?.username || auth.session?.user?.id || "admin";
  await admin.from("cms_page_schedules").delete().eq("page_id", page_id);

  const { error: nErr } = await admin.from("cms_page_versions").insert({
    page_id,
    status: "published",
    created_by,
    content_json,
  });
  if (nErr) return NextResponse.json({ error: nErr.message }, { status: 500 });

  const { error: pErr } = await admin
    .from("cms_pages")
    .update({ published: true, content_json, updated_at: new Date().toISOString() })
    .eq("id", page_id);

  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
