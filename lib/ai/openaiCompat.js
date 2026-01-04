/**
 * OpenAI-compatible client helpers.
 *
 * This app can talk to:
 * - OpenAI (default)
 * - llama.cpp (llama-server) via OpenAI-compatible endpoints
 * - Ollama via OpenAI-compatibility endpoints
 *
 * Configure with:
 *   OPENAI_BASE_URL=http://localhost:8080/v1        # llama-server (llama.cpp)
 *   OPENAI_BASE_URL=http://localhost:11434/v1       # Ollama
 *   OPENAI_MODEL=llama3.2                           # or your local model name
 *   OPENAI_API_KEY=local                            # required by some clients; ignored by many local servers
 *   CF_ACCESS_CLIENT_ID=...                         # Optional: Cloudflare Service Token ID
 *   CF_ACCESS_CLIENT_SECRET=...                     # Optional: Cloudflare Service Token Secret
 */

const DEFAULT_BASE_URL = "https://api.openai.com/v1";

function normalizeBaseUrl(url) {
  const raw = (url || "").trim();
  const u = raw || DEFAULT_BASE_URL;
  return u.replace(/\/+$/, "");
}

export function getOpenAICompatConfig() {
  // Prefer OPENAI_* vars, but allow the admin LLM_* vars as a drop-in.
  const baseUrl = normalizeBaseUrl(process.env.OPENAI_BASE_URL || process.env.LLM_BASE_URL);
  const isOpenAICloud = baseUrl.includes("api.openai.com");

  // Backward compatibility: some endpoints use OPENAI_TEXT_MODEL.
  const model =
    process.env.OPENAI_MODEL ||
    process.env.OPENAI_TEXT_MODEL ||
    process.env.LLM_MODEL ||
    "llama3.2:latest";

  let apiKey = process.env.OPENAI_API_KEY || process.env.LLM_API_KEY;
  if (!apiKey && !isOpenAICloud) {
    // Local servers: OpenAI compatibility layers often accept any value or ignore it.
    apiKey = "local";
  }

  if (!apiKey && isOpenAICloud) {
    throw new Error("OPENAI_API_KEY is not set on the server.");
  }
  
  const cfClientId = process.env.CF_ACCESS_CLIENT_ID || process.env.LLM_CF_ACCESS_CLIENT_ID;
  const cfClientSecret = process.env.CF_ACCESS_CLIENT_SECRET || process.env.LLM_CF_ACCESS_CLIENT_SECRET;

  return { baseUrl, apiKey, model, isOpenAICloud, cfClientId, cfClientSecret };
}

export function supportsOpenAIResponseFormat(baseUrl) {
  // Many OpenAI-compatible servers do not support `response_format` or require different schemas.
  // Keep it enabled only for OpenAI cloud by default.
  return normalizeBaseUrl(baseUrl).includes("api.openai.com");
}

export async function openaiChatCompletions(payload) {
  const { baseUrl, apiKey, cfClientId, cfClientSecret } = getOpenAICompatConfig();
  const url = `${baseUrl}/chat/completions`;

  const safePayload = { ...payload };
  if (safePayload?.response_format && !supportsOpenAIResponseFormat(baseUrl)) {
    delete safePayload.response_format;
  }

  const headers = {
    "Content-Type": "application/json",
    ...(apiKey && apiKey !== "local" ? { Authorization: `Bearer ${apiKey}` } : {}),
  };

  if (cfClientId && cfClientSecret) {
    headers["CF-Access-Client-Id"] = cfClientId;
    headers["CF-Access-Client-Secret"] = cfClientSecret;
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(safePayload),
  });

  const contentType = res.headers.get("content-type") || "";
  
  if (!contentType.includes("application/json")) {
      const text = await res.text();
      // Detect Cloudflare Access login page
      if (text.includes("Cloudflare Access") || text.includes("aud")) {
         throw new Error(`Cloudflare Access blocked request to ${url}. Ensure CF_ACCESS_CLIENT_ID and CF_ACCESS_CLIENT_SECRET are set.`);
      }
      throw new Error(`LLM endpoint error (${res.status}): Content-Type is ${contentType}.`);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message || data?.message || "LLM request failed";
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}