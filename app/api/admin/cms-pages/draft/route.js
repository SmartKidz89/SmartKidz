import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";

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

async function callLLM(prompt) {
  const base = process.env.LLM_BASE_URL;
  const apiKey = process.env.LLM_API_KEY || "";
  const model = process.env.LLM_MODEL || "llama-3.1-70b-instruct";

  if (!base) {
    throw new Error("Missing LLM_BASE_URL (expected an OpenAI-compatible /v1 endpoint)");
  }

  const url = base.replace(/\/+$/, "") + "/chat/completions";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      messages: [
        { role: "system", content: buildSystemPrompt() },
        { role: "user", content: JSON.stringify({ task: "draft_page", prompt }) },
      ],
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message || data?.error || `LLM error (${res.status})`;
    throw new Error(msg);
  }
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty LLM response");
  return content;
}

export async function POST(req) {
  const auth = await requireAdminSession();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    const body = await req.json();
    const prompt = (body?.prompt || "").trim();
    if (!prompt) return NextResponse.json({ error: "prompt is required" }, { status: 400 });

    const raw = await callLLM(prompt);
    const content_json = JSON.parse(raw);

    return NextResponse.json({ content_json });
  } catch (e) {
    return NextResponse.json({ error: e?.message || "Draft failed" }, { status: 500 });
  }
}
