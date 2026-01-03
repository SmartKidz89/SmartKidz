import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const SAMPLE_LESSONS = [
  {
    id: "MAT_Y1_COUNT_01",
    year: 1,
    subject: "MATH",
    topic: "Counting",
    title: "Counting to 10",
    content: {
      duration_minutes: 15,
      objective: "Count to 10 fluently.",
      explanation: "Numbers help us know 'how many'. We count by saying number names in order.",
      real_world_application: "Count your toys or steps.",
      quiz: [{ question: "What comes after 3?", options: ["2", "4", "5"], answer: "4", explanation: "4 comes after 3." }]
    }
  },
  {
    id: "ENG_Y2_READ_01",
    year: 2,
    subject: "ENG",
    topic: "Reading",
    title: "The Cat Sat",
    content: {
      duration_minutes: 15,
      objective: "Read simple CVC sentences.",
      explanation: "Reading is turning marks on paper into words in your head.",
      real_world_application: "Read signs when you walk outside.",
      quiz: [{ question: "Who sat?", options: ["The dog", "The cat"], answer: "The cat", explanation: "The text says the cat sat." }]
    }
  },
  {
    id: "SCI_Y3_LIFE_01",
    year: 3,
    subject: "SCI",
    topic: "Living Things",
    title: "Living vs Non-Living",
    content: {
      duration_minutes: 15,
      objective: "Distinguish living things from non-living things.",
      explanation: "Living things grow, eat, and breathe. Non-living things do not.",
      real_world_application: "Is a rock living? Is a flower living?",
      quiz: [{ question: "Is a rock living?", options: ["Yes", "No"], answer: "No", explanation: "Rocks do not grow or eat." }]
    }
  }
];

export async function POST(req) {
  try {
    const { token } = await req.json().catch(() => ({}));
    
    if (!process.env.ADMIN_GENERATE_ASSETS_TOKEN || token !== process.env.ADMIN_GENERATE_ASSETS_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    
    // Upsert Templates
    const templates = SAMPLE_LESSONS.map(l => ({
      template_id: l.id,
      subject_id: l.subject,
      year_level: l.year,
      title: l.title,
      topic: l.topic,
      canonical_tags: []
    }));

    const { error: tErr } = await supabase.from("lesson_templates").upsert(templates, { onConflict: "template_id" });
    if (tErr) throw new Error(`Template error: ${tErr.message}`);

    // Upsert Editions (English/Intl)
    const editions = SAMPLE_LESSONS.map(l => ({
      edition_id: l.id,
      template_id: l.id,
      country_code: "AU", // Default to AU for this seed
      locale_code: "en-AU",
      curriculum_id: "AC9", // Assumes Seed System has run
      title: l.title,
      wrapper_json: l.content,
      status: "published"
    }));

    const { error: eErr } = await supabase.from("lesson_editions").upsert(editions, { onConflict: "edition_id" });
    if (eErr) throw new Error(`Edition error: ${eErr.message}`);

    return NextResponse.json({ ok: true, seeded: editions.length });

  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}