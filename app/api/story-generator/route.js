import { NextResponse } from "next/server";
import { validatePrompt } from "@/lib/safety/guardrails";
import { getOpenAICompatConfig, openaiChatCompletions } from "@/lib/ai/openaiCompat";

export const runtime = "nodejs";

const FALLBACK_STORIES = [
  {
    title: "The Robot Who Loved Flowers",
    pages: [
      { text: "Once upon a time, there was a little robot named Beep. Beep lived in a shiny metal city where everything was grey.", imagePrompt: "A cute small robot in a grey metallic city" },
      { text: "One day, Beep found a tiny crack in the pavement. Inside, a small green plant was growing. It was the first green thing Beep had ever seen.", imagePrompt: "A robot looking at a small green plant growing in concrete" },
      { text: "Beep watered the plant every day with oil. But the plant didn't like oil! It started to droop. Beep was sad.", imagePrompt: "A sad robot holding an oil can next to a wilting plant" },
      { text: "An old bird flew down. 'Plants need water, not oil!' chirped the bird. Beep rushed to find some water.", imagePrompt: "A bird talking to a robot" },
      { text: "With fresh water, the plant grew big and bloomed into a bright red flower. Beep was the happiest robot in the city.", imagePrompt: "A happy robot next to a large red flower" }
    ]
  }
];

export async function POST(req) {
  try {
    const { prompt, pages = 5, age = 7 } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Safety Check
    try {
      validatePrompt(prompt);
    } catch (err) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    // 1. Try AI (OpenAI cloud or local OpenAI-compatible server)
    if (process.env.OPENAI_API_KEY || process.env.OPENAI_BASE_URL) {
      try {
        const cfg = getOpenAICompatConfig();
        const systemPrompt = `You are a children's book author. Write a story for a ${age}-year-old based on the user's prompt.
        
        Requirements:
        - Exactly ${pages} pages/parts.
        - Simple, engaging language.
        - Provide a title.
        - For each page, provide the story text AND a short, descriptive image prompt for an illustrator.
        - ENSURE CONTENT IS G-RATED. No violence, scary themes, or rudeness.
        
        Return JSON format:
        {
          "title": "Story Title",
          "pages": [
            { "text": "Page 1 text...", "imagePrompt": "Description of scene..." },
            ...
          ]
        }`;

        const data = await openaiChatCompletions({
          model: cfg.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Write a story about: ${prompt}` }
          ],
          temperature: 0.7
        });

        const raw = data.choices?.[0]?.message?.content;
        if (raw) {
          const jsonStr = raw.replace(/```json/g, "").replace(/```/g, "").trim();
          const result = JSON.parse(jsonStr);
          return NextResponse.json(result);
        }
      } catch (e) {
        console.error("AI Story generation failed", e);
      }
    }

    // 2. Fallback
    const fallback = FALLBACK_STORIES[0];
    return NextResponse.json({
      title: fallback.title,
      pages: fallback.pages.slice(0, pages),
      note: "Generated with offline mode (AI key missing)"
    });

  } catch (e) {
    return NextResponse.json({ error: e.message || "Failed to generate story" }, { status: 500 });
  }
}