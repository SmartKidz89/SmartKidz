/**
 * Minimal Stable Diffusion (WebUI Forge / A1111 SDAPI) client.
 * Expects SD_API_URL like http://127.0.0.1:7860
 *
 * Returns a Buffer containing PNG bytes.
 */

export async function checkForgeConnection(url) {
  const tryFetch = async (targetUrl) => {
    const cleanUrl = targetUrl.replace(/\/$/, "");
    try {
      const res = await fetch(`${cleanUrl}/sdapi/v1/options`, { 
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(3000) 
      });
      return { ok: res.ok, status: res.status, url: targetUrl };
    } catch (e) {
      return { ok: false, error: e.message, code: e.cause?.code };
    }
  };

  // 1. Try original
  let result = await tryFetch(url);
  if (result.ok) return result;

  // 2. If refused, try swapping localhost <-> 127.0.0.1
  if (result.code === 'ECONNREFUSED') {
    let altUrl = null;
    if (url.includes('127.0.0.1')) altUrl = url.replace('127.0.0.1', 'localhost');
    else if (url.includes('localhost')) altUrl = url.replace('localhost', '127.0.0.1');

    if (altUrl) {
      const result2 = await tryFetch(altUrl);
      if (result2.ok) return result2;
    }
  }

  return result;
}

export async function forgeTxt2Img({
  prompt,
  negative_prompt,
  width = 1024,
  height = 576,
  steps = 20,
  cfg_scale = 7,
  sampler_name = "DPM++ 2M Karras",
  sdApiUrl,
  signal,
} = {}) {
  if (!sdApiUrl) {
    throw new Error("SD_API_URL is not set.");
  }

  const cleanUrl = sdApiUrl.replace(/\/$/, "");
  const endpoint = `${cleanUrl}/sdapi/v1/txt2img`;

  try {
    const r = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal,
      body: JSON.stringify({
        prompt,
        negative_prompt,
        width,
        height,
        steps,
        cfg_scale,
        sampler_name,
        n_iter: 1,
        batch_size: 1,
      }),
    });

    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(`Forge API Error (${r.status}): ${t.substring(0, 100)}`);
    }

    const data = await r.json();
    const b64 = data?.images?.[0];
    if (!b64) throw new Error("Forge returned success but no image data.");

    return Buffer.from(b64, "base64");
  } catch (err) {
    if (err.message === "fetch failed" && err.cause) {
      if (err.cause.code === "ECONNREFUSED") {
        throw new Error(`Connection refused at ${cleanUrl}. Is Forge running?`);
      }
      throw new Error(`Network error at ${cleanUrl}: ${err.cause.code || err.message}`);
    }
    throw err;
  }
}