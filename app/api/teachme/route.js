import { NextResponse } from "next/server";
import { validatePrompt } from "@/lib/safety/guardrails";
import { getOpenAICompatConfig, openaiChatCompletions } from "@/lib/ai/openaiCompat";

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

  // Allow OpenAI cloud or local OpenAI-compatible servers (llama-server, Ollama).
  let cfg;
  try {
    cfg = getOpenAICompatConfig();
  } catch (e) {
    return NextResponse.json({ error: e?.message || "AI config error" }, { status: 500 });
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
    model: cfg.model,
    temperature: 0.4,
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" }
  };

  try {
    const data = await openaiChatCompletions(payload);

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
      { error: e?.message || "TeachMe request failed", details: e?.data },
      { status: 500 }
    );
  }
}
