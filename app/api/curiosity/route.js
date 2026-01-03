import { NextResponse } from "next/server";
import { validatePrompt } from "@/lib/safety/guardrails";
import { getOpenAICompatConfig, openaiChatCompletions } from "@/lib/ai/openaiCompat";

export const runtime = "nodejs";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q) return NextResponse.json({ error: "No question provided" }, { status: 400 });

  try {
    // 1. Universal Safety Check
    validatePrompt(q);

    // 2. Try AI (OpenAI cloud or local OpenAI-compatible server) if configured
    if (process.env.OPENAI_API_KEY || process.env.OPENAI_BASE_URL) {
      try {
        const cfg = getOpenAICompatConfig();
        const data = await openaiChatCompletions({
          model: cfg.model,
          messages: [
            {
              role: "system",
              content: `You are a science teacher for a 7-year-old.
STRICT RULE: Output ONLY valid JSON. No markdown. No pre-text.

Format:
{
  "title": "Short Fun Title",
  "explanation": "2-3 sentences explaining simply and accurately.",
  "realWorld": "A real life example related to the answer.",
  "activity": "A simple safe experiment or observation they can do.",
  "quiz": [
    {"question": "Simple Q1", "answer": "Answer 1"},
    {"question": "Simple Q2", "answer": "Answer 2"}
  ]
}`,
            },
            { role: "user", content: `Explain this to a child: ${q}` },
          ],
          temperature: 0.5,
          response_format: { type: "json_object" },
        });

        const content = data.choices?.[0]?.message?.content;
        if (content) {
          try {
            const json = JSON.parse(content);
            return NextResponse.json(json);
          } catch (parseErr) {
            console.error("AI JSON Parse Error", parseErr, content);
          }
        }
      } catch (e) {
        console.error("AI Curiosity failed", e);
      }
    }

    // 3. Fallback (if AI fails or key missing)
    return NextResponse.json({
      title: "Good Question!",
      explanation: "That's a fascinating thing to wonder about. Scientists learn by asking questions just like this. Keep observing the world around you to find the answer!",
      realWorld: "Ask a parent or teacher to help you look this up in a book or online.",
      activity: "Draw a picture of what you think the answer might be.",
      quiz: [
        { question: "What do scientists do?", answer: "They ask questions and test ideas." }
      ]
    });

  } catch (err) {
    return NextResponse.json({ error: err.message || "Safety check failed" }, { status: 400 });
  }
}