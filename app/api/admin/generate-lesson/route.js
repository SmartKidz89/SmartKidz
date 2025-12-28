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

const TEXT_MODEL = process.env.OPENAI_TEXT_MODEL || "gpt-4-turbo-preview"; // Using turbo-preview as fallback for 4.1
const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || "dall-e-3";

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 80);
}

function uid(prefix) {
  return `${prefix}_${crypto.randomBytes(5).toString("hex")}`;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
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
      duration_minutes: { type: "integer", minimum: 15, maximum: 30 },
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
        minItems: 4,
        items: {
          type: "object",
          required: ["id", "type", "title", "prompt"],
          properties: {
            id: { type: "string" },
            type: { type: "string" },
            title: { type: "string" },
            prompt: { type: "string" },
            expected_seconds: { type: "integer" },
            media_refs: { type: "array", items: { type: "string" } },
            hint_ladder: { type: "array", items: { type: "string" } }
          }
        }
      }
    }
  };
}

// ---------- Activity Pacing ----------
function buildActivityPlan(targetMinutes) {
  const targetSeconds = targetMinutes * 60;
  // Simplified plan for faster generation in Vercel timeout limits
  const plan = [
    { type: "visual_observe", seconds: 90 },
    { type: "count_and_type", seconds: 120 },
    { type: "fill_in_sequence", seconds: 180 },
    { type: "real_world_task", seconds: 240 },
    { type: "reflection", seconds: 180 }
  ];
  return { plan, expectedSeconds: 810, targetSeconds };
}

// ---------- LLM Helpers ----------
async function llmJson(openai, { system, user, temperature = 0.6 }) {
  const resp = await openai.chat.completions.create({
    model: TEXT_MODEL,
    temperature,
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

// ---------- Image Gen ----------
async function generateImageBase64(openai, prompt, size) {
  const img = await openai.images.generate({
    model: IMAGE_MODEL,
    prompt: prompt,
    size: "1024x1024", // Standardize for DALL-E 3
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
    
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const sg = styleGuide({ locale });
    const { plan, expectedSeconds } = buildActivityPlan(duration);
    const lessonId = `${slugify(subject)}_${slugify(topic)}_y${year}_${uid("l")}`;

    // 1. Generate JSON
    const system = [
      "You are an expert primary education lesson designer.",
      "Output valid JSON only.",
      "Activities MUST match the pacing_plan types.",
      "Include hint ladders and common mistakes.",
      "Generate media_requests for: cover, hero_scene, and 2 activity_visuals.",
      "No embedded text inside images."
    ].join(" ");

    const userPayload = {
      lesson_id: lessonId,
      locale,
      year_level: Number(year),
      subject,
      topic,
      target_duration_minutes: duration,
      pacing_plan: plan,
      style_guide: sg
    };

    let lesson = await llmJson(openai, { system, user: userPayload, temperature: 0.7 });

    // Validate
    const ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(ajv);
    const validate = ajv.compile(buildLessonJsonSchema());
    if (!validate(lesson)) {
      // Simple repair attempt or fail. For this endpoint, we'll try to patch critical fields.
      console.warn("Validation errors:", validate.errors);
      lesson.lesson_id = lessonId; // Force correct ID
    }

    lesson.lesson_id = lessonId;
    lesson.year_level = Number(year);
    lesson.subject_id = subject;
    lesson.topic = topic;
    
    // 2. Generate Media (Limited to 2 images to save time/cost in this interactive mode)
    const requests = (lesson.media_requests || []).filter(r => ["cover", "hero_scene"].includes(r.purpose)).slice(0, 2);
    const assets = [];

    const limit = pLimit(IMAGE_CONCURRENCY);
    const generatedImages = await Promise.all(requests.map(req => limit(async () => {
       try {
         const stylePrompt = baseImageStylePrompt(sg, locale, subject, topic, year);
         const fullPrompt = `${stylePrompt} Scene: ${req.prompt}`;
         const b64 = await generateImageBase64(openai, fullPrompt, req.size);
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
            storage_path: filepath
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