import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import crypto from "crypto";

export const maxDuration = 120; // Increased timeout for longer generations
export const dynamic = 'force-dynamic';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// --- MASTER BUNDLE PROMPTS (v1.8.0) ---

const SYSTEM_PROMPT = `You are a Senior Learning Designer for SmartKidz (Australian K–6).

**CRITICAL OUTPUT RULE: JSON ONLY.** 
Do not write "Here is the lesson". Start with { and end with }.

**STRUCTURE REQUIREMENT:**
You MUST generate a JSON object with this EXACT structure. Do not omit the 'questions' array.

{
  "title": "Lesson Title",
  "lesson_intro": {
    "narrative_setup": { "text": "Hook text..." }
  },
  "learning_objectives": [ ... ],
  "engagement": { "pacing_plan": { ... } },
  "questions": [
    // YOU MUST GENERATE EXACTLY 10 QUESTION OBJECTS HERE.
    // Index 1 to 10.
    {
      "question_index": 1,
      "question_format": "multiple_choice",
      "question": "Question text...",
      "options": ["A", "B", "C"],
      "answer": "A",
      "explanation": "Why A is correct...",
      "gamification": { "xp": 10 }
    },
    ...
  ],
  "lesson_outro": {
    "performance_summary": { "text": "Great job!" }
  },
  "asset_plan": {
    "assets": [
      { "asset_type": "illustration", "prompt": "Diagram 1..." },
      { "asset_type": "illustration", "prompt": "Diagram 2..." },
      { "asset_type": "sticker", "prompt": "Icon..." }
    ]
  }
}

**CONTENT RULES:**
- **Locale:** en-AU (Maths, colour, realise).
- **Questions:** 10 distinct questions. Mix of 'multiple_choice' and 'fill_blank'.
- **Feedback:** 'explanation' must be helpful and encouraging.
- **Assets:** Exactly 3 assets in asset_plan.
- **Tone:** Encouraging, clear, no mascots/dialogue in text.

Generate the full lesson now.`;

function buildUserPrompt(vars) {
  // Simplified user prompt to reduce token noise
  return `Create a lesson for:
Subject: ${vars.subject}
Year: ${vars.year_level}
Topic: ${vars.topic}
Subtopic: ${vars.subtopic}
Strand: ${vars.strand}

Target Duration: ${vars.duration_target} minutes.
Difficulty: ${vars.difficulty_band}.

Ensure 10 questions are included in the 'questions' array.`;
}

// --- Helpers ---

function slugify(s) { return (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 80); }
function uid(prefix) { return `${prefix}_${crypto.randomBytes(4).toString("hex")}`; }

function getPhaseForIndex(idx, pacing) {
  // Simple fallback if pacing is missing
  if (!pacing) {
    if (idx <= 2) return "hook";
    if (idx <= 6) return "guided_practice";
    return "independent_practice";
  }
  if (pacing?.warmup_indices?.includes(idx)) return "hook";
  if (pacing?.core_indices?.includes(idx)) return "guided_practice";
  if (pacing?.challenge_indices?.includes(idx)) return "independent_practice";
  if (pacing?.reflect_indices?.includes(idx)) return "challenge";
  return "independent_practice";
}

function getSubjectCode(subject) {
  const map = {
    "Mathematics": "MATH", "English": "ENG", "Science": "SCI",
    "HASS": "HASS", "Technologies": "TECH", "The Arts": "ART", "Health and Physical Education": "HPE"
  };
  return map[subject] || "GEN";
}

// --- Main Handler ---

export async function POST(req) {
  try {
    const body = await req.json();
    const { 
      topic, year, subject, subtopic, strand, 
      llmUrl, llmModel, llmKey
    } = body;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const openai = new OpenAI({
      baseURL: llmUrl || process.env.LLM_BASE_URL || process.env.OPENAI_BASE_URL,
      apiKey: llmKey || process.env.LLM_API_KEY || process.env.OPENAI_API_KEY || "local",
    });
    
    const model = llmModel || process.env.LLM_MODEL || process.env.OPENAI_MODEL || "gpt-4o";

    const job_id = uid("job");
    const lesson_id = `${getSubjectCode(subject)}_Y${year}_${slugify(topic)}`;
    
    const promptVars = {
      subject,
      year_level: year,
      strand: strand || "General",
      topic,
      subtopic: subtopic || topic,
      difficulty_band: "standard",
      duration_target: 15
    };

    const userPrompt = buildUserPrompt(promptVars);

    console.log(`[Generate] Generating lesson ${lesson_id} using ${model}...`);
    
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3,
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

    // Validation / Fixes
    if (!jsonContent.questions || !Array.isArray(jsonContent.questions)) {
       jsonContent.questions = [];
    }
    
    // Ensure we have at least Intro/Outro if questions failed
    if (!jsonContent.lesson_intro) jsonContent.lesson_intro = { narrative_setup: { text: `Welcome to ${topic}` } };
    if (!jsonContent.lesson_outro) jsonContent.lesson_outro = { performance_summary: { text: "Lesson complete." } };

    // Save to DB
    const now = new Date().toISOString();
    
    const templateRow = {
      template_id: lesson_id,
      subject_id: getSubjectCode(subject),
      year_level: Number(year),
      title: jsonContent.title || topic,
      topic: topic,
      canonical_tags: [strand, subtopic].filter(Boolean),
      created_at: now,
      updated_at: now
    };
    
    const { error: tplErr } = await supabase.from("lesson_templates").upsert(templateRow, { onConflict: "template_id" });
    if (tplErr) throw new Error(`Template save failed: ${tplErr.message}`);

    const edition_id = `${lesson_id}_AU`;
    const editionRow = {
      edition_id,
      template_id: lesson_id,
      country_code: "AU",
      locale_code: "en-AU",
      curriculum_id: "AC9",
      title: templateRow.title,
      wrapper_json: jsonContent,
      created_at: now,
      updated_at: now
    };

    const { error: edErr } = await supabase.from("lesson_editions").upsert(editionRow, { onConflict: "edition_id" });
    if (edErr) throw new Error(`Edition save failed: ${edErr.message}`);

    // Flatten to content_items
    await supabase.from("lesson_content_items").delete().eq("edition_id", edition_id);
    
    const contentItems = [];
    const questions = jsonContent.questions;
    
    // 1. Intro
    contentItems.push({
      content_id: `${edition_id}_intro`,
      edition_id,
      activity_order: 0,
      phase: "hook",
      type: "learn",
      title: "Introduction",
      content_json: { prompt: jsonContent.lesson_intro.narrative_setup.text, ...jsonContent.lesson_intro }
    });

    // 2. Questions
    questions.forEach((q, i) => {
      contentItems.push({
        content_id: `${edition_id}_q${i + 1}`,
        edition_id,
        activity_order: i + 1,
        phase: getPhaseForIndex(i + 1, jsonContent.engagement?.pacing_plan),
        type: q.question_format === "multiple_choice" ? "multiple_choice" : "fill_blank",
        title: `Question ${i + 1}`,
        content_json: q
      });
    });

    // 3. Outro
    contentItems.push({
      content_id: `${edition_id}_outro`,
      edition_id,
      activity_order: 99,
      phase: "challenge",
      type: "learn",
      title: "Summary",
      content_json: { prompt: jsonContent.lesson_outro.performance_summary.text, ...jsonContent.lesson_outro }
    });

    if (contentItems.length) {
       await supabase.from("lesson_content_items").insert(contentItems);
    }

    // Queue Assets
    const assetPlan = jsonContent.asset_plan?.assets || [];
    const assetJobs = assetPlan.map((a, i) => ({
      job_id,
      edition_id,
      image_type: a.asset_type || "illustration",
      prompt: a.prompt,
      negative_prompt: a.negative_prompt,
      comfyui_workflow: "basic_text2img",
      status: "queued",
      // Associate first asset with intro, others with questions? 
      // Simple logic: first is intro, last is outro, middle random.
      target_content_id: i === 0 ? `${edition_id}_intro` : null 
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