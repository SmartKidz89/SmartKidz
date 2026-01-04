export function getLlmConfig() {
  const baseURL = process.env.LLM_BASE_URL || process.env.OPENAI_BASE_URL || "http://127.0.0.1:11434/v1";
  const model = process.env.LLM_MODEL || process.env.OPENAI_MODEL || "qwen2.5:32b";
  const apiKey = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY || "local";
  
  // Cloudflare Access Headers
  const cfClientId = process.env.CF_ACCESS_CLIENT_ID || process.env.LLM_CF_ACCESS_CLIENT_ID;
  const cfClientSecret = process.env.CF_ACCESS_CLIENT_SECRET || process.env.LLM_CF_ACCESS_CLIENT_SECRET;

  return { baseURL, model, apiKey, cfClientId, cfClientSecret };
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

  const headers = {
    "content-type": "application/json",
    ...(apiKey && apiKey !== "local" ? { authorization: `Bearer ${apiKey}` } : {}),
  };

  // Inject Cloudflare Access headers if present
  if (cfg.cfClientId && cfg.cfClientSecret) {
    headers["CF-Access-Client-Id"] = cfg.cfClientId;
    headers["CF-Access-Client-Secret"] = cfg.cfClientSecret;
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
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
       
       // Detect Cloudflare Access login page signature
       if (text.includes("Cloudflare Access") || text.includes("aud")) {
         throw new Error(`Cloudflare Access blocked request to ${url}. Ensure CF_ACCESS_CLIENT_ID and CF_ACCESS_CLIENT_SECRET are set.`);
       }
       
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