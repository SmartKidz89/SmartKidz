import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdminSession } from "@/lib/admin/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  const auth = await requireAdminSession();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const admin = getSupabaseAdmin();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const slug = searchParams.get("slug");

  let q = admin.from("cms_pages").select("*").order("updated_at", { ascending: false }).limit(200);
  if (id) q = q.eq("id", id);
  if (slug) q = q.eq("slug", slug);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message || "Query failed" }, { status: 500 });
  return NextResponse.json({ pages: data || [] });
}

export async function POST(req) {
  const auth = await requireAdminSession();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const admin = getSupabaseAdmin();
  const body = await req.json();

  const payload = {
    id: body?.id || undefined,
    slug: body?.slug,
    title: body?.title || null,
    scope: body?.scope || "marketing",
    content_json: body?.content_json || { version: 1, blocks: [] },
    published: !!body?.published,
    updated_at: new Date().toISOString(),
  };

  if (!payload.slug) return NextResponse.json({ error: "slug is required" }, { status: 400 });

  // Upsert by id if present; else upsert by slug
  let resp;
  if (payload.id) {
    resp = await admin.from("cms_pages").upsert(payload, { onConflict: "id" }).select("*").single();
  } else {
    resp = await admin.from("cms_pages").upsert(payload, { onConflict: "slug" }).select("*").single();
  }

  if (resp.error) return NextResponse.json({ error: resp.error.message || "Save failed" }, { status: 500 });

  // Version snapshot (draft or published)
  try {
    const created_by = auth.session?.user?.username || auth.session?.user?.id || "admin";
    await admin.from("cms_page_versions").insert({
      page_id: resp.data.id,
      status: payload.published ? "published" : "draft",
      created_by,
      content_json: payload.content_json,
    });

    if (payload.published) {
      // Publishing via checkbox should cancel any schedule.
      await admin.from("cms_page_schedules").delete().eq("page_id", resp.data.id);
    }
  } catch (e) {
    // If versioning tables are not installed yet, do not block basic save.
  }

  return NextResponse.json({ page: resp.data });
}

export async function DELETE(req) {
  const auth = await requireAdminSession();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const admin = getSupabaseAdmin();
  const { error } = await admin.from("cms_pages").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message || "Delete failed" }, { status: 500 });

  return NextResponse.json({ ok: true });
}
