"use client";

import { useEffect, useMemo, useState } from "react";

function Pill({ children, tone = "slate" }) {
  const toneMap = {
    slate: "bg-slate-100 text-slate-700",
    green: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-rose-100 text-rose-700",
    blue: "bg-blue-100 text-blue-700",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${toneMap[tone] || toneMap.slate}`}>
      {children}
    </span>
  );
}

function Section({ title, desc, children, right }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 p-4 border-b border-slate-100">
        <div>
          <div className="text-sm font-semibold">{title}</div>
          {desc ? <div className="mt-1 text-xs text-slate-500">{desc}</div> : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function toneForStatus(s) {
  if (!s) return "slate";
  const v = String(s).toLowerCase();
  if (["completed", "done", "published"].includes(v)) return "green";
  if (["running", "processing"].includes(v)) return "blue";
  if (["queued", "pending", "draft"].includes(v)) return "amber";
  if (["failed", "error"].includes(v)) return "red";
  return "slate";
}

export default function LessonBuilder() {
  const [tab, setTab] = useState("jobs"); // jobs | assets
  const [jobs, setJobs] = useState([]);
  const [assets, setAssets] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  async function refresh() {
    const [j, a] = await Promise.all([
      fetch("/api/admin/lesson-jobs").then(r => r.json()),
      fetch("/api/admin/lesson-assets").then(r => r.json()),
    ]);
    if (j?.data) setJobs(j.data);
    if (a?.data) setAssets(a.data);
  }

  useEffect(() => { refresh(); }, []);

  async function importXlsx(file) {
    setBusy(true); setMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/lesson-jobs/import-xlsx", { method: "POST", body: fd });
      const out = await res.json();
      if (!res.ok) throw new Error(out?.error || "Import failed");
      setMsg(`Imported: jobs=${out.jobs_imported}, prompt_profiles=${out.prompt_profiles_imported}, image_specs=${out.image_specs_imported}, year_profiles=${out.year_profiles_imported || 0}`);
      await refresh();
    } catch (e) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function runLessonGen(limit = 5) {
    setBusy(true); setMsg(null);
    try {
      const res = await fetch("/api/admin/lesson-jobs/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ limit }),
      });
      const out = await res.json();
      if (!res.ok) throw new Error(out?.error || "Generation failed");
      setMsg(`Generated lessons: processed=${out.processed}, ok=${out.ok}, failed=${out.failed}`);
      await refresh();
    } catch (e) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function runAssetBatch(limit = 25) {
    setBusy(true); setMsg(null);
    try {
      const res = await fetch("/api/admin/lesson-assets/run-batch", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ limit }),
      });
      const out = await res.json();
      if (!res.ok) throw new Error(out?.error || "Asset batch failed");
      setMsg(`Assets batch: processed=${out.processed}, ok=${out.ok}, failed=${out.failed}`);
      await refresh();
    } catch (e) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  }

  const queuedJobs = useMemo(() => jobs.filter(j => (j.status || "").toLowerCase() === "queued"), [jobs]);
  const queuedAssets = useMemo(() => assets.filter(a => (a.status || "").toLowerCase() === "queued"), [assets]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <button
          className={`rounded-xl px-3 py-2 text-sm border ${tab === "jobs" ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 hover:bg-slate-50"}`}
          onClick={() => setTab("jobs")}
        >
          Lesson Jobs <span className="ml-1 text-xs opacity-80">({queuedJobs.length} queued)</span>
        </button>
        <button
          className={`rounded-xl px-3 py-2 text-sm border ${tab === "assets" ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 hover:bg-slate-50"}`}
          onClick={() => setTab("assets")}
        >
          Asset Queue <span className="ml-1 text-xs opacity-80">({queuedAssets.length} queued)</span>
        </button>

        <div className="ml-auto flex items-center gap-2">
          <button
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
            onClick={refresh}
            disabled={busy}
          >
            Refresh
          </button>
        </div>
      </div>

      {msg ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {msg}
        </div>
      ) : null}

      {tab === "jobs" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Section
            title="Import lesson jobs"
            desc="Upload your SmartKidz Lessons.xlsx. This imports Lesson Jobs, Prompt Library, and Image Specs into Supabase."
          >
            <input
              type="file"
              accept=".xlsx"
              disabled={busy}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importXlsx(f);
              }}
            />
            <div className="mt-3 text-xs text-slate-500">
              Requires server dependencies and DB tables from Step 2 schema. For production on Vercel, ensure your SQL has been applied.
            </div>
          </Section>

          <Section
            title="Generate lessons (Llama)"
            desc="Processes queued jobs and writes lessons into lesson_templates + lesson_editions. Also creates image generation queue items."
            right={
              <button
                className="rounded-xl bg-slate-900 text-white px-3 py-2 text-sm hover:bg-slate-800 disabled:opacity-50"
                disabled={busy || queuedJobs.length === 0}
                onClick={() => runLessonGen(5)}
              >
                Generate next 5
              </button>
            }
          >
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Pill tone="amber">{queuedJobs.length} queued</Pill>
              <div className="text-xs text-slate-500">
                Uses env vars: LLM_BASE_URL, LLM_MODEL (optional LLM_API_KEY).
              </div>
            </div>
          </Section>

          <div className="lg:col-span-2">
            <Section
              title="Jobs"
              desc="Most recent 50 jobs"
              right={<Pill tone="slate">{jobs.length} total</Pill>}
            >
              <div className="overflow-auto">
                <table className="min-w-[900px] w-full text-sm">
                  <thead className="text-xs text-slate-500">
                    <tr className="border-b border-slate-100">
                      <th className="py-2 text-left">Job</th>
                      <th className="py-2 text-left">Subject</th>
                      <th className="py-2 text-left">Year</th>
                      <th className="py-2 text-left">Topic</th>
                      <th className="py-2 text-left">Status</th>
                      <th className="py-2 text-left">Lesson ID</th>
                      <th className="py-2 text-left">Images</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map(j => (
                      <tr key={j.id} className="border-b border-slate-50">
                        <td className="py-2 font-mono text-xs">{j.job_id}</td>
                        <td className="py-2">{j.subject}</td>
                        <td className="py-2">{j.year_level}</td>
                        <td className="py-2">{j.topic}</td>
                        <td className="py-2"><Pill tone={toneForStatus(j.status)}>{j.status}</Pill></td>
                        <td className="py-2 font-mono text-xs">{j.supabase_lesson_id || "-"}</td>
                        <td className="py-2 text-xs text-slate-600">{j.image_status || "-"}</td>
                      </tr>
                    ))}
                    {jobs.length === 0 ? (
                      <tr><td className="py-6 text-center text-slate-500" colSpan={7}>No jobs found yet.</td></tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </Section>
          </div>
        </div>
      ) : null}

      {tab === "assets" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Section
            title="Generate assets (ComfyUI)"
            desc="Runs queued asset jobs in batches of 25. Uploads images to Supabase Storage and links them to lessons."
            right={
              <button
                className="rounded-xl bg-slate-900 text-white px-3 py-2 text-sm hover:bg-slate-800 disabled:opacity-50"
                disabled={busy || queuedAssets.length === 0}
                onClick={() => runAssetBatch(25)}
              >
                Run next 25
              </button>
            }
          >
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Pill tone="amber">{queuedAssets.length} queued</Pill>
              <div className="text-xs text-slate-500">
                Uses env vars: COMFYUI_BASE_URL (and a workflow template). For Vercel, ComfyUI must be reachable over HTTPS.
              </div>
            </div>
          </Section>

          <Section
            title="Queue"
            desc="Most recent 100 assets"
            right={<Pill tone="slate">{assets.length} total</Pill>}
          >
            <div className="overflow-auto">
              <table className="min-w-[900px] w-full text-sm">
                <thead className="text-xs text-slate-500">
                  <tr className="border-b border-slate-100">
                    <th className="py-2 text-left">Job</th>
                    <th className="py-2 text-left">Type</th>
                    <th className="py-2 text-left">Workflow</th>
                    <th className="py-2 text-left">Status</th>
                    <th className="py-2 text-left">Output</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map(a => (
                    <tr key={a.id} className="border-b border-slate-50">
                      <td className="py-2 font-mono text-xs">{a.job_id}</td>
                      <td className="py-2 text-xs">{a.image_type}</td>
                      <td className="py-2 text-xs">{a.comfyui_workflow}</td>
                      <td className="py-2"><Pill tone={toneForStatus(a.status)}>{a.status}</Pill></td>
                      <td className="py-2 text-xs text-slate-600">
                        {a.storage_path ? <a className="underline" href={a.public_url || "#"} target="_blank" rel="noreferrer">view</a> : "-"}
                      </td>
                    </tr>
                  ))}
                  {assets.length === 0 ? (
                    <tr><td className="py-6 text-center text-slate-500" colSpan={5}>No assets yet.</td></tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </Section>
        </div>
      ) : null}
    </div>
  );
}
