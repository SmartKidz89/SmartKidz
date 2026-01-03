import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdminSession } from "@/lib/admin/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  const auth = await requireAdminSession();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { searchParams } = new URL(req.url);
  const page_id = searchParams.get("page_id");
  if (!page_id) return NextResponse.json({ error: "page_id is required" }, { status: 400 });

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("cms_page_schedules")
    .select("page_id,publish_at")
    .eq("page_id", page_id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ schedule: data || null });
}
