import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { logAudit } from "@/lib/admin/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Unify on the main assets bucket used by generators
const BUCKET = process.env.SUPABASE_ASSETS_BUCKET || "assets";

function safeId(name) {
  const base = (name || "file").toLowerCase().replace(/[^a-z0-9.\-_]+/g, "-");
  const stamp = Date.now().toString(36);
  return `upload-${stamp}-${base}`;
}

export async function GET() {
  const auth = await requireAdminSession();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const admin = getSupabaseAdmin();
  
  // Query the main 'assets' table used by the whole app
  const { data, error } = await admin
    .from("assets")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) return NextResponse.json({ error: error.message || "Query failed" }, { status: 500 });

  // Map to the shape expected by the Media UI
  const assets = (data || []).map(a => ({
    id: a.asset_id,
    path: a.asset_id, // Display name
    public_url: a.metadata?.public_url || a.uri,
    mime_type: a.metadata?.mimetype || (a.asset_type === 'image' ? 'image/png' : 'application/octet-stream'),
    size_bytes: a.metadata?.size || 0,
    alt_text: a.alt_text,
    tags: a.asset_type ? [a.asset_type] : [],
    metadata: a.metadata,
    created_at: a.created_at
  }));

  return NextResponse.json({ assets });
}

export async function POST(req) {
  const auth = await requireAdminSession();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const session = auth.session;

  const form = await req.formData();
  const file = form.get("file");
  const alt_text = form.get("alt_text") || null;
  // tags not currently stored in 'assets' main schema in a dedicated column, can go in metadata if needed

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  
  // Ensure bucket exists
  try {
     await admin.storage.createBucket(BUCKET, { public: true });
  } catch {}

  const assetId = safeId(file.name);
  const ext = file.name.split('.').pop();
  const storagePath = `uploads/${assetId}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  const up = await admin.storage.from(BUCKET).upload(storagePath, bytes, {
    contentType: file.type || "application/octet-stream",
    upsert: true,
  });

  if (up.error) {
    return NextResponse.json({ error: up.error.message || "Upload failed" }, { status: 500 });
  }

  const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(storagePath);
  const public_url = pub?.publicUrl;

  const { data: asset, error } = await admin
    .from("assets")
    .upsert(
      {
        asset_id: assetId,
        asset_type: file.type?.startsWith('image/') ? 'image' : 'file',
        uri: public_url,
        alt_text,
        metadata: {
          public_url,
          storage_bucket: BUCKET,
          storage_path: storagePath,
          mimetype: file.type,
          size: bytes.length,
          uploaded_by: session.user?.username
        },
        created_at: new Date().toISOString()
      },
      { onConflict: "asset_id" }
    )
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message || "Failed to save metadata" }, { status: 500 });

  await logAudit({ actor: session.user?.username, action: "upload", entity: "assets", entityId: asset?.asset_id, meta: { public_url } });
  
  // Return mapped shape for UI
  return NextResponse.json({ 
    asset: {
        id: asset.asset_id,
        public_url,
        path: asset.asset_id,
        alt_text: asset.alt_text,
        mime_type: file.type
    } 
  });
}

export async function DELETE(req) {
  const auth = await requireAdminSession({ minRole: "root" });
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const session = auth.session;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const admin = getSupabaseAdmin();
  
  // Get asset to find storage path
  const { data: asset } = await admin.from("assets").select("metadata").eq("asset_id", id).single();
  
  if (asset?.metadata?.storage_path && asset?.metadata?.storage_bucket) {
      try {
          await admin.storage.from(asset.metadata.storage_bucket).remove([asset.metadata.storage_path]);
      } catch {}
  }

  const { error } = await admin.from("assets").delete().eq("asset_id", id);
  if (error) return NextResponse.json({ error: error.message || "Delete failed" }, { status: 500 });

  await logAudit({ actor: session.user?.username, action: "delete", entity: "assets", entityId: id });
  return NextResponse.json({ ok: true });
}