import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import pLimit from "p-limit";
import crypto from "crypto";

export const maxDuration = 60; // Allow up to 60s on Vercel Hobby/Pro

// Env checks
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const SUPABASE_STORAGE_BUCKET = "lesson-assets";
const SUPABASE_TABLE = "lessons";
const IMAGE_CONCURRENCY = 2;

const TEXT_MODEL = process.env.OPENAI_TEXT_MODEL || "gpt-4-turbo-preview"; 
const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || "dall-e-3";

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const limit = pLimit(IMAGE_CONCURRENCY);

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 80);
}

function uid(prefix) {
  return `${prefix}_${crypto.randomBytes(5).toString("hex")}`;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function nowIso() {
  return new Date().toISOString();
}

// ---------- Curriculum Standards Map ----------
function getCurriculumStandard(locale) {
  const l = (locale || "").toLowerCase();
  if (l.includes("australia") || l.includes("au")) return "Australian Curriculum (AC9) Version 9.0";
  if (l.includes("united states") || l.includes("usa") || l.includes("us")) return "Common Core State Standards (CCSS) & NGSS";
  if (l.includes("united kingdom") || l.includes("uk") || l.includes("england")) return "UK National Curriculum";
  if (l.includes("canada")) return "Canadian Provincial Standards (Ontario/BC aligned)";
  if (l.includes("india")) return "CBSE / ICSE Standards";
  if (l.includes("singapore")) return "Singapore MOE Syllabus";
  return "International Standard (Rigorous Academic)";
}

// ---------- Style guide ----------
function styleGuide({ locale }) {
  return {
    brand: "SmartKidz",
    art_style_id: "premium_flat_3d_kids_v1",
    palette: "warm_pastel_high_contrast_accents",
    character_pack: (locale || "").toLowerCase().includes("australia") ? "koala_kids_v1" : "friendly_kids_v1",
    typography: "rounded_sans",
    accessibility: { min_contrast: "AA", dyslexia_friendly: true, avoid_text_in_images: true },
    illustration_rules: [
      "Premium kids educational illustration. Soft gradients, subtle texture, high-quality shading.",
      "Consistent mascot character design across all images in the lesson.",
      "Minimal clutter, large countable objects, strong focal point, ample blank space for overlays/drawing.",
      "No embedded text or labels inside the image; app overlays handle text.",
      "Friendly classroom or home learning vibe. Clean composition."
    ]
  };
}

function baseImageStylePrompt(sg, locale, subject, topic, year) {
  return [
    ...sg.illustration_rules,
    `Locale: ${locale}. Subject: ${subject}. Topic: ${topic}. Year level: ${year}.`,
    `Mascot/character pack: ${sg.character_pack}. Palette: ${sg.palette}.`,
    "No text, no labels, no numbers embedded as labels."
  ].join(" ");
}

// ---------- JSON Schema ----------
function buildLessonJsonSchema() {
  return {
    type: "object",
    required: ["lesson_id", "duration_minutes", "objective", "explanation", "real_world_application", "memory_strategies", "worked_example", "scenarios", "style_guide", "media_requests", "activities"],
    additionalProperties: true,
    properties: {
      lesson_id: { type: "string" },
      title: { type: "string" },
      duration_minutes: { type: "integer", minimum: 15, maximum: 45 },
      objective: { type: "string", minLength: 5 },
      explanation: { type: "string", minLength: 10 },
      real_world_application: { type: "string", minLength: 5 },
      memory_strategies: { type: "array", items: { type: "string" }, minItems: 2 },
      worked_example: { type: "string", minLength: 10 },
      scenarios: {
        type: "array",
        minItems: 1,
        items: {
          type: "object",
          required: ["context", "questions"],
          properties: {
            context: { type: "string" },
            questions: {
              type: "array",
              minItems: 1,
              items: {
                type: "object",
                required: ["prompt", "answer"],
                properties: { prompt: { type: "string" }, answer: { type: "string" } }
              }
            }
          }
        }
      },
      style_guide: { type: "object" },
      media_requests: {
        type: "array",
        minItems: 4, // Relaxed min for faster gen, but system prompt asks for more
        items: {
          type: "object",
          required: ["asset_id", "purpose", "size", "prompt"],
          properties: {
            asset_id: { type: "string" },
            purpose: { type: "string" },
            size: { type: "object", properties: { w: { type: "integer" }, h: { type: "integer" } } },
            prompt: { type: "string" }
          }
        }
      },
      activities: {
        type: "array",
        minItems: 3,
        items: {
          type: "object",
          required: ["id", "type", "title", "prompt", "expected_seconds", "media_refs", "input", "answer_key"],
          properties: {
            id: { type: "string" },
            type: {
              type: "string",
              enum: [
                "visual_observe",
                "count_and_type",
                "draw_circle",
                "trace_write",
                "fill_in_sequence",
                "order_numbers",
                "real_world_task",
                "explain_strategy",
                "reflection"
              ]
            },
            title: { type: "string" },
            prompt: { type: "string" },
            expected_seconds: { type: "integer", minimum: 30, maximum: 600 },
            media_refs: { type: "array", items: { type: "string" } },
            input: {
              type: "object",
              required: ["kind"],
              properties: {
                kind: {
                  type: "string",
                  enum: [
                    "numeric_entry", // User must type a number
                    "free_text",     // User must type a sentence/phrase
                    "drag_reorder",  // User must order items
                    "drawing_canvas" // User must draw
                  ]
                }
              },
              additionalProperties: true
            },
            answer_key: { type: "object", properties: { correct_answer: { type: "string" } } },
            hint_ladder: { type: "array", items: { type: "string" } },
            common_mistakes: { type: "array", items: { type: "string" } }
          },
          additionalProperties: true
        }
      }
    }
  };
}

// ---------- Activity Pacing (Input Heavy) ----------
function buildActivityPlan(targetMinutes) {
  const targetSeconds = targetMinutes * 60;
  
  // Enforce INPUT-HEAVY activities. Banning 'visual_observe' from the core loop unless strictly needed.
  const base = [
    { type: "count_and_type", seconds: 120 }, // Numeric input
    { type: "fill_in_sequence", seconds: 180 }, // Logic/Pattern input
    { type: "real_world_task", seconds: 240 }, // Application
    { type: "reflection", seconds: 180 }      // Metacognition (text input)
  ];

  let plan = [...base];
  let total = plan.reduce((s, a) => s + a.seconds, 0);

  // Fill remaining time with high-value practice
  while (total < targetSeconds - 120) {
    plan.splice(plan.length - 2, 0, { type: "fill_in_sequence", seconds: 150 });
    total = plan.reduce((s, a) => s + a.seconds, 0);
    if (plan.length > 10) break;
  }

  return { plan, expectedSeconds: total, targetSeconds };
}

// ---------- LLM Helpers ----------
async function llmJson({ system, user, temperature = 0.5 }) {
  const resp = await openai.chat.completions.create({
    model: TEXT_MODEL,
    temperature, // Lower temp for strict instruction following
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: JSON.stringify(user) }
    ]
  });

  const text = resp.choices?.[0]?.message?.content;
  if (!text) throw new Error("LLM returned empty content");
  return JSON.parse(text);
}

async function generateLessonPlan({ topic, year, subject, locale, targetMinutes, lessonId, sg, plan }) {
  const standard = getCurriculumStandard(locale);
  
  const system = [
    `You are a strict curriculum designer aligned to: ${standard}.`,
    `Year Level: ${year}. Subject: ${subject}. Topic: ${topic}.`,
    "PEDAGOGY RULES:",
    "1. NO MULTIPLE CHOICE. All activities must require active input (typing numbers, writing words, sorting).",
    "2. NO GUESSING. Students must solve the problem.",
    "3. Strict Curriculum Alignment. Ensure the content matches the specific Year Level standards for the region.",
    "4. Output valid JSON matching the schema strictly.",
    "5. Activities must match the pacing_plan types provided.",
    "6. Include 'answer_key' for every question so the system can validate the input."
  ].join(" ");

  const user = {
    lesson_id: lessonId,
    locale,
    year_level: Number(year),
    subject,
    topic,
    target_duration_minutes: targetMinutes,
    pacing_plan: plan,
    style_guide: sg
  };

  return llmJson({ system, user, temperature: 0.4 });
}

// ---------- Image Gen ----------
async function generateImageBase64(prompt, size) {
  const img = await openai.images.generate({
    model: IMAGE_MODEL,
    prompt: prompt,
    size: "1024x1024", 
    response_format: "b64_json",
    quality: "standard"
  });
  return img.data?.[0]?.b64_json;
}

// ---------- Main Handler ----------
export async function POST(req) {
  try {
    if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Server misconfigured: missing keys." }, { status: 500 });
    }

    const { topic, year, subject, locale = "Australia", duration = 15 } = await req.json();
    
    const sg = styleGuide({ locale });
    const { plan, expectedSeconds } = buildActivityPlan(duration);
    const lessonId = `${slugify(subject)}_${slugify(topic)}_y${year}_${uid("l")}`;

    // 1. Generate JSON
    let lesson = await generateLessonPlan({
      topic, year, subject, locale, targetMinutes: duration, lessonId, sg, plan
    });

    // Validations & Patches
    lesson.lesson_id = lessonId;
    lesson.year_level = Number(year);
    lesson.subject_id = subject;
    lesson.topic = topic;
    lesson.country = (locale.slice(0, 2).toUpperCase() === "UK") ? "GB" : locale.slice(0, 2).toUpperCase(); // Simple map, refine if needed

    // 2. Generate Media
    // We only generate 2 images to stay fast, but requests object asks for more. We pick the top 2.
    const mediaRequests = (lesson.media_requests || []).slice(0, 2);
    const assets = [];

    const generatedImages = await Promise.all(mediaRequests.map(req => limit(async () => {
       try {
         const stylePrompt = baseImageStylePrompt(sg, locale, subject, topic, year);
         const fullPrompt = `${stylePrompt} Scene: ${req.prompt}`;
         const b64 = await generateImageBase64(fullPrompt, req.size);
         const buffer = Buffer.from(b64, "base64");
         const filepath = `lessons/${lessonId}/${req.asset_id}.png`;
         
         await supabase.storage.from(SUPABASE_STORAGE_BUCKET).upload(filepath, buffer, {
            contentType: "image/png",
            upsert: true
         });
         
         const { data: pub } = supabase.storage.from(SUPABASE_STORAGE_BUCKET).getPublicUrl(filepath);
         
         return {
            asset_id: req.asset_id,
            purpose: req.purpose,
            public_url: pub.publicUrl,
            storage_path: filepath,
            // Mocking variants for now to fit schema
            variants: [{ public_url: pub.publicUrl, w: 1024, h: 1024 }] 
         };
       } catch (e) {
         console.error("Image gen failed", e);
         return null;
       }
    })));

    lesson.media = { assets: generatedImages.filter(Boolean) };

    // 3. Upsert to DB
    const row = {
      id: lessonId,
      title: lesson.title || topic,
      year_level: Number(year),
      subject_id: subject,
      topic: topic,
      content_json: lesson,
      country: lesson.country || "AU", // Store country for filtering
      updated_at: new Date().toISOString()
    };
    
    const { error: dbError } = await supabase.from(SUPABASE_TABLE).upsert(row);
    if (dbError) throw dbError;

    return NextResponse.json({ ok: true, lessonId, title: row.title });

  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message || "Generation failed" }, { status: 500 });
  }
}