import { NextResponse } from "next/server";
import { validatePrompt } from "@/lib/safety/guardrails";
import { getOpenAICompatConfig, openaiChatCompletions } from "@/lib/ai/openaiCompat";

export const runtime = "nodejs";

const FALLBACK_WORDS = {
  1: [
    { word: "cat", sentence: "The cat sat on the mat." },
    { word: "dog", sentence: "The dog barked loudly." },
    { word: "run", sentence: "I like to run fast." },
    { word: "jump", sentence: "Can you jump high?" },
    { word: "red", sentence: "The apple is red." }
  ],
  2: [
    { word: "happy", sentence: "I am very happy today." },
    { word: "green", sentence: "The grass is green." },
    { word: "play", sentence: "Let's go play outside." },
    { word: "bird", sentence: "The bird flew away." },
    { word: "water", sentence: "Drink some water." }
  ],
  3: [
    { word: "because", sentence: "I smiled because I was happy." },
    { word: "friend", sentence: "You are my best friend." },
    { word: "school", sentence: "We learn at school." },
    { word: "animal", sentence: "A lion is a wild animal." },
    { word: "people", sentence: "There were many people there." }
  ],
  4: [
    { word: "believe", sentence: "You must believe in yourself." },
    { word: "through", sentence: "We walked through the forest." },
    { word: "thought", sentence: "I thought about the answer." },
    { word: "different", sentence: "Every snowflake is different." },
    { word: "suddenly", sentence: "Suddenly, it started to rain." }
  ],
  5: [
    { word: "environment", sentence: "We must protect the environment." },
    { word: "government", sentence: "The government makes laws." },
    { word: "necessary", sentence: "Water is necessary for life." },
    { word: "island", sentence: "They sailed to a tropical island." },
    { word: "ocean", sentence: "The ocean is very deep." }
  ],
  6: [
    { word: "achievement", sentence: "Winning was a great achievement." },
    { word: "relevant", sentence: "Is that relevant to the topic?" },
    { word: "guarantee", sentence: "I guarantee you will like it." },
    { word: "rhythm", sentence: "The music has a fast rhythm." },
    { word: "system", sentence: "The solar system is huge." }
  ]
};

export async function POST(req) {
  try {
    const { year = 3, count = 1 } = await req.json();
    const safeYear = Math.min(Math.max(1, Number(year)), 6);

    // 1. Try AI (OpenAI cloud or local OpenAI-compatible server)
    if (process.env.OPENAI_API_KEY || process.env.OPENAI_BASE_URL) {
      try {
        const cfg = getOpenAICompatConfig();
        const systemPrompt = `You are a spelling teacher for Year ${safeYear} students (Australia). 
        Generate ${count} spelling word(s).
        Return JSON array of objects: [{ "word": "example", "sentence": "Context sentence using example." }]
        Rules:
        - Words must be age-appropriate.
        - Sentence must be simple and clear.
        - Do NOT include the word in the sentence if possible, or replace it with a blank, OR just provide a context sentence where the word fits naturally. Ideally, the sentence acts as a usage example.
        - JSON only.`;

        const data = await openaiChatCompletions({
          model: cfg.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: "Give me a word." }
          ],
          temperature: 0.8
        });

        const content = data.choices?.[0]?.message?.content;
        if (content) {
          // Clean up potentially messy JSON from AI
          const jsonStr = content.replace(/```json/g, "").replace(/```/g, "").trim();
          const result = JSON.parse(jsonStr);
          const list = Array.isArray(result) ? result : [result];
          return NextResponse.json({ words: list, source: "ai" });
        }
      } catch (e) {
        console.error("AI Spelling failed:", e);
        // Fall through to fallback
      }
    }

    // 2. Fallback
    const list = FALLBACK_WORDS[safeYear] || FALLBACK_WORDS[3];
    // Shuffle and pick
    const shuffled = [...list].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);
    
    return NextResponse.json({ words: selected, source: "fallback" });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}