import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdminSession } from "@/lib/admin/auth";
import { runComfyWorkflow, fetchComfyImageBuffer } from "@/lib/comfyui/client";
import { logAudit } from "@/lib/admin/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "cms-assets";

export async function POST(req) {
  const auth = await requireAdminSession();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await req.json().catch(() => ({}));
  const { assetId, comfyUrl, workflow = "basic_text2img", prompt } = body;

  if (!assetId || !comfyUrl) {
    return NextResponse.json({ error: "Missing assetId or comfyUrl" }, { status: 400 });
  }

  const admin = getSupabaseAdmin();

  try {
    // 1. Get Asset to confirm existence & get metadata
    const { data: asset, error: getErr } = await admin
      .from("assets")
      .select("*")
      .eq("asset_id", assetId)
      .single();
    
    if (getErr || !asset) throw new Error("Asset not found");

    // 2. Determine Prompt (override provided > metadata > alt_text)
    const finalPrompt = prompt || asset.metadata?.prompt || asset.alt_text || "A friendly educational illustration";
    const negativePrompt = asset.metadata?.negative_prompt || "text, watermark, ugly, blurry";

    // 3. Run ComfyUI
    const { image } = await runComfyWorkflow({
      workflowName: workflow,
      comfyUrl,
      vars: {
        prompt: finalPrompt,
        negative_prompt: negativePrompt,
        width: 1024,
        height: 576,
        steps: 20,
        cfg_scale: 7
      }
    });

    if (!image) throw new Error("No image returned from ComfyUI");

    // 4. Download Image
    const buffer = await fetchComfyImageBuffer({
      filename: image.filename,
      subfolder: image.subfolder,
      type: image.type,
      comfyUrl
    });

    // 5. Upload to Supabase Storage
    const ext = "png";
    const storagePath = `generated/${assetId}_${Date.now()}.${ext}`;
    
    const { error: upErr } = await admin.storage
      .from(BUCKET)
      .upload(storagePath, buffer, {
        contentType: "image/png",
        upsert: true
      });
    
    if (upErr) throw upErr;

    const { data: pubData } = admin.storage.from(BUCKET).getPublicUrl(storagePath);
    const publicUrl = pubData.publicUrl;

    // 6. Update Asset Record
    const nextMeta = {
      ...asset.metadata,
      public_url: publicUrl,
      storage_path: storagePath,
      provider: "comfyui",
      generated_at: new Date().toISOString()
    };

    await admin.from("assets").update({ 
      uri: publicUrl, // Update main URI too for convenience
      metadata: nextMeta 
    }).eq("asset_id", assetId);

    await logAudit({ 
      actor: auth.session.user.username, 
      action: "generate_asset", 
      entity: "assets", 
      entityId: assetId,
      meta: { workflow, comfyUrl } 
    });

    return NextResponse.json({ ok: true, publicUrl });

  } catch (e) {
    console.error("Generate failed:", e);
    return NextResponse.json({ error: e.message || "Generation failed" }, { status: 500 });
  }
}