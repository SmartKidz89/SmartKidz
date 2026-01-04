export function getLlmConfig() {
  const baseURL = process.env.LLM_BASE_URL || process.env.OPENAI_BASE_URL || "";
  const model = process.env.LLM_MODEL || process.env.OPENAI_MODEL || "";
  const apiKey = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY || "";
  return { baseURL, model, apiKey };
}

// Minimal OpenAI-compatible chat.completions client using fetch.
export async function llmChatComplete({ messages, temperature = 0.4, max_tokens = 2000 }) {
  const { baseURL, model, apiKey } = getLlmConfig();
  
  if (!baseURL) throw new Error("LLM_BASE_URL (or OPENAI_BASE_URL) is not set");
  if (!model) throw new Error("LLM_MODEL (or OPENAI_MODEL) is not set");

  const url = baseURL.replace(/\/$/, "") + "/chat/completions";
  console.log(`[LLM] Requesting ${model} at ${url}`);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens,
      }),
    });

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
       const text = await res.text();
       console.error("[LLM] Invalid response format (expected JSON):", text.slice(0, 200));
       throw new Error(`LLM endpoint returned ${res.status} but not JSON. Check URL: ${url}`);
    }

    const data = await res.json().catch(() => ({}));
    
    if (!res.ok) {
      const msg = data?.error?.message || data?.error || `LLM error (${res.status})`;
      console.error("[LLM] API Error:", msg);
      throw new Error(msg);
    }

    const text = data?.choices?.[0]?.message?.content ?? "";
    
    if (!text) {
        console.warn("[LLM] Received empty content from model. Full response:", JSON.stringify(data));
    }
    
    return { text, raw: data };
  } catch (err) {
    console.error("[LLM] Client exception:", err);
    throw err;
  }
}