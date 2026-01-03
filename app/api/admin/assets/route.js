import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { ensureAssetsBucket, CMS_ASSETS_BUCKET, publicUrlFor } from "@/lib/admin/storage";
import { logAudit } from "@/lib/admin/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safePath(name) {
  const base = (name || "file").toLowerCase().replace(/[^a-z0-9.\-_]+/g, "-");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `${stamp}-${base}`;
}

export async function GET() {
  const auth = await requireAdminSession();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("cms_assets")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) return NextResponse.json({ error: error.message || "Query failed" }, { status: 500 });
  return NextResponse.json({ assets: data || [] });
}

export async function POST(req) {
  const auth = await requireAdminSession();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const session = auth.session;

  await ensureAssetsBucket();
  const form = await req.formData();
  const file = form.get("file");
  const alt_text = form.get("alt_text") || null;
  const tagsRaw = form.get("tags") || "";
  const tags = String(tagsRaw).split(",").map((s) => s.trim()).filter(Boolean);

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const path = safePath(file.name);
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  const up = await admin.storage.from(CMS_ASSETS_BUCKET).upload(path, bytes, {
    contentType: file.type || "application/octet-stream",
    upsert: true,
  });

  if (up.error) {
    return NextResponse.json({ error: up.error.message || "Upload failed" }, { status: 500 });
  }

  const public_url = publicUrlFor(CMS_ASSETS_BUCKET, path);
  const { data: asset, error } = await admin
    .from("cms_assets")
    .upsert(
      {
        bucket: CMS_ASSETS_BUCKET,
        path,
        public_url,
        mime_type: file.type || null,
        size_bytes: bytes.length,
        alt_text,
        tags: tags.length ? tags : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "bucket,path" }
    )
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message || "Failed to save metadata" }, { status: 500 });

  await logAudit({ actor: session.user?.username, action: "upload", entity: "cms_assets", entityId: asset?.id, meta: { path } });
  return NextResponse.json({ asset });
}

export async function DELETE(req) {
  const auth = await requireAdminSession({ minRole: "root" });
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const session = auth.session;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const admin = getSupabaseAdmin();
  const { data: asset, error: getErr } = await admin.from("cms_assets").select("*").eq("id", id).maybeSingle();
  if (getErr || !asset) return NextResponse.json({ error: "Asset not found" }, { status: 404 });

  // Delete storage object (best-effort)
  try {
    await admin.storage.from(asset.bucket).remove([asset.path]);
  } catch {}

  const { error } = await admin.from("cms_assets").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message || "Delete failed" }, { status: 500 });

  await logAudit({ actor: session.user?.username, action: "delete", entity: "cms_assets", entityId: id, meta: { path: asset.path } });
  return NextResponse.json({ ok: true });
}
