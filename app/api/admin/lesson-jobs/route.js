import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdminSession } from "@/lib/admin/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdminSession();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const admin = getSupabaseAdmin();

  // Parallel queries for stats
  const [totalRes, completedRes, queuedRes, failedRes, listRes] = await Promise.all([
    admin.from("lesson_generation_jobs").select("*", { count: "exact", head: true }),
    admin.from("lesson_generation_jobs").select("*", { count: "exact", head: true }).eq("status", "completed"),
    admin.from("lesson_generation_jobs").select("*", { count: "exact", head: true }).eq("status", "queued"),
    admin.from("lesson_generation_jobs").select("*", { count: "exact", head: true }).eq("status", "failed"),
    admin.from("lesson_generation_jobs")
      .select("id,job_id,subject,year_level,topic,subtopic,locale_code,status,image_status,supabase_lesson_id,error_message,updated_at,created_at")
      .order("created_at", { ascending: false }) // Show newest jobs first
      .limit(200) // Increased limit to see more of the queue
  ]);

  if (listRes.error) return NextResponse.json({ error: listRes.error.message }, { status: 500 });
  
  return NextResponse.json({ 
    data: listRes.data || [],
    stats: {
      total: totalRes.count || 0,
      completed: completedRes.count || 0,
      queued: queuedRes.count || 0,
      failed: failedRes.count || 0
    }
  });
}

export async function POST(req) {
  const auth = await requireAdminSession();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await req.json().catch(() => ({}));
  const jobs = Array.isArray(body.jobs) ? body.jobs : [];
  if (jobs.length === 0) return NextResponse.json({ error: "jobs[] is required" }, { status: 400 });

  const admin = getSupabaseAdmin();
  const payload = jobs.map((j) => ({
    job_id: j.job_id,
    subject: j.subject,
    year_level: j.year_level,
    lesson_number: j.lesson_number ?? null,
    topic: j.topic ?? null,
    subtopic: j.subtopic ?? null,
    difficulty_band: j.difficulty_band ?? null,
    locale_code: j.locale_code ?? "en-AU",
    question_count: j.question_count ?? 10,
    generate_images: !!j.generate_images,
    image_types: j.image_types ?? null,
    image_pack: j.image_pack ?? null,
    prompt_profile: j.prompt_profile ?? null,
    status: "queued",
    image_status: "pending",
  }));

  const { error } = await admin.from("lesson_generation_jobs").insert(payload);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, inserted: payload.length });
}