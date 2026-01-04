import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { getOpenAICompatConfig } from "@/lib/ai/openaiCompat";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  const auth = await requireAdminSession();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode") || "summary"; // 'summary' or 'deep'

  // 1. Check Supabase
  const supabase = {
     url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Configured" : null,
     hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
     hasDbUrl: !!(process.env.SUPABASE_DB_URL || process.env.DATABASE_URL),
     ok: !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY,
     fix: !process.env.SUPABASE_SERVICE_ROLE_KEY ? "Add SUPABASE_SERVICE_ROLE_KEY to env vars." : null
  };

  // 2. Check Vercel
  const isVercel = !!process.env.VERCEL;
  const vercel = {
     env: process.env.VERCEL_ENV,
     url: process.env.VERCEL_URL,
     region: process.env.VERCEL_REGION,
     isVercel,
     status: isVercel ? "connected" : "local_or_other"
  };

  // 3. Check GitHub
  const github = {
     repo: process.env.GITHUB_SYNC_REPO,
     branch: process.env.GITHUB_SYNC_BRANCH || "main",
     ok: !!process.env.GITHUB_SYNC_TOKEN && !!process.env.GITHUB_SYNC_REPO,
     fix: !process.env.GITHUB_SYNC_TOKEN ? "Add GITHUB_SYNC_TOKEN (classic PAT)." : null
  };

  // 4. Check Cloudflare
  const cfToken = process.env.CLOUDFLARE_API_TOKEN;
  const cfAccount = process.env.CLOUDFLARE_ACCOUNT_ID;
  const cloudflare = {
    configured: !!(cfToken && cfAccount),
    tunnels: [],
    status: "missing_config",
    fix: null
  };

  if (cfToken && cfAccount) {
    try {
      const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${cfAccount}/tunnels?is_deleted=false`, {
        headers: {
          "Authorization": `Bearer ${cfToken}`,
          "Content-Type": "application/json"
        }
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
           cloudflare.status = "connected";
           cloudflare.tunnels = (data.result || []).map(t => ({
             id: t.id,
             name: t.name,
             status: t.status, 
           }));
      } else {
           cloudflare.status = "error";
           const code = data.errors?.[0]?.code || 0;
           cloudflare.error = data.errors?.[0]?.message || "API Error";
           
           if (code === 10000 || res.status === 400 || res.status === 403) {
             cloudflare.fix = "API Token is invalid or missing permissions. Ensure 'Account:Cloudflare Tunnel:Read' permission.";
           }
      }
    } catch (e) {
      cloudflare.status = "error";
      cloudflare.error = e.message;
      cloudflare.fix = "Check network connection to Cloudflare API.";
    }
  } else {
    cloudflare.fix = "Add CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID to env vars.";
  }

  // 5. Check LLM
  const llmConfig = getOpenAICompatConfig();
  const hasCfAccess = !!(llmConfig.cfClientId && llmConfig.cfClientSecret);
  
  const llm = {
      provider: llmConfig.isOpenAICloud ? "OpenAI Cloud" : "Local/Custom",
      baseUrl: llmConfig.baseUrl,
      model: llmConfig.model,
      cfAccess: hasCfAccess,
      status: "unknown",
      fix: null
  };

  if (mode === "deep") {
      try {
          const start = Date.now();
          const headers = { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${llmConfig.apiKey}` 
          };
          if (hasCfAccess) {
            headers["CF-Access-Client-Id"] = llmConfig.cfClientId;
            headers["CF-Access-Client-Secret"] = llmConfig.cfClientSecret;
          }

          // We use chat completion dry-run instead of models list, as some proxies block /models
          const res = await fetch(`${llmConfig.baseUrl}/chat/completions`, {
              method: "POST",
              headers,
              body: JSON.stringify({
                 model: llmConfig.model,
                 messages: [{ role: "user", content: "ping" }],
                 max_tokens: 1
              }),
              signal: AbortSignal.timeout(8000)
          });
          
          if (res.ok) {
              llm.status = "connected";
              llm.latency = Date.now() - start;
          } else {
              llm.status = "error";
              const text = await res.text();
              if (text.includes("Cloudflare Access")) {
                 llm.error = "Blocked by Cloudflare Access";
                 llm.fix = "Add CF_ACCESS_CLIENT_ID and CF_ACCESS_CLIENT_SECRET env vars.";
              } else if (res.status === 404) {
                 llm.error = "404 Not Found";
                 llm.fix = "Check Base URL path. Ensure it ends in /v1 if using OpenAI format.";
              } else if (res.status === 401) {
                 llm.error = "401 Unauthorized";
                 llm.fix = "Check LLM_API_KEY.";
              } else {
                 llm.error = `HTTP ${res.status}`;
                 llm.fix = "Check server logs for response details.";
              }
          }
      } catch (e) {
          llm.status = "error";
          llm.error = e.message;
          if (e.message.includes("fetch failed")) {
             if (llmConfig.baseUrl.includes("localhost") && isVercel) {
                llm.fix = "You are running on Vercel but trying to connect to localhost. You must use a public URL (ngrok/Cloudflare Tunnel).";
             } else {
                llm.fix = "Server cannot reach LLM URL. Check firewall/networking.";
             }
          }
      }
  }

  // 6. Check ComfyUI / Forge
  const comfyUrl = process.env.COMFYUI_BASE_URL || process.env.SD_API_URL || "http://127.0.0.1:8000";
  
  // Add Cloudflare Access keys from env
  const cfClientId = process.env.CF_ACCESS_CLIENT_ID;
  const cfClientSecret = process.env.CF_ACCESS_CLIENT_SECRET;

  const comfy = {
      configured: !!(process.env.COMFYUI_BASE_URL || process.env.SD_API_URL),
      url: comfyUrl,
      status: "unknown",
      fix: null
  };

  if (mode === "deep" && comfyUrl) {
      try {
          const clean = comfyUrl.replace(/\/$/, "");
          const headers = {};
          if (cfClientId && cfClientSecret) {
             headers["CF-Access-Client-Id"] = cfClientId;
             headers["CF-Access-Client-Secret"] = cfClientSecret;
          }
          
          const sdRes = await fetch(`${clean}/sdapi/v1/options`, { 
              headers,
              signal: AbortSignal.timeout(5000) 
          });
          
          if (sdRes.ok) {
              comfy.status = "connected";
              comfy.backend = "Forge/A1111";
          } else {
               comfy.status = "error";
               const text = await sdRes.text();
               if (text.includes("Cloudflare Access")) {
                  comfy.error = "Blocked by Cloudflare Access";
                  comfy.fix = "Check CF_ACCESS_CLIENT_ID and CF_ACCESS_CLIENT_SECRET env vars.";
               } else {
                  comfy.error = `HTTP ${sdRes.status}`;
                  if (sdRes.status === 404) comfy.fix = "Endpoint not found. Ensure --api flag is used.";
               }
          }
      } catch (e) {
          comfy.status = "error";
          comfy.error = e.message;
          if (comfyUrl.includes("127.0.0.1") && isVercel) {
             comfy.fix = "CRITICAL: You are deployed on Vercel but targeting 127.0.0.1 (Localhost). Vercel cannot reach your home PC. Use ngrok or Cloudflare Tunnel to expose port 8000 publicly, then set SD_API_URL.";
          } else {
             comfy.fix = "Ensure ComfyUI is running with '--listen --api' flags.";
          }
      }
  } else if (!comfyUrl) {
      comfy.status = "missing_config";
      comfy.fix = "Set SD_API_URL env var.";
  }

  return NextResponse.json({ supabase, vercel, github, cloudflare, llm, comfy });
}