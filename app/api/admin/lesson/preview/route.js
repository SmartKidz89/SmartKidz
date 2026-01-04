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
  const { data, error } = await admin
     .from("lesson_editions")
     .select("*, lesson_content_items(*)")
     .eq("edition_id", editionId)
     .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  if (data) {
     // Alias for component compatibility
     data.content_items = data.lesson_content_items || [];
     // Sort by activity_order if present
     data.content_items.sort((a, b) => (a.activity_order || 0) - (b.activity_order || 0));
  }
  
  return NextResponse.json({ data });
}