export function getLlmConfig() {
  const baseURL = process.env.LLM_BASE_URL || "";
  const model = process.env.LLM_MODEL || "";
  const apiKey = process.env.LLM_API_KEY || "";
  return { baseURL, model, apiKey };
}

// Minimal OpenAI-compatible chat.completions client using fetch.
// Works with many Llama providers (or self-hosted servers) that implement /v1/chat/completions.
export async function llmChatComplete({ messages, temperature = 0.4, max_tokens = 2000 }) {
  const { baseURL, model, apiKey } = getLlmConfig();
  if (!baseURL) throw new Error("LLM_BASE_URL is not set");
  if (!model) throw new Error("LLM_MODEL is not set");

  const url = baseURL.replace(/\/$/, "") + "/chat/completions";

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

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error?.message || data?.error || `LLM error (${res.status})`);
  }

  const text = data?.choices?.[0]?.message?.content ?? "";
  return { text, raw: data };
}
