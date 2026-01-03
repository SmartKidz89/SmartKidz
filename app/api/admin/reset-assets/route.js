import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { token, mode } = await req.json().catch(() => ({}));
    
    if (!process.env.ADMIN_GENERATE_ASSETS_TOKEN || token !== process.env.ADMIN_GENERATE_ASSETS_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    let count = 0;

    if (mode === "lessons") {
      // Delete assets linked to lessons (those with asset_id starting with 'lesson-cover-')
      const { data, error } = await supabase
        .from("assets")
        .delete()
        .ilike("asset_id", "lesson-cover-%")
        .select("asset_id");
      
      if (error) throw error;
      count = data?.length || 0;
    } 
    else if (mode === "system") {
       // Delete system assets (game-*, tool-*, world-*)
       const { data, error } = await supabase
        .from("assets")
        .delete()
        .or("asset_id.ilike.game-%,asset_id.ilike.tool-%,asset_id.ilike.world-%")
        .select("asset_id");
       
       if (error) throw error;
       count = data?.length || 0;
    }

    return NextResponse.json({ ok: true, deleted: count, message: `Deleted ${count} ${mode} assets. Run scan again to re-queue.` });

  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}