import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { syncCmsToGitHub } from "@/lib/admin/github";
import { logAudit } from "@/lib/admin/audit";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdminSession({ minRole: "admin" });
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const repo = process.env.GITHUB_SYNC_REPO || null;
  const branch = process.env.GITHUB_SYNC_BRANCH || "main";
  const prefix = (process.env.GITHUB_SYNC_PATH_PREFIX || "cms-export").replace(/^\/+|\/+$/g, "");
  const tokenConfigured = !!process.env.GITHUB_SYNC_TOKEN;

  const missing = [];
  if (!tokenConfigured) missing.push("GITHUB_SYNC_TOKEN");
  if (!repo) missing.push("GITHUB_SYNC_REPO");

  let lastSync = null;
  let settingsUpdatedAt = null;
  try {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("cms_settings")
      .select("key,value,updated_at")
      .eq("key", "github_sync")
      .maybeSingle();
    if (!error && data) {
      lastSync = data.value || null;
      settingsUpdatedAt = data.updated_at || null;
    }
  } catch {
    // ignore — status still returns env readiness
  }

  return NextResponse.json({
    env: { repo, branch, prefix, tokenConfigured },
    missing,
    lastSync,
    settingsUpdatedAt,
  });
}

export async function POST() {
  const auth = await requireAdminSession({ minRole: "root" });
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const actor = auth.session?.user?.username;

  try {
    const result = await syncCmsToGitHub({ actor });
    await logAudit({ actor, action: "sync", entity: "github", meta: result });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: e?.message || "Sync failed" }, { status: 500 });
  }
}
