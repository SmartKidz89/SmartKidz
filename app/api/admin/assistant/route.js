import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { llmChatComplete } from "@/lib/llm/client";

export const maxDuration = 60;

export async function POST(req) {
  const auth = await requireAdminSession();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { messages, context, instructions } = await req.json();

  const systemPrompt = `You are the SmartKidz Admin AI.
You help operators configure the platform, generate content, and troubleshoot issues.
You have access to the following context about the current page:
${JSON.stringify(context || {}, null, 2)}

User Custom Instructions: ${instructions || "None"}

Rules:
- Be concise, operational, and professional.
- If asked to generate content (lessons, emails, SQL), output clean, valid code/JSON.
- You are an expert on the SmartKidz architecture (Next.js, Supabase, Tailwind).
- Do not hallucinate capabilities you don't have (e.g., "I have restarted the server" -> instead say "I recommend restarting the server").
`;

  try {
    const response = await llmChatComplete({
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      temperature: 0.7,
      max_tokens: 1000
    });
    
    if (!response.text) {
        return NextResponse.json({ error: "AI returned no content. Check server logs." }, { status: 500 });
    }
    
    return NextResponse.json({ message: response.text });
  } catch (e) {
    return NextResponse.json({ error: e.message || "AI Error" }, { status: 500 });
  }
}