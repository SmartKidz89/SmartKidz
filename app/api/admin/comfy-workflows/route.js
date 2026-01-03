import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdminSession } from "@/lib/admin/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toSafeName(value) {
  const name = String(value || "").trim();
  // Keep this permissive but safe; workflow_name is used in URLs.
  if (!name) return null;
  if (name.length > 128) return null;
  if (!/^[a-zA-Z0-9._\- ]+$/.test(name)) return null;
  return name;
}

function parseWorkflowJson(input) {
  if (input == null) return null;
  if (typeof input === "object") return input;
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) return null;
    return JSON.parse(trimmed);
  }
  return null;
}

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

  const body = await req.json().catch(() => null);
  const workflow_name = toSafeName(body?.workflow_name);
  if (!workflow_name) {
    return NextResponse.json(
      { error: "Invalid workflow name. Use letters, numbers, spaces, dot, underscore, or dash (max 128 chars)." },
      { status: 400 }
    );
  }

  let workflow_json;
  try {
    workflow_json = parseWorkflowJson(body?.workflow_json);
  } catch (e) {
    return NextResponse.json({ error: "workflow_json must be valid JSON." }, { status: 400 });
  }
  if (!workflow_json) {
    return NextResponse.json({ error: "workflow_json is required." }, { status: 400 });
  }

  const notes = body?.notes ? String(body.notes).trim() : null;

  const admin = getSupabaseAdmin();
  const { error } = await admin.from("comfyui_workflows").upsert(
    {
      workflow_name,
      workflow_json,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "workflow_name" }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
