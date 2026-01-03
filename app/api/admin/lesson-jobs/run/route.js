import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdminSession } from "@/lib/admin/auth";
import { llmChatComplete } from "@/lib/llm/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function subjectToCode(subject) {
  const s = String(subject || "").toLowerCase();
  if (s.includes("math")) return "MATH";
  if (s.includes("english")) return "ENG";
  if (s.includes("science")) return "SCI";
  if (s.includes("hass")) return "HASS";
  if (s.includes("health")) return "HPE";
  return String(subject || "GEN").toUpperCase().slice(0, 8);
}

function safeJsonParse(maybeJsonText) {
  if (typeof maybeJsonText !== "string") return maybeJsonText || {};
  const t = maybeJsonText.trim();
  try {
    return JSON.parse(t);
  } catch {
    // Try to extract JSON object
    const start = t.indexOf("{");
    const end = t.lastIndexOf("}");
    if (start >= 0 && end > start) {
      const sub = t.slice(start, end + 1);
      return JSON.parse(sub);
    }
    throw new Error("Model did not return valid JSON");
  }
}

function fillTemplate(tpl, vars) {
  if (!tpl) return "";
  return String(tpl).replace(/\{(\w+)\}/g, (_, k) => {
    const v = vars[k];
    return v === undefined || v === null ? "" : String(v);
  });
}

export async function POST(req) {
  const auth = await requireAdminSession();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await req.json().catch(() => ({}));
  const limit = Math.max(1, Math.min(25, Number(body.limit || 5)));

  const admin = getSupabaseAdmin();

  const { data: jobs, error } = await admin
    .from("lesson_generation_jobs")
    .select("*")
    .eq("status", "queued")
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!jobs || jobs.length === 0) return NextResponse.json({ ok: true, processed: 0, ok_count: 0, failed: 0 });

  let okCount = 0;
  let failedCount = 0;

  for (const job of jobs) {
    try {
      await admin.from("lesson_generation_jobs").update({ status: "running", updated_at: new Date().toISOString() }).eq("id", job.id);

      // Load prompt profile (optional)
      let profile = null;
      if (job.prompt_profile) {
        const { data: p } = await admin
          .from("lesson_prompt_profiles")
          .select("*")
          .eq("prompt_profile", job.prompt_profile)
          .maybeSingle();
        profile = p || null;
      }

      const vars = {
        subject: job.subject,
        year_level: job.year_level,
        topic: job.topic,
        subtopic: job.subtopic,
        lesson_number: job.lesson_number,
        locale_code: job.locale_code,
        question_count: job.question_count,
      };

      const systemPrompt =
        profile?.system_prompt ||
        "You are a senior learning designer. Output must be valid JSON only. Do not include markdown or commentary.";
      const userTemplate =
        profile?.user_prompt_template ||
        "Generate ONE lesson JSON object for {subject} Year {year_level} about {topic} - {subtopic}. Include overview, objective, explanation, examples, practice_questions (array), and quiz (array).";
      const userPrompt = fillTemplate(userTemplate, vars);

      const { text } = await llmChatComplete({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.4,
        max_tokens: 2200,
      });

      const wrapper = safeJsonParse(text);

      // Upsert lesson records
      const subject_id = subjectToCode(job.subject);
      const yearLevelInt = Number(String(job.year_level).replace(/[^\d]/g, "")) || 0;

      const template_id = job.job_id;
      const edition_id = `${job.job_id}_${job.locale_code || "en-AU"}`;

      const title = wrapper?.title || job.subtopic || job.topic || "Lesson";

      const { error: tErr } = await admin
        .from("lesson_templates")
        .upsert(
          {
            template_id,
            subject_id,
            year_level: yearLevelInt,
            topic: job.topic || "General",
            title,
            canonical_tags: [],
            updated_at: new Date().toISOString(),
          },
          { onConflict: "template_id" }
        );
      if (tErr) throw new Error(`Template upsert failed: ${tErr.message}`);

      const country_code = (job.locale_code || "").toUpperCase().includes("AU") ? "AU" : "US";

      const { error: eErr } = await admin
        .from("lesson_editions")
        .upsert(
          {
            edition_id,
            template_id,
            country_code,
            locale_code: job.locale_code || "en-AU",
            curriculum_id: "AC9",
            version: 1,
            status: "published",
            title,
            wrapper_json: wrapper,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "edition_id" }
        );
      if (eErr) throw new Error(`Edition upsert failed: ${eErr.message}`);

      // Create asset queue
      let assetCount = 0;
      if (job.generate_images && job.image_types) {
        const types = String(job.image_types)
          .split(",")
          .map(s => s.trim())
          .filter(Boolean);

        for (const image_type of types) {
          // Find spec for this pack/type
          const { data: spec } = await admin
            .from("lesson_image_specs")
            .select("*")
            .eq("image_pack", job.image_pack || "")
            .eq("image_type", image_type)
            .maybeSingle();

          const workflow = job.comfyui_workflow_override || spec?.comfyui_workflow || "basic_text2img";
          const prompt =
            job.comfyui_prompt_override ||
            fillTemplate(spec?.positive_prompt_template || "{subject} {year_level} {topic} {subtopic}", vars);

          const negative = job.comfyui_negative_prompt_override || spec?.negative_prompt || "";

          const payload = {
            job_id: job.job_id,
            edition_id,
            image_pack: job.image_pack || null,
            image_type,
            comfyui_workflow: workflow,
            prompt,
            negative_prompt: negative,
            width: spec?.width ?? 1024,
            height: spec?.height ?? 1024,
            steps: spec?.steps ?? 28,
            cfg_scale: spec?.cfg_scale ?? 5.5,
            sampler: spec?.sampler ?? null,
            scheduler: spec?.scheduler ?? null,
            status: "queued",
          };

          const { error: aErr } = await admin.from("lesson_asset_jobs").insert(payload);
          if (aErr) throw new Error(`Asset job insert failed: ${aErr.message}`);
          assetCount += 1;
        }
      }

      await admin.from("lesson_generation_jobs").update({
        status: "completed",
        supabase_lesson_id: edition_id,
        image_status: assetCount > 0 ? "queued" : "none",
        updated_at: new Date().toISOString(),
      }).eq("id", job.id);

      okCount += 1;
    } catch (e) {
      failedCount += 1;
      try {
        await admin.from("lesson_generation_jobs").update({
          status: "failed",
          error_message: e?.message || "Failed",
          updated_at: new Date().toISOString(),
        }).eq("id", job.id);
      } catch {}
    }
  }

  return NextResponse.json({ ok: true, processed: jobs.length, ok: okCount, failed: failedCount });
}
