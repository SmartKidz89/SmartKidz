import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdminSession } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  const auth = await requireAdminSession();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const admin = getSupabaseAdmin();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  let query = admin
    .from("lesson_editions")
    .select("edition_id, title, country_code, lesson_templates!inner(subject_id, year_level, topic)")
    .order("updated_at", { ascending: false })
    .limit(200);

  if (q) {
    query = query.ilike("title", `%${q}%`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  return NextResponse.json({ lessons: data || [] });
}

export async function POST(req) {
  const auth = await requireAdminSession();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await req.json();
  const { edition_id, title, wrapper_json } = body;
  
  if (!edition_id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

  const admin = getSupabaseAdmin();
  const { error } = await admin
    .from("lesson_editions")
    .update({ 
      title, 
      wrapper_json, 
      updated_at: new Date().toISOString() 
    })
    .eq("edition_id", edition_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAudit({ 
    actor: auth.session.user.username, 
    action: "update_lesson", 
    entity: "lesson_editions", 
    entityId: edition_id 
  });

  return NextResponse.json({ ok: true });
}