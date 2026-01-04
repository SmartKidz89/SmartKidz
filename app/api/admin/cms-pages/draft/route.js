import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { getOpenAICompatConfig, openaiChatCompletions } from "@/lib/ai/openaiCompat";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function buildSystemPrompt() {
  return `
You are generating JSON for a page builder.
Return ONLY valid JSON (no markdown).
Schema:
{
  "version": 1,
  "blocks": [
    { "id": "string", "type": "hero|section|cards|markdown|image|divider|spacer", ... }
  ]
}
Rules:
- Always include version=1 and blocks array.
- Each block must include a stable unique id (hex-like string is fine).
- Keep content concise and kid-friendly where appropriate.
- Use only the supported block types listed above. Prefer adding an Image block when the prompt mentions imagery or icons.
`;
}

export async function POST(req) {
  const auth = await requireAdminSession();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    const body = await req.json();
    const prompt = (body?.prompt || "").trim();
    if (!prompt) return NextResponse.json({ error: "prompt is required" }, { status: 400 });

    const cfg = getOpenAICompatConfig();
    
    // Default to llama3.2:latest if no specific model env var is set
    const model = process.env.LLM_MODEL || process.env.OPENAI_MODEL || "llama3.2:latest";

    const data = await openaiChatCompletions({
      model,
      temperature: 0.4,
      messages: [
        { role: "system", content: buildSystemPrompt() },
        { role: "user", content: JSON.stringify({ task: "draft_page", prompt }) },
      ],
    });

    const contentRaw = data?.choices?.[0]?.message?.content;
    if (!contentRaw) throw new Error("Empty LLM response");

    // Clean markdown fences if present
    const cleanJson = contentRaw.replace(/```json/g, "").replace(/```/g, "").trim();
    const content_json = JSON.parse(cleanJson);

    return NextResponse.json({ content_json });
  } catch (e) {
    console.error("Draft failed:", e);
    return NextResponse.json({ error: e?.message || "Draft failed" }, { status: 500 });
  }
}