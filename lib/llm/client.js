export function getLlmConfig() {
  const baseURL = process.env.LLM_BASE_URL || process.env.OPENAI_BASE_URL || "http://127.0.0.1:11434/v1";
  const model = process.env.LLM_MODEL || process.env.OPENAI_MODEL || "qwen2.5:32b";
  const apiKey = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY || "local";
  return { baseURL, model, apiKey };
}

// Minimal OpenAI-compatible chat.completions client using fetch.
export async function llmChatComplete({ 
  messages, 
  temperature = 0.4, 
  max_tokens = 2000,
  baseUrl: overrideUrl,
  model: overrideModel 
}) {
  const cfg = getLlmConfig();
  
  // Prefer overrides from arguments, then env vars, then defaults
  const baseURL = overrideUrl || cfg.baseURL;
  const model = overrideModel || cfg.model;
  const apiKey = cfg.apiKey;

  const url = baseURL.replace(/\/$/, "") + "/chat/completions";
  console.log(`[LLM] Requesting ${model} at ${url}`);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(apiKey && apiKey !== "local" ? { authorization: `Bearer ${apiKey}` } : {}),
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
       console.error("[LLM] Invalid response format (expected JSON):", text.slice(0, 500));
       throw new Error(`LLM endpoint at ${url} returned ${res.status} but content-type was ${contentType}. Response preview: ${text.slice(0, 100)}...`);
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