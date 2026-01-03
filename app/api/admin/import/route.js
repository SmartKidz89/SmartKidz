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
    
    const templates = payload.map((r) => ({
      template_id: r.template_id ?? r.id,
      subject_id: r.subject_id,
      year_level: r.year_level ?? 3,
      title: r.title,
      topic: r.topic ?? null,
      canonical_tags: r.canonical_tags ?? []
    }));

    // Upsert templates first
    const { error: tplError } = await supabase
      .from("lesson_templates")
      .upsert(templates, { onConflict: "template_id" });
    if (tplError) throw tplError;

    // Resolve curriculum_id for each edition (required column)
    const countryCode = payload?.[0]?.country_code ?? payload?.[0]?.country ?? "INT";
    const localeCode = payload?.[0]?.locale_code ?? payload?.[0]?.locale ?? "en-AU";

    const { data: curriculumRow, error: curError } = await supabase
      .from("curricula")
      .select("id")
      .eq("country_code", countryCode)
      .eq("locale_code", localeCode)
      .limit(1)
      .maybeSingle();

    if (curError) throw curError;

    const curriculumId =
      curriculumRow?.id ??
      (await (async () => {
        const { data, error } = await supabase.from("curricula").select("id").limit(1).maybeSingle();
        if (error) throw error;
        return data?.id;
      })());

    if (!curriculumId) {
      return Response.json(
        { error: "No curriculum found. Create at least one row in public.curricula before importing lessons." },
        { status: 400 }
      );
    }

    const editions = payload.map((r) => ({
      edition_id: r.edition_id ?? r.id,
      template_id: r.template_id ?? r.id,
      country_code: r.country_code ?? r.country ?? countryCode,
      locale_code: r.locale_code ?? r.locale ?? localeCode,
      curriculum_id: r.curriculum_id ?? curriculumId,
      status: r.status ?? "published",
      title: r.title,
      wrapper_json: r.wrapper_json ?? r.content_json ?? r.content ?? r.contentJson ?? {}
    }));

    const { error: edError } = await supabase
      .from("lesson_editions")
      .upsert(editions, { onConflict: "edition_id" });
    if (edError) throw edError;

    return Response.json({ upserted_templates: templates.length, upserted_editions: editions.length });

  } catch (err) {
    return Response.json({ error: err?.message || "Import failed" }, { status: 500 });
  }
}
