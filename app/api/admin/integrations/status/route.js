import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdminSession();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  // Check Supabase
  const supabase = {
     url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Configured" : null,
     hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
     hasDbUrl: !!(process.env.SUPABASE_DB_URL || process.env.DATABASE_URL),
     ok: !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY
  };

  // Check Vercel
  const vercel = {
     env: process.env.VERCEL_ENV,
     url: process.env.VERCEL_URL,
     region: process.env.VERCEL_REGION,
     commit: process.env.VERCEL_GIT_COMMIT_SHA,
  };

  // Check GitHub
  const github = {
     repo: process.env.GITHUB_SYNC_REPO,
     branch: process.env.GITHUB_SYNC_BRANCH || "main",
     ok: !!process.env.GITHUB_SYNC_TOKEN && !!process.env.GITHUB_SYNC_REPO
  };

  // Check Cloudflare
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
             status: t.status, // healthy, down, etc
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

  return NextResponse.json({ supabase, vercel, github, cloudflare });
}