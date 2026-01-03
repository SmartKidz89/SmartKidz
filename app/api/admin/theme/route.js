import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdminSession } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdminSession();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const admin = getSupabaseAdmin();
  const { data, error } = await admin.from("cms_theme").select("*").eq("scope", "global").maybeSingle();
  if (error) return NextResponse.json({ error: error.message || "Query failed" }, { status: 500 });

  return NextResponse.json({ theme: data || { scope: "global", tokens: {} } });
}

export async function POST(req) {
  const auth = await requireAdminSession();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const session = auth.session;

  const body = await req.json();
  const tokens = body?.tokens && typeof body.tokens === "object" ? body.tokens : {};

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("cms_theme")
    .upsert({ scope: "global", tokens, updated_at: new Date().toISOString() }, { onConflict: "scope" })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message || "Save failed" }, { status: 500 });

  await logAudit({ actor: session.user?.username, action: "update", entity: "cms_theme", entityId: data?.id });
  return NextResponse.json({ theme: data });
}
