import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdminSession } from "@/lib/admin/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdminSession();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("comfyui_workflows")
    .select("workflow_name,notes,updated_at")
    .order("workflow_name", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, data: data || [] });
}

export async function POST(req) {
  const auth = await requireAdminSession();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await req.json().catch(() => ({}));
  const workflow_name = String(body.workflow_name || "").trim();
  const workflow_json = body.workflow_json;

  if (!workflow_name) return NextResponse.json({ error: "workflow_name is required" }, { status: 400 });
  if (!workflow_json || typeof workflow_json !== "object") {
    return NextResponse.json({ error: "workflow_json must be a JSON object" }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const { error } = await admin.from("comfyui_workflows").upsert(
    {
      workflow_name,
      workflow_json,
      notes: body.notes ? String(body.notes) : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "workflow_name" }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
