import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdminSession } from "@/lib/admin/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  const auth = await requireAdminSession();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { searchParams } = new URL(req.url);
  const editionId = searchParams.get("edition_id");
  
  if (!editionId) return NextResponse.json({ error: "Missing edition_id" }, { status: 400 });

  const admin = getSupabaseAdmin();
  
  // Use RPC to bypass RLS reliability issues with the service role
  const { data, error } = await admin.rpc("get_lesson_preview_data", { p_edition_id: editionId });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  // Reshape to match expected format
  const edition = data.edition || {};
  edition.content_items = data.content_items || [];
  
  return NextResponse.json({ data: edition });
}