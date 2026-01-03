import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { syncCmsToGitHub } from "@/lib/admin/github";
import { logAudit } from "@/lib/admin/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
