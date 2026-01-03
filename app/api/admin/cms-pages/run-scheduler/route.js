import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdminSession } from "@/lib/admin/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Publish any scheduled pages whose publish_at <= now.
 * Call this from Vercel Cron (recommended) or manually.
 */
export async function POST() {
  const auth = await requireAdminSession({ minRole: "root" });
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const admin = getSupabaseAdmin();
  const now = new Date().toISOString();

  const { data: due, error } = await admin
    .from("cms_page_schedules")
    .select("page_id,publish_at,content_json")
    .lte("publish_at", now)
    .order("publish_at", { ascending: true })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let published = 0;

  for (const s of due || []) {
    try {
      // snapshot version
      await admin.from("cms_page_versions").insert({
        page_id: s.page_id,
        status: "published",
        created_by: auth.session?.user?.username || "scheduler",
        content_json: s.content_json,
      });

      await admin.from("cms_pages").update({
        published: true,
        content_json: s.content_json,
        updated_at: new Date().toISOString(),
      }).eq("id", s.page_id);

      await admin.from("cms_page_schedules").delete().eq("page_id", s.page_id);

      published += 1;
    } catch {}
  }

  return NextResponse.json({ ok: true, due: (due || []).length, published });
}
