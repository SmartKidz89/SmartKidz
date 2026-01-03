import fs from "node:fs";
import path from "node:path";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export function getComfyConfig() {
  const baseURL = process.env.COMFYUI_BASE_URL || "";
  return { baseURL: baseURL.replace(/\/$/, "") };
}

export function loadWorkflowTemplate(workflowName) {
  const p = path.join(process.cwd(), "comfyui", "workflows", `${workflowName}.json`);
  if (!fs.existsSync(p)) throw new Error(`ComfyUI workflow template not found: ${p}`);
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

// Replace any string values containing {{prompt}} / {{negative_prompt}} / {{width}} etc.
// This is a simplistic templater but works well with stored workflow JSON.
export function applyWorkflowVariables(workflow, vars) {
  const s = JSON.stringify(workflow);
  const out = s.replace(/\{\{(\w+)\}\}/g, (_, k) => {
    const v = vars[k];
    return v === undefined || v === null ? "" : String(v);
  });
  return JSON.parse(out);
}

export async function runComfyWorkflow({ workflowName, vars, timeoutMs = 180000 }) {
  const { baseURL } = getComfyConfig();
  if (!baseURL) throw new Error("COMFYUI_BASE_URL is not set");

  const template = loadWorkflowTemplate(workflowName);
  const workflow = applyWorkflowVariables(template, vars);

  // 1) Submit prompt
  const submit = await fetch(`${baseURL}/prompt`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ prompt: workflow }),
  });

  const submitData = await submit.json().catch(() => ({}));
  if (!submit.ok) throw new Error(submitData?.error || `ComfyUI submit failed (${submit.status})`);

  const promptId = submitData?.prompt_id;
  if (!promptId) throw new Error("ComfyUI did not return prompt_id");

  // 2) Poll history until completion
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const h = await fetch(`${baseURL}/history/${promptId}`);
    const hist = await h.json().catch(() => ({}));
    const item = hist?.[promptId];
    if (item?.outputs) {
      // Find first image output
      for (const nodeId of Object.keys(item.outputs)) {
        const nodeOut = item.outputs[nodeId];
        const imgs = nodeOut?.images;
        if (Array.isArray(imgs) && imgs.length > 0) {
          return { promptId, outputs: item.outputs, image: imgs[0] };
        }
      }
      // outputs present but no images
      return { promptId, outputs: item.outputs, image: null };
    }
    await sleep(1200);
  }

  throw new Error("ComfyUI timeout");
}

export async function fetchComfyImageBuffer({ filename, subfolder = "", type = "output" }) {
  const { baseURL } = getComfyConfig();
  const url = new URL(`${baseURL}/view`);
  url.searchParams.set("filename", filename);
  if (subfolder) url.searchParams.set("subfolder", subfolder);
  url.searchParams.set("type", type);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Failed to fetch image (${res.status})`);
  const arr = await res.arrayBuffer();
  return Buffer.from(arr);
}
