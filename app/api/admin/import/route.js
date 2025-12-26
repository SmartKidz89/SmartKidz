import { getSupabaseAdmin } from "../../../../lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { token, payload } = await req.json();
    if (!process.env.ADMIN_IMPORT_TOKEN || token !== process.env.ADMIN_IMPORT_TOKEN) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!Array.isArray(payload)) {
      return Response.json({ error: "Payload must be an array of lesson rows" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Expect lesson rows: {id, year_level, subject_id, title, topic, content_json}
    const rows = payload.map((r) => ({
      id: r.id,
      year_level: r.year_level,
      subject_id: r.subject_id,
      title: r.title,
      topic: r.topic ?? null,
      content_json: r.content_json ?? r.content ?? r.contentJson ?? {}
    }));

    const { error } = await supabase.from("lessons").upsert(rows, { onConflict: "id" });
    if (error) throw error;

    return Response.json({ upserted: rows.length });
  } catch (err) {
    return Response.json({ error: err?.message || "Import failed" }, { status: 500 });
  }
}
