import { NextResponse } from "next/server";
import { validatePrompt } from "@/lib/safety/guardrails";

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

  // 1. Try OpenAI if available
  if (process.env.OPENAI_API_KEY) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
          messages: [
            { 
              role: "system", 
              content: "You are a friendly dictionary for a 7-year-old. Return a JSON object with keys: 'word' (the word), 'simple' (a very simple definition), and 'example' (a short, easy sentence using the word). Ensure G-rated content." 
            },
            { role: "user", content: `Define: ${term}` }
          ],
          temperature: 0.3
        })
      });
      
      if (res.ok) {
        const data = await res.json();
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