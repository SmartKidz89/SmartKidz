import { getSupabaseAdmin } from "../../../../lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { token } = await req.json();
    if (!process.env.ADMIN_EXPORT_TOKEN || token !== process.env.ADMIN_EXPORT_TOKEN) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    const tables = ["subjects","lessons","skills","lesson_skills"];
    const out = {};

    for (const t of tables) {
      const { data, error } = await supabase.from(t).select("*");
      if (error) throw error;
      out[t] = data;
    }

    return Response.json(out);
  } catch (err) {
    return Response.json({ error: err?.message || "Export failed" }, { status: 500 });
  }
}
