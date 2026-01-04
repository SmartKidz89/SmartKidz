import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { getOpenAICompatConfig } from "@/lib/ai/openaiCompat";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdminSession();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  // 1. Check Supabase
  const supabase = {
     url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Configured" : null,
     hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
     hasDbUrl: !!(process.env.SUPABASE_DB_URL || process.env.DATABASE_URL),
     ok: !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY
  };

  // 2. Check Vercel
  const vercel = {
     env: process.env.VERCEL_ENV,
     url: process.env.VERCEL_URL,
     region: process.env.VERCEL_REGION,
     commit: process.env.VERCEL_GIT_COMMIT_SHA,
  };

  // 3. Check GitHub
  const github = {
     repo: process.env.GITHUB_SYNC_REPO,
     branch: process.env.GITHUB_SYNC_BRANCH || "main",
     ok: !!process.env.GITHUB_SYNC_TOKEN && !!process.env.GITHUB_SYNC_REPO
  };

  // 4. Check Cloudflare
  const cfToken = process.env.CLOUDFLARE_API_TOKEN;
  const cfAccount = process.env.CLOUDFLARE_ACCOUNT_ID;
  const cloudflare = {
    configured: !!(cfToken && cfAccount),
    tunnels: [],
    status: "missing_config"
  };

  if (cfToken && cfAccount) {
    try {
      const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${cfAccount}/tunnels?is_deleted=false`, {
        headers: {
          "Authorization": `Bearer ${cfToken}`,
          "Content-Type": "application/json"
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
           cloudflare.status = "connected";
           cloudflare.tunnels = (data.result || []).map(t => ({
             id: t.id,
             name: t.name,
             status: t.status, 
           }));
        } else {
           cloudflare.status = "error";
           cloudflare.error = data.errors?.[0]?.message || "API Error";
        }
      } else {
        cloudflare.status = "error";
        cloudflare.error = `HTTP ${res.status}`;
      }
    } catch (e) {
      cloudflare.status = "error";
      cloudflare.error = e.message;
    }
  }

  // 5. Check LLM (Ollama/OpenAI)
  const llmConfig = getOpenAICompatConfig();
  const llm = {
      provider: llmConfig.isOpenAICloud ? "OpenAI Cloud" : "Local/Custom",
      baseUrl: llmConfig.baseUrl,
      model: llmConfig.model,
      status: "unknown",
      latency: 0
  };

  try {
      const start = Date.now();
      // Try to list models (standard OpenAI endpoint supported by Ollama/vLLM)
      const res = await fetch(`${llmConfig.baseUrl}/models`, {
          headers: { Authorization: `Bearer ${llmConfig.apiKey}` },
          signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
          llm.status = "connected";
          llm.latency = Date.now() - start;
      } else {
          // If 404, the base URL might be right but /models isn't supported. 
          // Treat 4xx as 'reachable but errored' which is better than network failure.
          llm.status = res.status < 500 ? "connected_with_error" : "error";
          llm.error = `HTTP ${res.status}`;
      }
  } catch (e) {
      llm.status = "error";
      llm.error = e.message;
  }

  // 6. Check ComfyUI / Forge (Default: 8000)
  // We treat it as configured if we have an Env Var OR if we can reach the default local instance.
  const comfyUrl = process.env.COMFYUI_BASE_URL || process.env.SD_API_URL || "http://127.0.0.1:8000";
  const comfy = {
      configured: true, 
      url: comfyUrl,
      status: "missing_config",
      backend: "unknown"
  };

  if (comfyUrl) {
      try {
          const clean = comfyUrl.replace(/\/$/, "");
          // Try SDAPI (Forge/A1111)
          const sdRes = await fetch(`${clean}/sdapi/v1/options`, { signal: AbortSignal.timeout(3000) });
          if (sdRes.ok) {
              comfy.status = "connected";
              comfy.backend = "Forge/A1111";
          } else {
              // Try Comfy specific endpoint
              const comfyRes = await fetch(`${clean}/system_stats`, { signal: AbortSignal.timeout(3000) });
              if (comfyRes.ok) {
                  comfy.status = "connected";
                  comfy.backend = "ComfyUI";
              } else {
                   comfy.status = "error";
                   comfy.error = "Unreachable";
              }
          }
      } catch (e) {
          comfy.status = "error";
          comfy.error = e.message;
      }
  }

  return NextResponse.json({ supabase, vercel, github, cloudflare, llm, comfy });
}