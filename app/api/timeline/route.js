import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const childId = searchParams.get("childId");

  if (!childId) return NextResponse.json({ error: "Child ID required" }, { status: 400 });

  const supabase = getSupabaseAdmin();

  try {
    // 1. Fetch Attempts (Lessons/Quests)
    const { data: attempts } = await supabase
      .from("attempts")
      .select("id, activity_id, response_json, created_at, correct")
      .eq("child_id", childId)
      .eq("correct", true) // Only show wins on timeline
      .order("created_at", { ascending: false })
      .limit(50);

    // 2. Fetch Badges
    const { data: badges } = await supabase
      .from("child_badges")
      .select("badge_id, awarded_at")
      .eq("child_id", childId)
      .order("awarded_at", { ascending: false });

    // 3. Fetch Reflections
    const { data: reflections } = await supabase
      .from("child_reflections")
      .select("id, mood, proud, created_at")
      .eq("child_id", childId)
      .order("created_at", { ascending: false });

    // Merge & Normalize
    const timeline = [];

    (attempts || []).forEach(a => {
      const type = a.activity_id.includes("lesson") ? "lesson" : "activity";
      const title = a.response_json?.title || a.activity_id.replace(/_/g, " ");
      timeline.push({
        id: `att-${a.id}`,
        type,
        title: title,
        subtitle: "Completed",
        date: a.created_at,
        icon: "✅",
        color: "emerald"
      });
    });

    (badges || []).forEach(b => {
      timeline.push({
        id: `bdg-${b.badge_id}`,
        type: "badge",
        title: "Badge Earned",
        subtitle: b.badge_id.replace(/_/g, " "),
        date: b.awarded_at,
        icon: "🏆",
        color: "amber"
      });
    });

    (reflections || []).forEach(r => {
      if (!r.proud) return;
      timeline.push({
        id: `ref-${r.id}`,
        type: "reflection",
        title: "Proud Moment",
        subtitle: `"${r.proud}"`,
        date: r.created_at,
        icon: "🌱",
        color: "indigo"
      });
    });

    // Sort Descending
    timeline.sort((a, b) => new Date(b.date) - new Date(a.date));

    return NextResponse.json({ timeline });

  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}