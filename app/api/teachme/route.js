import { NextResponse } from "next/server";
import { validatePrompt } from "@/lib/safety/guardrails";

export const runtime = "nodejs";

function extractJson(text) {
  if (!text) return null;
  const s = String(text).trim();
  const first = s.indexOf("{");
  const last = s.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) return null;
  const candidate = s.slice(first, last + 1);
  try { return JSON.parse(candidate); } catch { return null; }
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const year_level = Number(body?.year_level);
  const prompt = body?.prompt;

  if (!Number.isFinite(year_level) || year_level < 1 || year_level > 13) {
    return NextResponse.json({ error: "Invalid year_level" }, { status: 400 });
  }
  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
  }

  // Safety check
  try {
    validatePrompt(prompt);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not set on the server." },
      { status: 500 }
    );
  }

  const system = `
You are TeachMe, an expert tutor for kids.

You must:
- Adapt explanations to a Year ${year_level} learner (age-appropriate language, examples, and pacing).
- Be extremely detailed but easy to follow.
- Use short sections and bullet points.
- Include memory tips and common mistakes.
- Include practice questions with increasing difficulty.

Return ONLY valid JSON (no markdown fences) with this schema:
{
  "title": string,
  "summary": string,
  "steps": string[],
  "tips": string[],
  "common_mistakes": string[],
  "practice_questions": string[],
  "full": string
}
`.trim();

  const payload = {
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.4,
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" }
  };

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error?.message || "TeachMe failed" },
        { status: 500 }
      );
    }

    const content = data?.choices?.[0]?.message?.content;
    const parsed = extractJson(content);

    if (!parsed) {
      return NextResponse.json(
        { error: "TeachMe returned an unexpected format.", raw: content },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (e) {
    return NextResponse.json(
      { error: e?.message || "TeachMe request failed" },
      { status: 500 }
    );
  }
}
