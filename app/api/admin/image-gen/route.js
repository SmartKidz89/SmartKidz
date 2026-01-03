import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { runComfyWorkflow, fetchComfyImageBuffer } from "@/lib/comfyui/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  const auth = await requireAdminSession();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { prompt, comfyUrl, workflow = "basic_text2img" } = await req.json().catch(() => ({}));

  if (!prompt || !comfyUrl) {
    return NextResponse.json({ error: "Missing prompt or comfyUrl" }, { status: 400 });
  }

  try {
    // 1. Run ComfyUI
    const { image } = await runComfyWorkflow({
      workflowName: workflow,
      comfyUrl,
      vars: {
        prompt,
        negative_prompt: "text, watermark, ugly, blurry, distorted, nsfw",
        width: 1024,
        height: 576,
        steps: 20,
        cfg_scale: 7
      }
    });

    if (!image) throw new Error("No image returned from ComfyUI");

    // 2. Download Image Buffer
    const buffer = await fetchComfyImageBuffer({
      filename: image.filename,
      subfolder: image.subfolder,
      type: image.type,
      comfyUrl
    });

    // 3. Convert to Base64
    const b64 = buffer.toString("base64");
    const mime = "image/png"; // Comfy usually returns PNG

    return NextResponse.json({ 
      ok: true, 
      image: `data:${mime};base64,${b64}`,
      base64: b64, // Raw b64 for commit
      filename: image.filename
    });

  } catch (e) {
    return NextResponse.json({ error: e.message || "Generation failed" }, { status: 500 });
  }
}