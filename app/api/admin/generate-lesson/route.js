import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import crypto from "crypto";

export const maxDuration = 120;
export const dynamic = 'force-dynamic';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// --- MASTER LEARNING DESIGNER PROMPT (v2.0) ---

const SYSTEM_PROMPT = `Act as a Senior Learning Designer and Data Architect for "SmartKidz," an Australian K-6 EdTech platform.

**OBJECTIVE:**
Generate a rich, curriculum-aligned lesson JSON object with high engagement mechanics, pedagogical depth, and specific feedback logic.

**CRITICAL RULES:**
1. **Output:** Valid JSON only. Start with { and end with }. No markdown fences, no preamble.
2. **Locale:** en-AU (British spelling: colour, maths, centimetre, litre). Currency: AUD ($). Units: Metric. Use culturally relevant examples (e.g., vegemit toast, gumtrees, cricket).
3. **Curriculum:** Align strictly with ACARA (Australian Curriculum) standards.
4. **Structure:** You MUST generate EXACTLY 10 questions in the 'questions' array.

**JSON SCHEMA:**
{
  "title": "Lesson Title",
  "learning_objectives": ["string"],
  "curriculum_alignment": {
    "standard": "ACARA",
    "competency_tag": "string",
    "year_level": "integer"
  },
  "lesson_intro": {
    "narrative_setup": { 
      "text": "The story hook...", 
      "voiceover_intro_path": "string",
      "mascot_greeting_anim": "wave|excited|curious" 
    },
    "concept_primer": { "text": "1-sentence rule reminder" }
  },
  "engagement": {
    "gamification": {
      "xp_yield": 150,
      "currency_reward": 50,
      "badge_unlock_criteria": "perfect_score",
      "streak_bonus": true
    },
    "pacing_plan": {
      "warmup_indices": [1, 2],
      "core_indices": [3, 4, 5, 6],
      "challenge_indices": [7, 8, 9, 10]
    }
  },
  "questions": [
    {
      "question_index": 1,
      "question_format": "multiple_choice", // or 'fill_blank'
      "question": "Question text...",
      "tts_override_string": "Audio version if different (e.g. 'three quarters' for 3/4)",
      "story_context": "Help the astronaut count the stars...",
      "options": ["A", "B", "C"],
      "answer": "A",
      "explanation": "Why A is correct (encouraging tone)...",
      "hint_progressive": ["Hint 1 (General)", "Hint 2 (Specific)"],
      "distractors": [
        { "text": "B", "misconception": "Added instead of multiplied", "feedback": "Did you add? Try multiplying." },
        { "text": "C", "misconception": "Guess", "feedback": "Look at the diagram again." }
      ],
      "visual_aid": {
        "description": "Image prompt description for this specific question...",
        "asset_type": "illustration"
      },
      "pedagogy": {
        "cognitive_level": "application", // recall, application, conceptual_understanding
        "difficulty": 0.5
      },
      "gamification": { "xp": 10 }
    }
    // ... MUST HAVE 10 ITEMS ...
  ],
  "lesson_outro": {
    "performance_narrative": "You conquered the fractions!",
    "growth_mindset_tip": "Mistakes help your brain grow.",
    "celebration_animation_id": "confetti_burst"
  },
  "asset_plan": {
    "assets": [
      { "asset_type": "hero_image", "prompt": "Main lesson visual..." },
      { "asset_type": "sticker", "prompt": "Reward sticker..." }
    ]
  }
}

**PEDAGOGY & DESIGN GUIDELINES:**
- **Smart Distractors:** Do not generate random wrong answers. Create "plausible distractors" that reveal specific misconceptions.
- **Scaffolding:** Use 'hint_progressive' to guide, not give answers.
- **Emotion & Tone:** Encouraging, warm, 'positive' emotional valence.
- **Accessibility:** Use 'tts_override_string' for mathematical notation or complex words.

Generate the full lesson now.`;

function buildUserPrompt(vars) {
  return `Create a lesson for:
Subject: ${vars.subject}
Year: ${vars.year_level}
Topic: ${vars.topic}
Subtopic: ${vars.subtopic}
Strand: ${vars.strand}

Target Duration: ${vars.duration_target} minutes.
Difficulty: ${vars.difficulty_band}.

Ensure EXACTLY 10 questions are included.`;
}

// --- Helpers ---

function slugify(s) { return (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 80); }
function uid(prefix) { return `${prefix}_${crypto.randomBytes(4).toString("hex")}`; }

function getPhaseForIndex(idx, pacing) {
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
      temperature: 0.4, // Slightly higher for creativity in distractors
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
      content_json: { 
         prompt: jsonContent.lesson_intro.narrative_setup.text, 
         ...jsonContent.lesson_intro 
      }
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
      content_json: { 
         prompt: jsonContent.lesson_outro.performance_summary.text, 
         ...jsonContent.lesson_outro 
      }
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