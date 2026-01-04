import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(req) {
  const auth = await requireAdminSession();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { edition_id, content_json } = await req.json();
  if (!edition_id || !content_json) {
    return NextResponse.json({ error: "Missing edition_id or content_json" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  try {
    // 1. Update the wrapper JSON in the edition
    const { error: updateErr } = await supabase
      .from("lesson_editions")
      .update({ wrapper_json: content_json, updated_at: new Date().toISOString() })
      .eq("edition_id", edition_id);

    if (updateErr) throw updateErr;

    // 2. Re-generate content items from the new JSON
    // We delete old items and recreate them to ensure sync
    await supabase.from("lesson_content_items").delete().eq("edition_id", edition_id);

    const contentItems = [];
    
    // Intro
    if (content_json.lesson_intro) {
      contentItems.push({
        content_id: `${edition_id}_intro`,
        edition_id,
        activity_order: 0,
        phase: "hook",
        type: "learn",
        title: "Introduction",
        content_json: { prompt: content_json.lesson_intro.narrative_setup?.text || "Welcome", ...content_json.lesson_intro }
      });
    }

    // Questions
    if (Array.isArray(content_json.questions)) {
      content_json.questions.forEach((q, i) => {
        const type = q.question_format === "multiple_choice" ? "multiple_choice" : "fill_blank";
        contentItems.push({
          content_id: `${edition_id}_q${i + 1}`,
          edition_id,
          activity_order: i + 1,
          phase: "independent_practice", // Simplified phase logic for manual edits
          type,
          title: `Question ${i + 1}`,
          content_json: q
        });
      });
    }

    // Outro
    if (content_json.lesson_outro) {
      contentItems.push({
        content_id: `${edition_id}_outro`,
        edition_id,
        activity_order: 99,
        phase: "challenge",
        type: "learn",
        title: "Summary",
        content_json: { prompt: content_json.lesson_outro.performance_summary?.text || "Done", ...content_json.lesson_outro }
      });
    }

    if (contentItems.length > 0) {
      const { error: insertErr } = await supabase.from("lesson_content_items").insert(contentItems);
      if (insertErr) throw insertErr;
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}