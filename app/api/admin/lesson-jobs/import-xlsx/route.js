import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdminSession } from "@/lib/admin/auth";
import * as XLSX from "xlsx";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function chunk(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

function normalizeBool(v) {
  if (typeof v === "boolean") return v;
  const s = String(v || "").trim().toLowerCase();
  return ["y", "yes", "true", "1"].includes(s);
}

export async function POST(req) {
  const auth = await requireAdminSession();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
  const file = form.get("file");
  if (!file) return NextResponse.json({ error: "file is required" }, { status: 400 });

  const buf = Buffer.from(await file.arrayBuffer());
  const wb = XLSX.read(buf, { type: "buffer" });

  const admin = getSupabaseAdmin();

  // Prompt Library
  let promptProfilesImported = 0;
  if (wb.Sheets["Prompt Library"]) {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets["Prompt Library"], { defval: null });
    const payload = rows
      .filter(r => r.prompt_profile)
      .map(r => ({
        prompt_profile: String(r.prompt_profile),
        subject: r.subject ? String(r.subject) : null,
        year_level: r.year_level ? String(r.year_level) : null,
        system_prompt: r.system_prompt ? String(r.system_prompt) : null,
        user_prompt_template: r.user_prompt_template ? String(r.user_prompt_template) : null,
        output_schema_notes: r.output_schema_notes ? String(r.output_schema_notes) : null,
      }));

    for (const c of chunk(payload, 200)) {
      const { error } = await admin
        .from("lesson_prompt_profiles")
        .upsert(c, { onConflict: "prompt_profile" });
      if (error) return NextResponse.json({ error: `Prompt Library: ${error.message}` }, { status: 500 });
      promptProfilesImported += c.length;
    }
  }

  // Image Specs
  let imageSpecsImported = 0;
  if (wb.Sheets["Image Specs"]) {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets["Image Specs"], { defval: null });
    const payload = rows
      .filter(r => r.image_pack && r.image_type)
      .map(r => ({
        image_pack: String(r.image_pack),
        image_type: String(r.image_type),
        comfyui_workflow: r.comfyui_workflow ? String(r.comfyui_workflow) : null,
        width: r.width ? Number(r.width) : null,
        height: r.height ? Number(r.height) : null,
        steps: r.steps ? Number(r.steps) : null,
        cfg_scale: r.cfg_scale ? Number(r.cfg_scale) : null,
        sampler: r.sampler ? String(r.sampler) : null,
        scheduler: r.scheduler ? String(r.scheduler) : null,
        positive_prompt_template: r.positive_prompt_template ? String(r.positive_prompt_template) : null,
        negative_prompt: r.negative_prompt ? String(r.negative_prompt) : null,
        notes: r.notes ? String(r.notes) : null,
      }));

    for (const c of chunk(payload, 200)) {
      const { error } = await admin
        .from("lesson_image_specs")
        .upsert(c, { onConflict: "image_pack,image_type" });
      if (error) return NextResponse.json({ error: `Image Specs: ${error.message}` }, { status: 500 });
      imageSpecsImported += c.length;
    }
  }

  // Lesson Jobs
  let jobsImported = 0;
  if (wb.Sheets["Lesson Jobs"]) {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets["Lesson Jobs"], { defval: null });
    const payload = rows
      .filter(r => r.job_id)
      .map(r => ({
        job_id: String(r.job_id),
        subject: r.subject ? String(r.subject) : null,
        year_level: r.year_level ? String(r.year_level) : null,
        lesson_number: r.lesson_number ? Number(r.lesson_number) : null,
        topic: r.topic ? String(r.topic) : null,
        subtopic: r.subtopic ? String(r.subtopic) : null,
        difficulty_band: r.difficulty_band ? String(r.difficulty_band) : null,
        locale_code: r.locale_code ? String(r.locale_code) : "en-AU",
        question_count: r.question_count ? Number(r.question_count) : 10,
        generate_images: normalizeBool(r.generate_images),
        image_types: r.image_types ? String(r.image_types) : null,
        image_pack: r.image_pack ? String(r.image_pack) : null,
        prompt_profile: r.prompt_profile ? String(r.prompt_profile) : null,
        comfyui_workflow_override: r.comfyui_workflow_override ? String(r.comfyui_workflow_override) : null,
        comfyui_prompt_override: r.comfyui_prompt_override ? String(r.comfyui_prompt_override) : null,
        comfyui_negative_prompt_override: r.comfyui_negative_prompt_override ? String(r.comfyui_negative_prompt_override) : null,
        asset_plan_json: r.asset_plan_json ? r.asset_plan_json : null,
        status: r.status ? String(r.status) : "queued",
        image_status: r.image_status ? String(r.image_status) : "pending",
      }));

    for (const c of chunk(payload, 250)) {
      const { error } = await admin
        .from("lesson_generation_jobs")
        .upsert(c, { onConflict: "job_id" });
      if (error) return NextResponse.json({ error: `Lesson Jobs: ${error.message}` }, { status: 500 });
      jobsImported += c.length;
    }
  }

  return NextResponse.json({
    ok: true,
    jobs_imported: jobsImported,
    prompt_profiles_imported: promptProfilesImported,
    image_specs_imported: imageSpecsImported,
  });
}
