import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdminSession } from "@/lib/admin/auth";
import { llmChatComplete } from "@/lib/llm/client";
import { safeJsonParse, validateLessonWrapper, formatAjvErrors } from "@/lib/lessons/lessonValidation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Map human subject to subject_id codes used by the app.
 * Adjust these mappings to match your subjects table.
 */
function subjectToCode(subject) {
  const s = String(subject || "").toLowerCase();
  if (s.includes("math")) return "MATH";
  if (s.includes("english")) return "ENG";
  if (s.includes("science")) return "SCI";
  if (s.includes("hass")) return "HASS";
  if (s.includes("health")) return "HPE";
  return String(subject || "GEN").toUpperCase().slice(0, 8);
}

function fillTemplate(tpl, vars) {
  if (!tpl) return "";
  return String(tpl).replace(/\{\{(\w+)\}\}|\{(\w+)\}/g, (_, k1, k2) => {
    const k = k1 || k2;
    const v = vars[k];
    return v === undefined || v === null ? "" : String(v);
  });
}

function normalizeBool(v) {
  if (typeof v === "boolean") return v;
  const s = String(v || "").trim().toLowerCase();
  return ["y", "yes", "true", "1"].includes(s);
}

function buildContentItems(wrapper) {
  // Prefer explicit activities array.
  if (Array.isArray(wrapper?.activities) && wrapper.activities.length > 0) {
    return wrapper.activities
      .filter(Boolean)
      .map((a) => ({
        type: a.type || "learn",
        phase: a.phase || "instruction",
        title: a.title || null,
        content_json: a,
      }));
  }

  // Fallback: build a reasonable sequence from common fields.
  const items = [];

  if (wrapper?.real_world_application) {
    items.push({
      type: "visual_observe",
      phase: "hook",
      title: "Real World",
      content_json: { type: "visual_observe", phase: "hook", title: "Real World", prompt: wrapper.real_world_application },
    });
  }

  if (wrapper?.explanation) {
    items.push({
      type: "learn",
      phase: "instruction",
      title: "Let's Learn",
      content_json: { type: "learn", phase: "instruction", title: "Let's Learn", prompt: wrapper.explanation },
    });
  }

  if (wrapper?.worked_example) {
    items.push({
      type: "learn",
      phase: "guided_practice",
      title: "Example",
      content_json: { type: "learn", phase: "guided_practice", title: "Example", prompt: wrapper.worked_example },
    });
  }

  if (Array.isArray(wrapper?.scenarios)) {
    for (const s of wrapper.scenarios) {
      if (!s) continue;
      items.push({
        type: "learn",
        phase: "guided_practice",
        title: "Scenario",
        content_json: { type: "learn", phase: "guided_practice", title: "Scenario", prompt: s.context || "" },
      });
      if (Array.isArray(s.questions)) {
        for (const q of s.questions) {
          if (!q) continue;
          items.push({
            type: "fill_blank",
            phase: "guided_practice",
            title: null,
            content_json: { type: "fill_blank", phase: "guided_practice", prompt: q.prompt, correct_answer: q.answer },
          });
        }
      }
    }
  }

  if (Array.isArray(wrapper?.quiz)) {
    for (const q of wrapper.quiz) {
      if (!q) continue;
      items.push({
        type: "multiple_choice",
        phase: "independent_practice",
        title: null,
        content_json: {
          type: "multiple_choice",
          phase: "independent_practice",
          question: q.question || q.q,
          options: q.options,
          correct_answer: q.answer,
          explanation: q.explanation,
        },
      });
    }
  }

  return items;
}

/**
 * Extract asset requests from:
 * - job.asset_plan_json
 * - wrapper.asset_plan
 * - fallback to job.image_types + lesson_image_specs templates
 *
 * Returns: Array<{ image_type, prompt, negative_prompt, workflow, width, height, steps, cfg_scale, sampler, scheduler, usage }>
 */
function extractAssetRequests({ job, wrapper, specByType }) {
  const out = [];

  // 1) Explicit job-provided asset_plan_json
  const plan = job.asset_plan_json ? (typeof job.asset_plan_json === "string" ? safeJsonParse(job.asset_plan_json) : job.asset_plan_json) : null;
  if (plan) {
    // Accept several shapes:
    // - { items: [{image_type, prompt, negative_prompt, ...}] }
    // - [{...}]
    const items = Array.isArray(plan) ? plan : Array.isArray(plan.items) ? plan.items : [];
    for (const it of items) {
      if (!it) continue;
      const image_type = it.image_type || it.type || it.usage || it.key;
      const prompt = it.prompt || it.positive_prompt || it.positive || "";
      if (!image_type || !prompt) continue;
      out.push({
        image_type: String(image_type),
        prompt: String(prompt),
        negative_prompt: it.negative_prompt || it.negative || "",
        workflow: it.comfyui_workflow || it.workflow || null,
        width: it.width || null,
        height: it.height || null,
        steps: it.steps || null,
        cfg_scale: it.cfg_scale || null,
        sampler: it.sampler || null,
        scheduler: it.scheduler || null,
        usage: it.usage || String(image_type),
      });
    }
  }

  // 2) Wrapper asset_plan (flexible parsing)
  if (out.length === 0 && wrapper && typeof wrapper === "object" && wrapper.asset_plan && typeof wrapper.asset_plan === "object") {
    const ap = wrapper.asset_plan;
    for (const k of Object.keys(ap)) {
      const v = ap[k];
      if (v == null) continue;
      const addOne = (item) => {
        if (!item) return;
        if (typeof item === "string") {
          out.push({ image_type: k, prompt: item, negative_prompt: "", workflow: null, usage: k });
        } else if (typeof item === "object") {
          const prompt = item.prompt || item.positive_prompt || item.positive || item.text || "";
          if (prompt) {
            out.push({
              image_type: item.image_type || k,
              prompt: String(prompt),
              negative_prompt: item.negative_prompt || item.negative || "",
              workflow: item.comfyui_workflow || item.workflow || null,
              width: item.width || null,
              height: item.height || null,
              steps: item.steps || null,
              cfg_scale: item.cfg_scale || null,
              sampler: item.sampler || null,
              scheduler: item.scheduler || null,
              usage: item.usage || k,
            });
          }
        }
      };

      if (Array.isArray(v)) v.forEach(addOne);
      else addOne(v);
    }
  }

  // 3) Fallback: image_types list + specs
  if (out.length === 0 && normalizeBool(job.generate_images) && job.image_types) {
    const types = String(job.image_types)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    for (const image_type of types) {
      const spec = specByType[image_type] || null;
      out.push({
        image_type,
        prompt: job.comfyui_prompt_override || spec?.positive_prompt_template || `${job.subject || ""} ${job.year_level || ""} ${job.topic || ""} ${job.subtopic || ""}`.trim(),
        negative_prompt: job.comfyui_negative_prompt_override || spec?.negative_prompt || "",
        workflow: job.comfyui_workflow_override || spec?.comfyui_workflow || "basic_text2img",
        width: spec?.width ?? 1024,
        height: spec?.height ?? 1024,
        steps: spec?.steps ?? 28,
        cfg_scale: spec?.cfg_scale ?? 5.5,
        sampler: spec?.sampler ?? null,
        scheduler: spec?.scheduler ?? null,
        usage: image_type,
      });
    }
  }

  return out;
}

async function repairWithLlm({ systemPrompt, userPrompt, temperature = 0.2 }) {
  const { text } = await llmChatComplete({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature,
    max_tokens: 2600,
  });
  return safeJsonParse(text);
}

async function upsertContentItems({ admin, edition_id, items }) {
  // Replace content items for edition_id (idempotent)
  await admin.from("lesson_content_items").delete().eq("edition_id", edition_id);

  const payload = items.map((it, idx) => ({
    content_id: `${edition_id}::${String(idx).padStart(3, "0")}`,
    edition_id,
    activity_order: idx,
    phase: it.phase || null,
    type: it.type || "learn",
    title: it.title || null,
    content_json: it.content_json || {},
    updated_at: new Date().toISOString(),
  }));

  // Insert in chunks to avoid request size limits
  const chunkSize = 200;
  for (let i = 0; i < payload.length; i += chunkSize) {
    const c = payload.slice(i, i + chunkSize);
    const { error } = await admin.from("lesson_content_items").insert(c);
    if (error) throw new Error(`lesson_content_items insert failed: ${error.message}`);
  }

  return payload;
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
      const attempt = (job.attempts || 0) + 1;
      await admin
        .from("lesson_generation_jobs")
        .update({ status: "running", attempts: attempt, last_error: null, updated_at: new Date().toISOString() })
        .eq("id", job.id);

      // Prompt profile (optional)
      let profile = null;
      if (job.prompt_profile) {
        const { data: p } = await admin
          .from("lesson_prompt_profiles")
          .select("*")
          .eq("prompt_profile", job.prompt_profile)
          .maybeSingle();
        profile = p || null;
      }

      // Year profile (optional)
      let yearProfile = null;
      if (job.year_level) {
        const { data: yp } = await admin
          .from("year_profiles")
          .select("*")
          .eq("year_level", String(job.year_level))
          .maybeSingle();
        yearProfile = yp || null;
      }

      const vars = {
        subject: job.subject,
        year_level: job.year_level,
        topic: job.topic,
        subtopic: job.subtopic,
        lesson_number: job.lesson_number,
        locale_code: job.locale_code,
        question_count: job.question_count,
        engagement_theme: job.engagement_theme,
        challenge_format: job.challenge_format,
        interaction_palette: job.interaction_palette,
        visual_style_pack: job.visual_style_pack,
        asset_plan_level: job.asset_plan_level,
        ...yearProfile,
      };

      const systemPrompt =
        profile?.system_prompt ||
        "You are a senior learning designer. Output must be valid JSON only. Do not include markdown or commentary.";
      const userTemplate =
        profile?.user_prompt_template ||
        "Generate ONE lesson JSON object for {{subject}} Year {{year_level}} about {{topic}} - {{subtopic}}. Include objective, explanation, scenarios (array), and quiz (array). Output JSON only.";
      const userPrompt = fillTemplate(userTemplate, vars);

      const { text: rawText } = await llmChatComplete({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.4,
        max_tokens: 2800,
      });

      let wrapper = safeJsonParse(rawText);
      let v = validateLessonWrapper(wrapper);

      if (!v.ok) {
        const errText = formatAjvErrors(v.errors);
        const repaired = await repairWithLlm({
          systemPrompt:
            "You repair and normalize lesson JSON. Return a single JSON object only. No markdown. No commentary.",
          userPrompt: `The JSON does not match required minimum fields.\n\nValidation errors:\n${errText}\n\nOriginal JSON/text:\n${rawText}\n\nRules:\n- Must be valid JSON object\n- Must include objective (string) and explanation (string)\n- If activities is present, each item should have type, phase, and prompt/question\n- If quiz is present, each item should include question, options, answer, explanation\n\nReturn the repaired JSON object only.`,
        });

        wrapper = repaired;
        v = validateLessonWrapper(wrapper);
      }

      if (!v.ok) {
        await admin
          .from("lesson_generation_jobs")
          .update({
            status: "failed",
            validation_errors: v.errors || [],
            last_error: "Validation failed after repair",
            error_message: "Validation failed after repair",
            updated_at: new Date().toISOString(),
          })
          .eq("id", job.id);
        failedCount += 1;
        continue;
      }

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

      // Normalize into lesson_content_items for the app UI
      const contentItems = buildContentItems(wrapper);
      const inserted = await upsertContentItems({ admin, edition_id, items: contentItems });

      // Load image specs for this job's image_pack once
      const specByType = {};
      if (job.image_pack) {
        const { data: specs } = await admin
          .from("lesson_image_specs")
          .select("*")
          .eq("image_pack", job.image_pack);
        (specs || []).forEach((s) => {
          if (s?.image_type) specByType[String(s.image_type)] = s;
        });
      }

      // Create asset queue
      let assetCount = 0;
      const requests = extractAssetRequests({ job, wrapper, specByType });

      // Choose a sensible default content target for hero-type assets
      const defaultTargetContentId =
        inserted?.[0]?.content_id ||
        (inserted && inserted.length > 0 ? inserted[0].content_id : null);

      for (const req2 of requests) {
        const image_type = String(req2.image_type);
        const isHero = /hero|cover|hook/i.test(image_type) || /hero|cover|hook/i.test(req2.usage || "");
        const target_content_id = isHero ? defaultTargetContentId : null;

        const payload = {
          job_id: job.job_id,
          edition_id,
          image_pack: job.image_pack || null,
          image_type,
          usage: req2.usage || image_type,
          target_content_id,
          comfyui_workflow: req2.workflow || "basic_text2img",
          prompt: String(req2.prompt || ""),
          negative_prompt: req2.negative_prompt ? String(req2.negative_prompt) : "",
          width: req2.width ?? 1024,
          height: req2.height ?? 1024,
          steps: req2.steps ?? 28,
          cfg_scale: req2.cfg_scale ?? 5.5,
          sampler: req2.sampler ?? null,
          scheduler: req2.scheduler ?? null,
          status: "queued",
          attempts: 0,
          last_error: null,
          updated_at: new Date().toISOString(),
        };

        const { error: aErr } = await admin.from("lesson_asset_jobs").insert(payload);
        if (aErr) throw new Error(`Asset job insert failed: ${aErr.message}`);
        assetCount += 1;
      }

      await admin
        .from("lesson_generation_jobs")
        .update({
          status: "completed",
          supabase_lesson_id: edition_id,
          image_status: assetCount > 0 ? "queued" : "none",
          validation_errors: [],
          last_error: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.id);

      okCount += 1;
    } catch (e) {
      failedCount += 1;
      try {
        await admin
          .from("lesson_generation_jobs")
          .update({
            status: "failed",
            last_error: e?.message || "Failed",
            error_message: e?.message || "Failed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", job.id);
      } catch {}
    }
  }

  return NextResponse.json({ ok: true, processed: jobs.length, ok: okCount, failed: failedCount });
}
