import { NextResponse } from "next/server";
import { generateDailyQuests } from "@/lib/quests/generate";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

/**
 * GET /api/quests?childId=...&date=YYYY-MM-DD
 * Returns daily quests. Persists to Supabase when service role is configured.
 */
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const childId = searchParams.get("childId") || "anon";
  const dateISO = searchParams.get("date") || new Date().toISOString().slice(0, 10);

  const quests = generateDailyQuests({ childId, dateISO });

  // Persist only if admin key is present
  try {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = getSupabaseAdmin();
      await supabase.from("skz_daily_quests").upsert({
        child_id: childId,
        date: dateISO,
        quests
      }, { onConflict: "child_id,date" });
    }
  } catch {
    // do not fail the request if persistence fails
  }

  return NextResponse.json({ childId, date: dateISO, quests });
}
