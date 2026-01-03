import { getSupabaseAdmin } from "../../../../lib/supabaseAdmin";
import { forgeTxt2Img, checkForgeConnection } from "../../../../lib/forgeImageProvider";

export const runtime = "nodejs";

/**
 * Admin-only endpoint: generate missing image assets using UI Forge (Stable Diffusion).
 *
 * Auth: expects { token, limit, sdUrl } in JSON body.
 */
export async function POST(req) {
  try {
    const { token, limit, sdUrl } = await req.json().catch(() => ({}));
    
    if (!process.env.ADMIN_GENERATE_ASSETS_TOKEN || token !== process.env.ADMIN_GENERATE_ASSETS_TOKEN) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use client-provided URL or env var
    let activeSdUrl = sdUrl || process.env.SD_API_URL;
    if (!activeSdUrl) {
      return Response.json({ error: "Forge API URL is missing. Enter it in the UI or set SD_API_URL env var." }, { status: 400 });
    }

    // 1. Pre-flight check: Is Forge reachable? (And auto-correct localhost vs 127.0.0.1)
    const check = await checkForgeConnection(activeSdUrl);
    if (!check.ok) {
      const msg = check.code === "ECONNREFUSED" 
        ? `Connection Refused at ${activeSdUrl}. Is Forge running?`
        : `Could not connect to Forge (${activeSdUrl}): ${check.error || "Status " + check.status}`;
      
      return Response.json({ 
        error: msg, 
        details: "Ensure Forge is launched with '--api --listen' if running on a different machine/container." 
      }, { status: 503 });
    }

    // Use the verified working URL (in case we swapped localhost <-> 127.0.0.1)
    if (check.url) activeSdUrl = check.url;

    const supabase = getSupabaseAdmin();
    const bucket = process.env.SUPABASE_ASSETS_BUCKET || process.env.NEXT_PUBLIC_SUPABASE_ASSETS_BUCKET || "assets";
    const batchLimit = Math.min(Math.max(Number(limit || 20), 1), 50);

    // Find image assets that do not yet have a resolved URL
    const { data: assets, error } = await supabase
      .from("assets")
      .select("asset_id, asset_type, uri, alt_text, metadata")
      .eq("asset_type", "image")
      .or("metadata->>public_url.is.null,metadata->>publicUrl.is.null")
      .limit(batchLimit);

    if (error) return Response.json({ error: error.message }, { status: 500 });

    if (!assets || assets.length === 0) {
       return Response.json({ ok: true, processed: 0, message: "No pending assets found. Run 'Scan System' or 'Scan Lessons' first." });
    }

    const results = [];
    
    for (const asset of assets) {
      const id = asset.asset_id;
      
      const uri = asset?.uri || "";
      const logical = uri.startsWith("asset://") ? uri.replace("asset://", "") : "";
      const theme = (logical || id || "")
        .replace(/^image\//, "")
        .replaceAll("_", " ")
        .replaceAll("-", " ")
        .trim();

      const prompt = [
        "A cute, bright, kid-friendly educational illustration.",
        `Subject: ${theme || "learning background"}.`,
        "Style: flat vector art, vibrant colors, clean lines, minimalist, joyful.",
        "No text, no letters, no watermarks, no blur.",
        "High quality, 4k."
      ].join(" ");

      try {
        const buffer = await forgeTxt2Img({
          prompt,
          negative_prompt: "text, watermark, logo, blurry, distorted, scary, ugly, photo, realistic",
          width: 1024,
          height: 576,
          sdApiUrl: activeSdUrl,
          steps: 20
        });

        const storagePath = `image/${id}.png`;

        const { error: upErr } = await supabase
          .storage
          .from(bucket)
          .upload(storagePath, buffer, { contentType: "image/png", upsert: true });

        if (upErr) throw upErr;

        const { data: pub } = supabase.storage.from(bucket).getPublicUrl(storagePath);
        const publicUrl = pub?.publicUrl;

        // Update asset record
        const nextMeta = {
          ...(asset.metadata || {}),
          storage_bucket: bucket,
          storage_path: storagePath,
          public_url: publicUrl,
          prompt,
          provider: "forge",
          generated_at: new Date().toISOString(),
          ext: "png"
        };

        await supabase
          .from("assets")
          .update({ metadata: nextMeta })
          .eq("asset_id", id);

        results.push({ asset_id: id, ok: true, public_url: publicUrl });

      } catch (err) {
        console.error(`Failed to generate ${id}:`, err);
        results.push({ asset_id: id, ok: false, error: err.message });
      }
    }

    return Response.json({ ok: true, provider: "forge", processed: results.length, results });
  } catch (e) {
    return Response.json({ error: e?.message || "generate-assets failed" }, { status: 500 });
  }
}