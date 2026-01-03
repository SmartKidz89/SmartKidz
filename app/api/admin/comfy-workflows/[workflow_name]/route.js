import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdminSession } from "@/lib/admin/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req, { params }) {
  const auth = await requireAdminSession();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const workflow_name = decodeURIComponent(params.workflow_name || "");
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("comfyui_workflows")
    .select("*")
    .eq("workflow_name", workflow_name)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ok: true, data });
}

export async function DELETE(_req, { params }) {
  const auth = await requireAdminSession();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const workflow_name = decodeURIComponent(params.workflow_name || "");
  const admin = getSupabaseAdmin();
  const { error } = await admin.from("comfyui_workflows").delete().eq("workflow_name", workflow_name);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
