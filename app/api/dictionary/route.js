import { NextResponse } from "next/server";
import { validatePrompt } from "@/lib/safety/guardrails";
import { getOpenAICompatConfig, openaiChatCompletions } from "@/lib/ai/openaiCompat";

export const runtime = "nodejs";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const term = searchParams.get("q");

  if (!term) return NextResponse.json({ error: "Missing query" }, { status: 400 });

  // Safety Check
  try {
    validatePrompt(term);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  // 1. Try AI (OpenAI cloud or local OpenAI-compatible server) if configured
  if (process.env.OPENAI_API_KEY || process.env.OPENAI_BASE_URL) {
    try {
      const cfg = getOpenAICompatConfig();
      const data = await openaiChatCompletions({
        model: cfg.model,
        messages: [
          {
            role: "system",
            content:
              "You are a friendly dictionary for a 7-year-old. Return a JSON object with keys: 'word' (the word), 'simple' (a very simple definition), and 'example' (a short, easy sentence using the word). Ensure G-rated content.",
          },
          { role: "user", content: `Define: ${term}` },
        ],
        temperature: 0.3,
      });

      if (data) {
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          try {
            const json = JSON.parse(content);
            return NextResponse.json(json);
          } catch (e) {
            console.error("Failed to parse AI dictionary response", e);
          }
        }
      }
    } catch (e) {
      console.error("AI Dictionary fail", e);
    }
  }

  // 2. Fallback: Free Dictionary API
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(term)}`);
    if (!res.ok) throw new Error("Not found");
    
    const data = await res.json();
    const entry = data[0];
    
    let bestDef = entry.meanings?.[0]?.definitions?.[0];
    for (const m of entry.meanings || []) {
      const withEx = m.definitions.find(d => d.example);
      if (withEx) {
        bestDef = withEx;
        break;
      }
    }

    return NextResponse.json({
      word: entry.word,
      simple: bestDef?.definition || "No definition found.",
      example: bestDef?.example || `I used the word "${entry.word}" in a sentence.`
    });
  } catch (e) {
    return NextResponse.json({ error: "Word not found" }, { status: 404 });
  }
}