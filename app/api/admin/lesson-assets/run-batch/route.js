import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdminSession } from "@/lib/admin/auth";
import { runComfyWorkflow, fetchComfyImageBuffer } from "@/lib/comfyui/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function extFromFilename(name) {
  const m = String(name || "").match(/\.([a-zA-Z0-9]+)$/);
  return m ? m[1].toLowerCase() : "png";
}

export async function POST(req) {
  const auth = await requireAdminSession();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await req.json().catch(() => ({}));
  const limit = Math.max(1, Math.min(50, Number(body.limit || 25)));

  const admin = getSupabaseAdmin();

  const { data: items, error } = await admin
    .from("lesson_asset_jobs")
    .select("*")
    .eq("status", "queued")
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!items || items.length === 0) return NextResponse.json({ ok: true, processed: 0, ok: 0, failed: 0 });

  const bucket = process.env.LESSON_ASSETS_BUCKET || "cms-assets";

  let okCount = 0;
  let failedCount = 0;

  for (const it of items) {
    try {
      await admin.from("lesson_asset_jobs").update({ status: "running", updated_at: new Date().toISOString() }).eq("id", it.id);

      const vars = {
        prompt: it.prompt || "",
        negative_prompt: it.negative_prompt || "",
        width: it.width || 1024,
        height: it.height || 1024,
        steps: it.steps || 28,
        cfg_scale: it.cfg_scale || 5.5,
        sampler: it.sampler || "",
        scheduler: it.scheduler || "",
      };

      const { image } = await runComfyWorkflow({
        workflowName: it.comfyui_workflow || "basic_text2img",
        vars,
      });

      if (!image?.filename) throw new Error("ComfyUI did not return an image");

      const buf = await fetchComfyImageBuffer({
        filename: image.filename,
        subfolder: image.subfolder || "",
        type: image.type || "output",
      });

      const ext = extFromFilename(image.filename);
      const ts = Date.now();
      const storage_path = `lesson-assets/${it.edition_id}/${it.image_type}/${ts}.${ext}`;

      const { error: upErr } = await admin.storage.from(bucket).upload(storage_path, buf, {
        contentType: ext === "jpg" || ext === "jpeg" ? "image/jpeg" : "image/png",
        upsert: true,
      });
      if (upErr) throw new Error(`Storage upload failed: ${upErr.message}`);

      const { data: pub } = admin.storage.from(bucket).getPublicUrl(storage_path);
      const public_url = pub?.publicUrl || null;

      await admin.from("lesson_asset_jobs").update({
        status: "completed",
        storage_path,
        public_url,
        updated_at: new Date().toISOString(),
      }).eq("id", it.id);

      okCount += 1;
    } catch (e) {
      failedCount += 1;
      try {
        await admin.from("lesson_asset_jobs").update({
          status: "failed",
          error_message: e?.message || "Failed",
          updated_at: new Date().toISOString(),
        }).eq("id", it.id);
      } catch {}
    }
  }

  return NextResponse.json({ ok: true, processed: items.length, ok: okCount, failed: failedCount });
}
