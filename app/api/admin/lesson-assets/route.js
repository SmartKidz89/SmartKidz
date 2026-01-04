import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdminSession } from "@/lib/admin/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdminSession();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const admin = getSupabaseAdmin();

  const [totalRes, completedRes, queuedRes, listRes] = await Promise.all([
    admin.from("lesson_asset_jobs").select("*", { count: "exact", head: true }),
    admin.from("lesson_asset_jobs").select("*", { count: "exact", head: true }).eq("status", "completed"),
    admin.from("lesson_asset_jobs").select("*", { count: "exact", head: true }).eq("status", "queued"),
    admin.from("lesson_asset_jobs")
      .select("id,job_id,edition_id,image_type,image_pack,comfyui_workflow,status,storage_path,public_url,updated_at,created_at")
      .order("updated_at", { ascending: false })
      .limit(100)
  ]);

  if (listRes.error) return NextResponse.json({ error: listRes.error.message }, { status: 500 });

  return NextResponse.json({ 
    data: listRes.data || [],
    stats: {
      total: totalRes.count || 0,
      completed: completedRes.count || 0,
      queued: queuedRes.count || 0
    }
  });
}