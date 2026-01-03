"use client";

import { useEffect, useMemo, useState } from "react";
import AdminNotice from "../admin/AdminNotice";
import { Sparkles, Server, Save } from "lucide-react";
import { Button, Input, Select } from "@/components/admin/AdminControls";

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
  const [tab, setTab] = useState("interactive"); // interactive | jobs | assets
  const [jobs, setJobs] = useState([]);
  const [assets, setAssets] = useState([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  // Interactive Form State
  const [form, setForm] = useState({
    subject: "Mathematics",
    year: "3",
    topic: "Fractions",
    strand: "Number",
    subtopic: "Equivalent Fractions",
    useLocalLLM: false,
    llmUrl: "http://127.0.0.1:11434/v1", // Default Ollama
    llmModel: "llama3",
  });

  const [lastResult, setLastResult] = useState(null);

  async function refresh() {
    try {
      const [j, a] = await Promise.all([
        fetch("/api/admin/lesson-jobs").then((r) => r.json()),
        fetch("/api/admin/lesson-assets").then((r) => r.json()),
      ]);
      if (j?.data) setJobs(j.data);
      if (a?.data) setAssets(a.data);
    } catch (e) {
      setNotice({ tone: "danger", title: "Refresh failed", text: e?.message || String(e) });
    }
  }

  useEffect(() => { refresh(); }, []);

  async function handleGenerate() {
    setBusy(true);
    setNotice(null);
    setLastResult(null);

    try {
      const payload = {
        subject: form.subject,
        year: form.year,
        topic: form.topic,
        strand: form.strand,
        subtopic: form.subtopic,
      };

      // Add local overrides if enabled
      if (form.useLocalLLM) {
        payload.llmUrl = form.llmUrl;
        payload.llmModel = form.llmModel;
        payload.llmKey = "local";
      }

      const res = await fetch("/api/admin/generate-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Generation failed");
      
      setLastResult(data);
      setNotice({ 
        tone: "success", 
        title: "Lesson Created", 
        text: `Generated "${data.title}" (${data.lesson_id}) with ${data.questions} questions.` 
      });
      
      await refresh(); // Refresh asset queue

    } catch (e) {
      setNotice({ tone: "danger", title: "Generation failed", text: e.message });
    } finally {
      setBusy(false);
    }
  }

  // ... (Legacy Handlers: importXlsx, runLessonGen, runAssetBatch kept for bulk tab)
  async function runAssetBatch(limit = 25) {
     setBusy(true); setNotice(null);
     try {
        const res = await fetch("/api/admin/lesson-assets/run-batch", { method: "POST", body: JSON.stringify({ limit }) });
        const out = await res.json();
        setNotice({ tone: "success", title: "Assets Processed", text: `Success: ${out.ok}, Failed: ${out.failed}` });
        refresh();
     } catch (e) { setNotice({ tone: "danger", text: e.message }); }
     setBusy(false);
  }

  const queuedAssets = assets.filter(a => (a.status || "").toLowerCase() === "queued");

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          className={`rounded-xl px-3 py-2 text-sm border font-bold ${tab === "interactive" ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 hover:bg-slate-50"}`}
          onClick={() => setTab("interactive")}
        >
          <Sparkles className="w-4 h-4 inline mr-2" />
          Interactive Generator
        </button>
        <button
          className={`rounded-xl px-3 py-2 text-sm border ${tab === "jobs" ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 hover:bg-slate-50"}`}
          onClick={() => setTab("jobs")}
        >
          Bulk Jobs
        </button>
        <button
          className={`rounded-xl px-3 py-2 text-sm border ${tab === "assets" ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 hover:bg-slate-50"}`}
          onClick={() => setTab("assets")}
        >
          Asset Queue {queuedAssets.length > 0 && <span className="ml-1 bg-amber-100 text-amber-700 px-1.5 rounded-full text-xs">{queuedAssets.length}</span>}
        </button>
        
        <div className="ml-auto">
           <Button tone="secondary" onClick={refresh} disabled={busy}>Refresh</Button>
        </div>
      </div>

      {notice && (
        <AdminNotice tone={notice.tone} title={notice.title}>{notice.text}</AdminNotice>
      )}

      {/* INTERACTIVE TAB */}
      {tab === "interactive" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-2 space-y-6">
              <Section title="Lesson Parameters" desc="Define the lesson scope. This uses the v1.7 Schema.">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Subject</label>
                       <Select value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}>
                          <option value="Mathematics">Mathematics</option>
                          <option value="English">English</option>
                          <option value="Science">Science</option>
                          <option value="HASS">HASS</option>
                          <option value="Technologies">Technologies</option>
                          <option value="The Arts">The Arts</option>
                          <option value="Health and Physical Education">HPE</option>
                       </Select>
                    </div>
                    <div>
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Year Level</label>
                       <Select value={form.year} onChange={e => setForm({...form, year: e.target.value})}>
                          {[1,2,3,4,5,6].map(y => <option key={y} value={y}>Year {y}</option>)}
                       </Select>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div>
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Strand</label>
                       <Input value={form.strand} onChange={e => setForm({...form, strand: e.target.value})} placeholder="e.g. Number" />
                    </div>
                    <div>
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Topic</label>
                       <Input value={form.topic} onChange={e => setForm({...form, topic: e.target.value})} placeholder="e.g. Fractions" />
                    </div>
                    <div>
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Subtopic</label>
                       <Input value={form.subtopic} onChange={e => setForm({...form, subtopic: e.target.value})} placeholder="e.g. Halves" />
                    </div>
                 </div>

                 <div className="flex justify-end">
                    <Button onClick={handleGenerate} disabled={busy} className="h-12 px-6 shadow-md">
                       <Sparkles className="w-5 h-5 mr-2" />
                       {busy ? "Generating (approx 30s)..." : "Generate & Save"}
                    </Button>
                 </div>
              </Section>

              {lastResult && (
                 <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-6 animate-in fade-in slide-in-from-bottom-2">
                    <h3 className="font-bold text-emerald-900 text-lg mb-2">Success!</h3>
                    <div className="text-sm text-emerald-800 space-y-1">
                       <div><strong>Lesson ID:</strong> {lastResult.lesson_id}</div>
                       <div><strong>Questions:</strong> {lastResult.questions}</div>
                       <div><strong>Assets Queued:</strong> {lastResult.assets_queued}</div>
                    </div>
                    <div className="mt-4 flex gap-2">
                       <Button tone="ghost" onClick={() => setTab("assets")} className="text-emerald-700 hover:text-emerald-900">
                          View Asset Queue
                       </Button>
                    </div>
                 </div>
              )}
           </div>

           <div className="lg:col-span-1 space-y-6">
              <Section title="AI Configuration" desc="Switch between Cloud and Local LLMs.">
                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <span className="text-sm font-bold text-slate-700">Use Local LLM</span>
                       <input 
                         type="checkbox" 
                         className="toggle"
                         checked={form.useLocalLLM}
                         onChange={e => setForm({...form, useLocalLLM: e.target.checked})}
                       />
                    </div>
                    
                    {form.useLocalLLM && (
                       <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 animate-in fade-in">
                          <div>
                             <label className="text-xs font-bold text-slate-500 uppercase">Base URL</label>
                             <Input 
                               value={form.llmUrl} 
                               onChange={e => setForm({...form, llmUrl: e.target.value})} 
                               placeholder="http://localhost:11434/v1"
                             />
                          </div>
                          <div>
                             <label className="text-xs font-bold text-slate-500 uppercase">Model Name</label>
                             <Input 
                               value={form.llmModel} 
                               onChange={e => setForm({...form, llmModel: e.target.value})} 
                               placeholder="llama3"
                             />
                          </div>
                          <div className="text-xs text-slate-500">
                             Ensure Ollama is running: <code className="bg-slate-200 px-1 rounded">ollama serve</code>
                          </div>
                       </div>
                    )}
                    
                    {!form.useLocalLLM && (
                       <div className="text-xs text-slate-500">
                          Using server environment variables (OPENAI_API_KEY).
                       </div>
                    )}
                 </div>
              </Section>
           </div>
        </div>
      )}

      {/* ASSETS TAB */}
      {tab === "assets" && (
         <Section
            title="Generate Assets"
            desc="Process queued image requests via ComfyUI."
            right={
              <Button onClick={() => runAssetBatch(25)} disabled={busy || queuedAssets.length === 0}>
                 Run Batch
              </Button>
            }
         >
            <div className="overflow-auto max-h-[600px]">
               <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 border-b border-slate-100">
                     <tr>
                        <th className="py-2">Lesson</th>
                        <th className="py-2">Prompt Preview</th>
                        <th className="py-2">Status</th>
                     </tr>
                  </thead>
                  <tbody>
                     {assets.map(a => (
                        <tr key={a.id} className="border-b border-slate-50 last:border-0">
                           <td className="py-3 font-mono text-xs">{a.edition_id}</td>
                           <td className="py-3 truncate max-w-xs text-slate-600">{a.prompt}</td>
                           <td className="py-3"><Pill tone={toneForStatus(a.status)}>{a.status}</Pill></td>
                        </tr>
                     ))}
                     {assets.length === 0 && <tr><td colSpan={3} className="py-8 text-center text-slate-400">Queue empty.</td></tr>}
                  </tbody>
               </table>
            </div>
         </Section>
      )}

      {/* JOBS TAB (Read Only / Bulk) */}
      {tab === "jobs" && (
         <Section title="Bulk Jobs" desc="Background processing for spreadsheet imports.">
             <div className="text-sm text-slate-600">
                To run bulk jobs, use the "Import" tool or check the status below.
             </div>
             {/* Simple table for bulk jobs */}
             <div className="mt-4 overflow-auto max-h-[500px]">
               <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 border-b border-slate-100">
                     <tr>
                        <th className="py-2">Job ID</th>
                        <th className="py-2">Subject</th>
                        <th className="py-2">Topic</th>
                        <th className="py-2">Status</th>
                     </tr>
                  </thead>
                  <tbody>
                     {jobs.map(j => (
                        <tr key={j.id} className="border-b border-slate-50 last:border-0">
                           <td className="py-3 font-mono text-xs">{j.job_id}</td>
                           <td className="py-3">{j.subject}</td>
                           <td className="py-3">{j.topic}</td>
                           <td className="py-3"><Pill tone={toneForStatus(j.status)}>{j.status}</Pill></td>
                        </tr>
                     ))}
                     {jobs.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-slate-400">No bulk jobs.</td></tr>}
                  </tbody>
               </table>
            </div>
         </Section>
      )}
    </div>
  );
}