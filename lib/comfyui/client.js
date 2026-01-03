import fs from "node:fs";
import path from "node:path";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export function getComfyConfig() {
  const baseURL = process.env.COMFYUI_BASE_URL || "";
  const workflowSource = (process.env.COMFYUI_WORKFLOW_SOURCE || "file").toLowerCase(); // file | db | auto
  return { baseURL: baseURL.replace(/\/$/, ""), workflowSource };
}

const _workflowCache = new Map();

/**
 * Load a ComfyUI workflow template by name.
 *
 * Sources:
 * - file: comfyui/workflows/<name>.json
 * - db: public.comfyui_workflows.workflow_json
 * - auto: try db first, then file
 */
export async function loadWorkflowTemplate(workflowName) {
  const { workflowSource } = getComfyConfig();
  const key = `${workflowSource}:${workflowName}`;
  if (_workflowCache.has(key)) return _workflowCache.get(key);

  // DB first (db/auto)
  if (workflowSource === "db" || workflowSource === "auto") {
    try {
      const { getSupabaseAdmin } = await import("@/lib/supabaseAdmin");
      const admin = getSupabaseAdmin();
      const { data, error } = await admin
        .from("comfyui_workflows")
        .select("workflow_json")
        .eq("workflow_name", workflowName)
        .maybeSingle();

      if (!error && data?.workflow_json) {
        _workflowCache.set(key, data.workflow_json);
        return data.workflow_json;
      }

      if (workflowSource === "db") {
        throw new Error(error?.message || `Workflow not found in DB: ${workflowName}`);
      }
    } catch (e) {
      if (workflowSource === "db") throw e;
      // auto falls through to file
    }
  }

  // File fallback
  const p = path.join(process.cwd(), "comfyui", "workflows", `${workflowName}.json`);
  if (!fs.existsSync(p)) throw new Error(`ComfyUI workflow template not found: ${p}`);
  const json = JSON.parse(fs.readFileSync(p, "utf-8"));
  _workflowCache.set(key, json);
  return json;
}

// Replace any string values containing {{prompt}} / {{negative_prompt}} / {{width}} etc.
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

  const template = await loadWorkflowTemplate(workflowName);
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
      for (const nodeId of Object.keys(item.outputs)) {
        const nodeOut = item.outputs[nodeId];
        const imgs = nodeOut?.images;
        if (Array.isArray(imgs) && imgs.length > 0) {
          return { promptId, outputs: item.outputs, image: imgs[0] };
        }
      }
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
