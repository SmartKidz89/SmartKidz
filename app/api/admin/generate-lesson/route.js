import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import pLimit from "p-limit";
import crypto from "crypto";

export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_STORAGE_BUCKET = "lesson-assets";
const SUPABASE_TABLE = "lessons";
const IMAGE_CONCURRENCY = 4;
const TEXT_MODEL = process.env.OPENAI_TEXT_MODEL || process.env.OPENAI_MODEL || "gpt-4o-mini";
const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || "dall-e-3";

// ... [Keep helpers slugify, uid, getCurriculumStandard, styleGuide, baseImageStylePrompt exactly as they were] ...
function slugify(s) { return (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 80); }
function uid(prefix) { return `${prefix}_${crypto.randomBytes(5).toString("hex")}`; }
function getCurriculumStandard(locale) {
  const l = (locale || "").toLowerCase();
  if (l.includes("australia") || l.includes("au")) return "Australian Curriculum (AC9) Version 9.0";
  if (l.includes("united states") || l.includes("us")) return "Common Core (CCSS) & NGSS";
  if (l.includes("united kingdom") || l.includes("uk")) return "UK National Curriculum";
  return "Global Standard / IB PYP";
}
function styleGuide({ locale, subject }) {
  const isAus = (locale || "").toLowerCase().includes("australia");
  return {
    brand: "SmartKidz",
    art_style_id: "premium_educational_3d_v2",
    palette: "vibrant_learning_high_contrast",
    character_pack: isAus ? "koala_kids_v1" : "friendly_global_kids_v1",
    illustration_rules: ["Style: Soft 3D Claymorphism, warm lighting.", "Clarity: Literal visual aid.", "No Text: NO text inside image."]
  };
}
function baseImageStylePrompt(sg, locale, subject, topic, year) {
  return [...(sg?.illustration_rules || []), `Context: Year ${year} ${subject} ${topic}. Locale: ${locale}.`, "Quality: 4k, octane render, cute."].join(" ");
}

// -----------------------------------------------------------------------------
// UPDATED PROMPT FOR "PREMIUM" LENGTH
// -----------------------------------------------------------------------------

function buildSystemPrompt(standard, year) {
  return `
You are the "SmartKidz Pedagogy Engine".
Generate a PREMIUM, MASSIVE lesson plan JSON. 
User expects a 30-minute experience, NOT a quick quiz.

### Structure (Must generate ~20 items in 'activities' array)
1. **Hook (Phase: hook)**: 1 Visual observation task to grab attention.
2. **Explicit Instruction (Phase: instruction)**: 3-4 slides breaking down the concept. Use simple language but go deep.
3. **Guided Practice (Phase: guided_practice)**: A scenario with 3-4 interactive questions (fill_blank or multiple_choice) where we solve it together.
4. **Independent Practice (Phase: independent_practice)**: A robust quiz of 10 questions. Varied difficulty.
5. **Challenge (Phase: challenge)**: 1 final deep-thinking reflection prompt.

### Schema
Return JSON object:
{
  "title": "...",
  "duration_minutes": 30,
  "overview": "...",
  "explanation": "...",
  "media_requests": [ { "asset_id": "img1", "purpose": "hook", "prompt": "..." }, ... (4 images total) ],
  "activities": [
    {
       "phase": "hook" | "instruction" | "guided_practice" | "independent_practice" | "challenge",
       "type": "visual_observe" | "learn" | "multiple_choice" | "fill_blank" | "reflection",
       "title": "...",
       "prompt": "...", 
       "media_ref_id": "img1" (optional),
       "options": ["A","B"] (if quiz),
       "correct_answer": "A",
       "explanation": "Why correct..."
    },
    ... (total ~20 items)
  ]
}
`.trim();
}

async function generateLessonContent({ openai, topic, year, subject, locale, lessonId }) {
  const standard = getCurriculumStandard(locale);
  const systemPrompt = buildSystemPrompt(standard, year);
  const userPrompt = JSON.stringify({ task: "generate_lesson_premium", meta: { locale, subject, year, topic } });

  const completion = await openai.chat.completions.create({
    model: TEXT_MODEL,
    temperature: 0.5,
    response_format: { type: "json_object" },
    messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }]
  });

  const raw = completion.choices?.[0]?.message?.content;
  if (!raw) throw new Error("Empty response");
  return JSON.parse(raw);
}

// ... [Keep generateImages and POST handler mostly same, just ensuring they use the new content structure] ...

async function generateImages({ openaiImages, supabase, requests, lessonId, sg, locale, subject, topic, year }) {
  if (!openaiImages) return [];
  const limiter = pLimit(IMAGE_CONCURRENCY);
  const promises = requests.map(req => limiter(async () => {
    try {
      const baseStyle = baseImageStylePrompt(sg, locale, subject, topic, year);
      const fullPrompt = `${baseStyle} Scene: ${req.prompt}`;
      const response = await openaiImages.images.generate({
        model: IMAGE_MODEL, prompt: fullPrompt, size: "1024x1024", response_format: "b64_json", quality: "standard", n: 1
      });
      const b64 = response.data?.[0]?.b64_json;
      if (!b64) throw new Error("No image data");
      const buffer = Buffer.from(b64, "base64");
      const path = `lessons/${lessonId}/${req.asset_id}.png`;
      const { error: uploadErr } = await supabase.storage.from(SUPABASE_STORAGE_BUCKET).upload(path, buffer, { contentType: "image/png", upsert: true });
      if (uploadErr) throw uploadErr;
      const { data: { publicUrl } } = supabase.storage.from(SUPABASE_STORAGE_BUCKET).getPublicUrl(path);
      return { asset_id: req.asset_id, url: publicUrl };
    } catch (e) { console.error(`Image gen failed: ${req.asset_id}`); return null; }
  }));
  const results = await Promise.all(promises);
  return results.filter(Boolean);
}

export async function POST(req) {
  try {
    const baseUrl = (OPENAI_BASE_URL || "").trim();
    const isOpenAICloud = !baseUrl || baseUrl.includes("api.openai.com");
    let apiKey = OPENAI_API_KEY;
    if (!apiKey && !isOpenAICloud) apiKey = "local";
    if (!apiKey && isOpenAICloud) {
      return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
    }
    const body = await req.json();
    const { topic, year, subject, locale = "Australia" } = body;

    // Text client (OpenAI cloud or local OpenAI-compatible server)
    const openai = new OpenAI({ apiKey, baseURL: baseUrl || undefined });
    // Image client: only supported by OpenAI cloud in this app.
    const imageKey = process.env.OPENAI_IMAGE_API_KEY || (isOpenAICloud ? apiKey : null);
    const openaiImages = (isOpenAICloud && imageKey) ? new OpenAI({ apiKey: imageKey }) : null;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const lessonId = `${slugify(subject)}_${slugify(topic)}_y${year}_${uid("v5")}`;

    // 1. Generate Rich Text
    const content = await generateLessonContent({ openai, topic, year, subject, locale, lessonId });

    // 2. Generate Images
    const sg = styleGuide({ locale, subject });
    const images = await generateImages({ openaiImages, supabase, requests: content.media_requests || [], lessonId, sg, locale, subject, topic, year });

    // 3. Link Images
    content.media_library = images;
    if (content.activities) {
        content.activities = content.activities.map(act => {
            if (act.media_ref_id) {
                const img = images.find(i => i.asset_id === act.media_ref_id);
                if (img) act.media_urls = [img.url];
            }
            return act;
        });
    }

    // 4. Save
    const row = {
      id: lessonId,
      title: content.title || topic,
      year_level: Number(year),
      subject_id: subject,
      topic: topic,
      content_json: content,
      country: (locale.slice(0, 2).toUpperCase() === "UK") ? "GB" : locale.slice(0, 2).toUpperCase(),
      updated_at: new Date().toISOString()
    };
    const { error: dbError } = await supabase.from(SUPABASE_TABLE).upsert(row);
    if (dbError) throw dbError;

    return NextResponse.json({ ok: true, lessonId, stats: { activities: content.activities?.length || 0 } });
  } catch (e) {
    console.error("[Gen] Error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}