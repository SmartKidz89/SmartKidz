import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import crypto from "crypto";

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// --- MASTER BUNDLE PROMPTS (v1.7.0) ---

const SYSTEM_PROMPT = `You are a Senior Learning Designer and Software/Data Architect for SmartKidz (Australian K–6).

NON-NEGOTIABLE OUTPUT CONTRACT
- Output ONLY valid JSON that conforms to SmartKidz Lesson Schema v1.7.0.
- No markdown. No commentary.
- The entire response must be the lesson object (no wrapper keys).

LOCALISATION
- locale: en-AU, British spelling, metric units, AUD where relevant.

PEDAGOGY
- Constructed-response learning: typed answers are primary; handwriting fallback only when symbol-heavy or not keyboardable.
- No mascots, no characters, no roleplay voices, no dialogue, no anthropomorphism.
- One (1) primary micro-skill across all 10 questions; up to two (2) supporting micro-skills only when helpful.
- Always include a short “why this is correct”. Wrong-answer feedback must be misconception-targeted and include one corrective step + one actionable next step.
- Include 1–2 worked examples as first-class objects and ensure at least one question references a worked example.

ANTI-GENERIC / VARIETY RULES
- Vary representations and formats across the 10 questions.
- Include at least one reasoning item and one transfer item when year band allows.
- No repeated question skeletons; avoid generic stems and filler phrasing.

CONTINUATION RULES
- Continuation ONLY inside the current unit. If unit changes, it is a fresh start.
- If continuation.mode=fresh_start then continuation.previous_lesson must be null.

ASSET PLAN RULES (ComfyUI)
- asset_plan.assets must contain EXACTLY 3 assets: 2 diagrams + 1 abstract sticker icon.
- Use subject-valid diagram image_type (per schema constraints).
- Negative prompt MUST include: people, person, face, character, mascot, anthropomorphic, logo, watermark, brand, text artifacts.

FINAL INTERNAL CHECK (DO NOT OUTPUT THIS CHECKLIST)
- Schema validity (v1.7.0) and required top-level keys present.
- Exactly 10 questions with unique question_index 1..10.
- Band constraints satisfied (duration, justify/explain for Y4+, transfer for Y5–Y6).
- Variety targets met (formats, representations, cognitive demand).
- Worked example referenced by at least one question.
- asset_plan correct (2 diagrams + 1 sticker) and safe negative_prompt tokens present.
- No banned contexts.

Return the JSON only.`;

const USER_TEMPLATE = `Generate ONE lesson JSON.

JOB
- job_id: {{job_id}}
- lesson_id: {{lesson_id}}
- subject: {{subject}}
- year_level: {{year_level}}
- strand/topic/subtopic: {{strand}} / {{topic}} / {{subtopic}}
- difficulty_band: {{difficulty_band}}
- estimated_duration_minutes target: {{duration_target}}

YEAR BAND CONSTRAINTS
- band: {{band}}
- language_complexity: {{language_complexity}}
- max_reasoning_steps: {{max_reasoning_steps}}
- representation_preferences: {{representation_preferences}}

MASTERY MODEL
- primary_micro_skill: {{primary_micro_skill}}
- supporting_micro_skills (max 2): {{supporting_micro_skills}}
- mastery_band: {{mastery_band}}
- mastery_score: {{mastery_score}}

OBJECTIVES (MANDATORY)
- Provide learning_objectives as: [{objective_id, descriptor, success_criteria[], evidence_types[]}]
- Use internal objective IDs (no ACARA codes).
- Populate alignment.internal_objective_map with objective_set_id and objective_ids that match learning_objectives.

LESSON DESIGN CONSTRAINTS
- arc_template: {{arc_template}} (must be one of: concept_build | fluency_mixed_review | problem_solving_reasoning)
- engagement.hook_type: {{hook_type}} (mission | investigation | build_and_test | simulation | case_file | puzzle_chain | studio_challenge)
- engagement.context_theme_id: {{context_theme_id}}
- engagement.ui_style_pack_id: {{ui_style_pack_id}}
- engagement.novelty_fingerprint: hook_id={{hook_id}}, representation_id={{representation_id}}, format_id={{format_id}}, demand_level={{demand_level}}, application_type_id={{application_type_id}}
- Enforce variety across the 10 questions: at least 2 representations, at least 3 question formats (2 for Prep–Y1), at least 2 cognitive demand levels (except where band allows simpler).

CONTINUATION
- mode: {{fresh_start_or_continuation}} (fresh_start | continuation)
- unit: unit_id={{unit_id}}, unit_title={{unit_title}}, lesson_index_in_unit={{unit_index}}, lessons_in_unit_total={{unit_total}}
- If continuation: include previous_lesson {lesson_id, recap_takeaways[], misconceptions_to_revisit[], mastery_snapshot{...}}, and ensure next_lesson_teaser connects logically.
- If fresh_start: continuation.previous_lesson must be null.

COMFYUI ASSETS (MUST OUTPUT asset_plan)
- EXACTLY 3 assets: 2 diagrams + 1 abstract sticker icon.
- Style consistent within the unit: asset_plan.style.unit_style_id={{unit_style_id}}, palette_ref={{palette_ref}}, diagram_style={{diagram_style}}, sticker_style={{sticker_style}}.
- comfyui_runtime: workflow_family={{workflow_family}}, checkpoint={{checkpoint}}, vae={{vae}}, loras={{loras}}.
- Subject-valid diagram image_type:
  * Mathematics: number_line | fraction_model | array_model | place_value_chart | bar_column_chart | pictograph | geometry_diagram | coordinate_grid | data_table_chart
  * HASS: map | timeline | source_card | infographic_blocks
  * Science: labelled_diagram | process_flow | data_table_chart | lifecycle_diagram
- Negative prompt MUST include: people, person, face, character, mascot, anthropomorphic, logo, watermark, brand, text artifacts.

QUALITY SIGNALS (OUTPUT REQUIRED)
- Populate quality_signals with schema-valid placeholder values (the downstream quality gate may overwrite):
  * uniqueness_hash: "pending"
  * semantic_checks.similarity_score_to_recent: 0
  * semantic_checks.question_skeleton_hashes: 10 placeholder 16-char strings
  * semantic_checks.repeated_phrasing_flags: []
  * semantic_checks.asset_prompt_safety_passed: true

RETURN JSON ONLY.`;

function buildUserPrompt(vars) {
  let prompt = USER_TEMPLATE;
  for (const [key, value] of Object.entries(vars)) {
    // Handle array-like strings or objects
    const valStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
    prompt = prompt.split(`{{${key}}}`).join(valStr);
  }
  return prompt;
}

// --- Helpers ---

function slugify(s) { return (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 80); }
function uid(prefix) { return `${prefix}_${crypto.randomBytes(4).toString("hex")}`; }

// Determine phase based on pacing plan indices
function getPhaseForIndex(idx, pacing) {
  if (pacing?.warmup_indices?.includes(idx)) return "hook";
  if (pacing?.core_indices?.includes(idx)) return "guided_practice";
  if (pacing?.challenge_indices?.includes(idx)) return "independent_practice";
  if (pacing?.reflect_indices?.includes(idx)) return "challenge";
  return "independent_practice"; // default
}

function getSubjectCode(subject) {
  const map = {
    "Mathematics": "MATH", "English": "ENG", "Science": "SCI",
    "HASS": "HASS", "Technologies": "TECH", "The Arts": "ART", "Health and Physical Education": "HPE"
  };
  return map[subject] || "GEN";
}

function getBandConfig(year) {
  const y = Number(year);
  if (y <= 1) return { band: "Prep-Y1", duration: 10, lang: "very_simple" };
  if (y <= 3) return { band: "Y2-Y3", duration: 15, lang: "simple" };
  if (y === 4) return { band: "Y4", duration: 20, lang: "moderate" };
  return { band: "Y5-Y6", duration: 30, lang: "advanced" };
}

// --- Main Handler ---

export async function POST(req) {
  try {
    const body = await req.json();
    const { 
      topic, year, subject, subtopic, strand, 
      llmUrl, llmModel, llmKey // Optional local overrides
    } = body;

    // 1. Setup Clients
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const openai = new OpenAI({
      baseURL: llmUrl || process.env.LLM_BASE_URL || process.env.OPENAI_BASE_URL,
      apiKey: llmKey || process.env.LLM_API_KEY || process.env.OPENAI_API_KEY || "local",
    });
    
    const model = llmModel || process.env.LLM_MODEL || process.env.OPENAI_MODEL || "gpt-4o";

    // 2. Prepare Context
    const job_id = uid("job");
    const lesson_id = `${getSubjectCode(subject)}_Y${year}_${slugify(topic)}`;
    const bandConfig = getBandConfig(year);
    
    // Fill all required variables from the new template with safe defaults
    const promptVars = {
      job_id,
      lesson_id,
      subject,
      year_level: `Year ${year}`,
      strand: strand || "General",
      topic,
      subtopic: subtopic || topic,
      difficulty_band: "secure",
      duration_target: bandConfig.duration,
      band: bandConfig.band,
      language_complexity: bandConfig.lang,
      max_reasoning_steps: 2,
      representation_preferences: ["diagram", "number_line"],
      
      // Mastery
      primary_micro_skill: `${slugify(topic)}_core`,
      supporting_micro_skills: "[]",
      mastery_band: "secure",
      mastery_score: 0.8,
      
      // Design
      arc_template: "concept_build",
      hook_type: "mission",
      context_theme_id: "default",
      ui_style_pack_id: "default",
      hook_id: "default_hook",
      representation_id: "default_rep",
      format_id: "default_fmt",
      demand_level: "apply",
      application_type_id: "default",
      
      // Continuation
      fresh_start_or_continuation: "fresh_start",
      unit_id: `u_${job_id}`,
      unit_title: topic,
      unit_index: 1,
      unit_total: 5,
      
      // Style / Comfy
      unit_style_id: "paper_cutout_v1",
      palette_ref: "vibrant_educational",
      diagram_style: "clean_vector",
      sticker_style: "flat_icon",
      workflow_family: "flux",
      checkpoint: "default",
      vae: "default",
      loras: "[]"
    };

    const userPrompt = buildUserPrompt(promptVars);

    // 3. Generate
    console.log(`[Generate] Generating lesson ${lesson_id} using ${model}...`);
    
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.2, // Low temp for schema adherence
      response_format: { type: "json_object" }
    });

    const rawContent = completion.choices[0].message.content;
    let jsonContent;
    try {
      jsonContent = JSON.parse(rawContent);
    } catch (e) {
      console.error("JSON Parse Error", rawContent);
      return NextResponse.json({ error: "LLM output invalid JSON", raw: rawContent }, { status: 500 });
    }

    // 4. Save Relational Data
    const now = new Date().toISOString();
    
    // A) Template
    const templateRow = {
      template_id: lesson_id,
      subject_id: getSubjectCode(subject),
      year_level: Number(year),
      title: jsonContent.lesson_intro?.narrative_setup?.text || topic,
      topic: topic,
      canonical_tags: [strand, subtopic].filter(Boolean),
      created_at: now,
      updated_at: now
    };
    
    const { error: tplErr } = await supabase.from("lesson_templates").upsert(templateRow, { onConflict: "template_id" });
    if (tplErr) throw new Error(`Template save failed: ${tplErr.message}`);

    // B) Edition (AU)
    const edition_id = `${lesson_id}_AU`;
    const editionRow = {
      edition_id,
      template_id: lesson_id,
      country_code: "AU",
      locale_code: "en-AU",
      curriculum_id: "AC9",
      title: templateRow.title,
      wrapper_json: jsonContent, // Store full generation as source of truth
      created_at: now,
      updated_at: now
    };

    const { error: edErr } = await supabase.from("lesson_editions").upsert(editionRow, { onConflict: "edition_id" });
    if (edErr) throw new Error(`Edition save failed: ${edErr.message}`);

    // C) Content Items (Questions -> Slides)
    const questions = jsonContent.questions || [];
    const pacing = jsonContent.engagement?.pacing_plan || {};
    
    // Clear old items for this edition
    await supabase.from("lesson_content_items").delete().eq("edition_id", edition_id);
    // Cleanup of pedagogy/gamification layers is implicit if using cascade, or can be done manually if needed.
    // For now we assume standard inserts.

    const contentItems = [];
    const pedagogyItems = [];
    const gamificationItems = [];

    // Intro Slide
    const introId = `${edition_id}_intro`;
    contentItems.push({
      content_id: introId,
      edition_id,
      activity_order: 0,
      phase: "hook",
      type: "learn",
      title: "Introduction",
      content_json: {
        prompt: jsonContent.lesson_intro?.narrative_setup?.text || "Welcome",
        ...jsonContent.lesson_intro
      }
    });

    // Questions
    questions.forEach((q) => {
      const idx = q.question_index;
      const cId = `${edition_id}_q${idx}`;
      const phase = getPhaseForIndex(idx, pacing);
      
      contentItems.push({
        content_id: cId,
        edition_id,
        activity_order: idx,
        phase,
        type: q.question_format === "multiple_choice" ? "multiple_choice" : "fill_blank", // Simplified mapping for app compat
        title: `Question ${idx}`,
        content_json: q
      });

      // Extract Layers
      if (q.feedback_model || q.scaffolding) {
        pedagogyItems.push({
          content_id: cId,
          pedagogy_json: { 
            feedback: q.feedback_model,
            scaffolding: q.scaffolding,
            objectives: jsonContent.learning_objectives 
          }
        });
      }

      if (q.gamification) {
        gamificationItems.push({
          content_id: cId,
          gamification_json: q.gamification
        });
      }
    });

    // Outro Slide
    const outroId = `${edition_id}_outro`;
    contentItems.push({
      content_id: outroId,
      edition_id,
      activity_order: 99,
      phase: "challenge",
      type: "learn",
      title: "Summary",
      content_json: {
        prompt: jsonContent.lesson_outro?.performance_summary?.text || "Great work!",
        ...jsonContent.lesson_outro
      }
    });

    // Bulk Insert
    if (contentItems.length) await supabase.from("lesson_content_items").insert(contentItems);
    if (pedagogyItems.length) await supabase.from("content_item_pedagogy").insert(pedagogyItems);
    if (gamificationItems.length) await supabase.from("content_item_gamification").insert(gamificationItems);

    // D) Assets (Queue them)
    // The schema provides an asset_plan with prompts. We can queue them for generation.
    const assetPlan = jsonContent.asset_plan?.assets || [];
    const assetJobs = assetPlan.map(a => ({
      job_id: job_id,
      edition_id,
      image_type: a.asset_type === "sticker" ? "sticker" : "illustration",
      prompt: a.prompt,
      negative_prompt: a.negative_prompt,
      comfyui_workflow: "basic_text2img",
      status: "queued",
      target_content_id: a.asset_type === "sticker" ? outroId : introId, // Simple heuristic for now
    }));

    if (assetJobs.length) {
      await supabase.from("lesson_asset_jobs").insert(assetJobs);
    }

    return NextResponse.json({ 
      ok: true, 
      lesson_id: edition_id,
      title: templateRow.title,
      questions: questions.length,
      assets_queued: assetJobs.length
    });

  } catch (e) {
    console.error("[Generate] Error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}