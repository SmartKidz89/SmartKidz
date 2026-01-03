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
    .from("cms_page_versions")
    .select("id,page_id,status,created_at,created_by,content_json")
    .eq("page_id", page_id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data || [] });
}
