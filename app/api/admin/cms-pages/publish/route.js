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
  const content_json = body.content_json;
  const publish_at = body.publish_at ? new Date(body.publish_at) : null;

  if (!page_id) return NextResponse.json({ error: "page_id is required" }, { status: 400 });
  if (!content_json) return NextResponse.json({ error: "content_json is required" }, { status: 400 });

  const admin = getSupabaseAdmin();

  // Scheduled publish
  if (publish_at && !Number.isNaN(publish_at.getTime()) && publish_at.getTime() > Date.now()) {
    const { error: sErr } = await admin
      .from("cms_page_schedules")
      .upsert(
        { page_id, publish_at: publish_at.toISOString(), content_json },
        { onConflict: "page_id" }
      );
    if (sErr) return NextResponse.json({ error: sErr.message }, { status: 500 });

    return NextResponse.json({ ok: true, scheduled: true, publish_at: publish_at.toISOString() });
  }

  // Publish now: clear schedule, create published version snapshot, update page
  await admin.from("cms_page_schedules").delete().eq("page_id", page_id);

    const created_by = auth.session?.user?.username || auth.session?.user?.id || "admin";

  const { error: vErr } = await admin.from("cms_page_versions").insert({
    page_id,
    status: "published",
    created_by,
    content_json,
  });
  if (vErr) return NextResponse.json({ error: vErr.message }, { status: 500 });

  const { error: pErr } = await admin
    .from("cms_pages")
    .update({ published: true, content_json, updated_at: new Date().toISOString() })
    .eq("id", page_id);

  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, published: true });
}
