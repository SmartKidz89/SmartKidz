import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import crypto from "crypto";

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// --- Prompt Contract & Templates ---

const SYSTEM_PROMPT = `
You are a Senior Learning Designer and Software/Data Architect for SmartKidz (Australian K–6).
Non-negotiables:
- Output ONLY valid JSON that conforms to SmartKidz Lesson Schema v1. No markdown, no commentary.
- en-AU localisation, British spelling, metric units, AUD where relevant.
- Constructed-response learning: typed answers are primary; handwriting fallback only when symbol-heavy or not keyboardable.
- No mascots, no characters, no roleplay voices, no dialogue, no anthropomorphism.
- Pedagogy: 1 primary micro-skill across all 10 questions; up to 2 supporting micro-skills only when helpful.
- Always include a short “why this is correct”. Wrong-answer feedback must be misconception-targeted and include one corrective step + one actionable next step.
- Include 1–2 worked examples as first-class objects.
- Hard anti-generic rules:
  * Vary representations and formats across the 10 questions.
  * Include at least one reasoning item and one transfer item when year band allows.
  * No repeated question skeletons; avoid generic stems and filler phrasing.
- Continuation rules: Continuation ONLY inside the current unit. If unit changes, it is a fresh start.
- Asset plan: exactly 2 diagrams + 1 abstract sticker (no characters). Include ComfyUI parameters and strong negative prompts (no people, no mascots, no logos, no watermarks, no text artifacts).
Before finalising, internally verify: schema validity, 10 questions, variety targets, and no banned contexts. Output the JSON only.
`;

function buildUserPrompt(vars) {
  return `
Generate ONE lesson JSON.

Job:
- job_id: ${vars.job_id}
- lesson_id: ${vars.lesson_id}
- subject: ${vars.subject}
- year_level: ${vars.year_level}
- strand/topic/subtopic: ${vars.strand} / ${vars.topic} / ${vars.subtopic}
- difficulty_band: ${vars.difficulty_band || "secure"}
- estimated_duration_minutes target: 15

Year band constraints:
- band: ${vars.band}
- language_complexity: simple
- max_reasoning_steps: 2
- representation_preferences: ["diagram", "number_line"]

Mastery model:
- primary_micro_skill: ${vars.topic}_core
- mastery_band: secure
- mastery_score: 0.8

Lesson design constraints:
- arc_template: concept_build
- Enforce variety across the 10 questions: at least 2 representation shifts, at least 3 question formats.

Continuation:
- mode: fresh_start
- unit: unit_id=u_${vars.job_id}, unit_title=${vars.topic}, lesson_index_in_unit=1, lessons_in_unit_total=5

ComfyUI assets:
- Must output asset_plan with EXACTLY 3 assets: 2 diagrams + 1 abstract sticker icon.
- Diagram types must match the subject.
- Negative prompt MUST include: people, person, face, character, mascot, cartoon character, anthropomorphic, logo, watermark, brand, text artifacts.

Safety bans:
No brands/ads, gambling, alcohol/drugs, weapons/violence, sexual content, political persuasion, religion as doctrine, real tragedies/disasters, medical/mental-health advice contexts, stereotypes.

Return JSON only.
`;
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

function getBand(year) {
  const y = Number(year);
  if (y <= 1) return "Prep-Y1";
  if (y <= 3) return "Y2-Y3";
  if (y === 4) return "Y4";
  return "Y5-Y6";
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
    
    const promptVars = {
      job_id,
      lesson_id,
      subject,
      year_level: `Year ${year}`,
      strand: strand || "General",
      topic,
      subtopic: subtopic || topic,
      band: getBand(year)
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
    await supabase.from("content_item_pedagogy").delete().eq("content_id", edition_id); // This query is usually prefix-based but we'll skip complex cleanup for MVP

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
        type: q.question_format === "multiple_choice" ? "multiple_choice" : "fill_blank", // Simplified mapping
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