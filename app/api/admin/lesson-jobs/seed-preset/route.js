import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdminSession } from "@/lib/admin/auth";
import { PRESET_JOBS } from "@/data/preset_jobs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  const auth = await requireAdminSession();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const admin = getSupabaseAdmin();
  
  // Transform presets into DB rows
  const payload = PRESET_JOBS.map(j => ({
    job_id: j.job_id,
    subject: j.subject,
    year_level: j.year_level,
    topic: j.topic,
    subtopic: j.subtopic,
    difficulty_band: j.difficulty_band || "standard",
    locale_code: "en-AU",
    question_count: 10,
    generate_images: j.generate_images ?? false,
    image_types: j.image_types || null,
    image_pack: j.image_pack || null,
    status: "queued",
    image_status: "pending",
    created_at: new Date().toISOString()
  }));

  // Upsert to avoid duplicates
  const { error } = await admin
    .from("lesson_generation_jobs")
    .upsert(payload, { onConflict: "job_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, count: payload.length });
}