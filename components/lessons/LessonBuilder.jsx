"use client";

import { useEffect, useMemo, useState } from "react";
import AdminNotice from "../admin/AdminNotice";
import { Sparkles, Server, Save, UploadCloud, FileSpreadsheet, Eye, Search, Database, ListFilter, CheckCircle2, AlertTriangle, Play, HelpCircle, Code, RotateCcw } from "lucide-react";
import { Button, Input, Select, Textarea } from "@/components/admin/AdminControls";
import AdminLessonPlayer from "@/components/admin/AdminLessonPlayer";

function Pill({ children, tone = "slate", title }) {
  const toneMap = {
    slate: "bg-slate-100 text-slate-700",
    green: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-rose-100 text-rose-700",
    blue: "bg-blue-100 text-blue-700",
  };
  return (
    <span 
      title={title}
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium cursor-help ${toneMap[tone] || toneMap.slate}`}
    >
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
  const [tab, setTab] = useState("interactive"); // interactive | import | jobs | assets | preview
  const [jobs, setJobs] = useState([]);
  const [existingLessons, setExistingLessons] = useState([]);
  const [assets, setAssets] = useState([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  // Preview / Editor State
  const [searchQuery, setSearchQuery] = useState("");
  const [previewLesson, setPreviewLesson] = useState(null);
  const [viewMode, setViewMode] = useState("player"); // player | json
  const [jsonContent, setJsonContent] = useState("");

  // Interactive Form State
  const [form, setForm] = useState({
    subject: "Mathematics",
    year: "3",
    topic: "Fractions",
    strand: "Number",
    subtopic: "Equivalent Fractions",
    useLocalLLM: false,
    llmUrl: "http://127.0.0.1:11434/v1",
    llmModel: "llama3",
  });

  const [selectedJobId, setSelectedJobId] = useState(""); 
  const [lastResult, setLastResult] = useState(null);

  async function refresh() {
    try {
      const [j, a] = await Promise.all([
        fetch("/api/admin/lesson-jobs").then((r) => r.json()),
        fetch("/api/admin/lesson-assets").then((r) => r.json()),
      ]);
      
      if (j?.data) {
         setJobs(j.data);
         const completed = j.data.filter(x => x.status === 'completed');
         setExistingLessons(completed); 
      }
      if (a?.data) setAssets(a.data);

    } catch (e) {
      setNotice({ tone: "danger", title: "Refresh failed", text: e?.message || String(e) });
    }
  }

  useEffect(() => { refresh(); }, []);

  const isDuplicate = useMemo(() => {
    if (!selectedJobId) return false;
    const job = jobs.find(j => j.job_id === selectedJobId || j.id === selectedJobId);
    if (job && job.status === 'completed') return true;
    
    return existingLessons.some(l => 
       l.subject === form.subject &&
       String(l.year_level) === String(form.year) &&
       l.topic === form.topic &&
       l.subtopic === form.subtopic
    );
  }, [selectedJobId, form, jobs, existingLessons]);

  const availableSubjects = useMemo(() => [...new Set(jobs.map(j => j.subject).filter(Boolean))].sort(), [jobs]);
  const availableYears = useMemo(() => [...new Set(jobs.map(j => String(j.year_level)).filter(Boolean))].sort(), [jobs]);
  
  const filteredJobs = useMemo(() => {
    return jobs.filter(j => 
       String(j.subject) === form.subject && 
       String(j.year_level) === String(form.year)
    );
  }, [jobs, form.subject, form.year]);

  function selectJob(jobId) {
    setSelectedJobId(jobId);
    const job = jobs.find(j => j.job_id === jobId || j.id === jobId);
    if (job) {
      setForm(prev => ({
        ...prev,
        strand: job.topic || "",      
        topic: job.subtopic || job.topic || "", 
        subtopic: job.subtopic || "", 
      }));
    }
  }

  async function loadPreview(jobId) {
     setBusy(true);
     setNotice(null);
     try {
        const job = jobs.find(j => j.job_id === jobId || j.id === jobId);
        const editionId = job?.supabase_lesson_id || jobId; 
        
        const res = await fetch(`/api/admin/lesson/preview?edition_id=${encodeURIComponent(editionId)}`);
        const json = await res.json();
        
        if (!res.ok) throw new Error(json.error || "Failed to load preview");
        
        setPreviewLesson(json.data);
        
        // Prepare JSON editor
        const rawJson = json.data.wrapper_json || json.data.content_json || {};
        setJsonContent(JSON.stringify(rawJson, null, 2));

     } catch (e) {
        setNotice({ tone: "danger", title: "Load Failed", text: e.message });
     } finally {
        setBusy(false);
     }
  }

  async function saveJsonEdit() {
     if (!previewLesson?.edition_id) return;
     setBusy(true);
     setNotice(null);

     try {
        const parsed = JSON.parse(jsonContent); // Validate JSON first
        
        const res = await fetch("/api/admin/lesson/update", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ 
              edition_id: previewLesson.edition_id,
              content_json: parsed
           })
        });

        if (!res.ok) throw new Error("Save failed");

        setNotice({ tone: "success", title: "Saved", text: "Lesson updated successfully. Reloading preview..." });
        await loadPreview(previewLesson.edition_id);
        setViewMode("player");

     } catch (e) {
        setNotice({ tone: "danger", title: "Save Failed", text: e.message });
     } finally {
        setBusy(false);
     }
  }

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
      
      await refresh(); 

    } catch (e) {
      setNotice({ tone: "danger", title: "Generation failed", text: e.message });
    } finally {
      setBusy(false);
    }
  }

  // ... (keep handleFileUpload, runLessonBatch, runAssetBatch same as before) ...
  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true); setNotice(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
       const res = await fetch("/api/admin/lesson-jobs/import-xlsx", { method: "POST", body: fd });
       const data = await res.json();
       if(!res.ok) throw new Error(data.error || "Import failed");
       setNotice({ tone: "success", title: "Import Successful", text: `Imported ${data.jobs_imported} jobs.` });
       setTab("jobs");
       refresh();
    } catch(err) { setNotice({ tone: "danger", title: "Import Failed", text: err.message }); }
    finally { setBusy(false); e.target.value = ""; }
  }

  async function loadPresets() {
    if(!confirm("Load default lesson jobs into the queue?")) return;
    setBusy(true); setNotice(null);
    try {
       const res = await fetch("/api/admin/lesson-jobs/seed-preset", { method: "POST" });
       const data = await res.json();
       if(!res.ok) throw new Error(data.error || "Failed");
       setNotice({ tone: "success", title: "Presets Loaded", text: `Added ${data.count} jobs.` });
       refresh();
    } catch(err) { setNotice({ tone: "danger", title: "Error", text: err.message }); }
    finally { setBusy(false); }
  }

  async function runLessonBatch() {
     if(!confirm("Run batch?")) return;
     setBusy(true); setNotice(null);
     try {
        const res = await fetch("/api/admin/lesson-jobs/run", { 
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ limit: 25 }) 
        });
        const out = await res.json();
        setNotice({ tone: "success", title: "Batch Processed", text: `Processed ${out.processed} jobs.` });
        refresh();
     } catch (e) { setNotice({ tone: "danger", title: "Error", text: e.message }); }
     finally { setBusy(false); }
  }

  async function runAssetBatch() {
     setBusy(true); setNotice(null);
     try {
        const res = await fetch("/api/admin/lesson-assets/run-batch", { method: "POST", body: JSON.stringify({ limit: 25 }) });
        const out = await res.json();
        setNotice({ tone: "success", title: "Assets Processed", text: `Success: ${out.ok}, Failed: ${out.failed}` });
        refresh();
     } catch (e) { setNotice({ tone: "danger", text: e.message }); }
     setBusy(false);
  }

  const queuedAssets = assets.filter(a => (a.status || "").toLowerCase() === "queued");
  const queuedJobsCount = jobs.filter(j => (j.status || "").toLowerCase() === "queued").length;

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button className={`rounded-xl px-3 py-2 text-sm border font-bold ${tab === "interactive" ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 hover:bg-slate-50"}`} onClick={() => setTab("interactive")}>
          <Sparkles className="w-4 h-4 inline mr-2" /> Interactive
        </button>
        <button className={`rounded-xl px-3 py-2 text-sm border ${tab === "preview" ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 hover:bg-slate-50"}`} onClick={() => setTab("preview")}>
          <Eye className="w-4 h-4 inline mr-2" /> Preview
        </button>
        <button className={`rounded-xl px-3 py-2 text-sm border ${tab === "import" ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 hover:bg-slate-50"}`} onClick={() => setTab("import")}>
          <FileSpreadsheet className="w-4 h-4 inline mr-2" /> Import
        </button>
        <button className={`rounded-xl px-3 py-2 text-sm border ${tab === "jobs" ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 hover:bg-slate-50"}`} onClick={() => setTab("jobs")}>
          Bulk Jobs {queuedJobsCount > 0 && <span className="ml-1 bg-amber-100 text-amber-700 px-1.5 rounded-full text-xs">{queuedJobsCount}</span>}
        </button>
        <button className={`rounded-xl px-3 py-2 text-sm border ${tab === "assets" ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 hover:bg-slate-50"}`} onClick={() => setTab("assets")}>
          Asset Queue {queuedAssets.length > 0 && <span className="ml-1 bg-amber-100 text-amber-700 px-1.5 rounded-full text-xs">{queuedAssets.length}</span>}
        </button>
        <div className="ml-auto"><Button tone="secondary" onClick={refresh} disabled={busy}>Refresh</Button></div>
      </div>

      {notice && <AdminNotice tone={notice.tone} title={notice.title}>{notice.text}</AdminNotice>}

      {/* PREVIEW TAB */}
      {tab === "preview" && (
         <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
            <div className="space-y-4">
               <Section title="Find Lesson" desc="Search by ID or Topic">
                  <div className="flex gap-2">
                     <Input value={searchQuery} onChange={e => { setSearchQuery(e.target.value); }} placeholder="Search..." />
                  </div>
                  <div className="mt-4 space-y-2 max-h-[500px] overflow-y-auto">
                     {jobs.filter(j => !searchQuery || (j.topic || "").toLowerCase().includes(searchQuery.toLowerCase())).map(j => (
                        <button key={j.id} onClick={() => loadPreview(j.id)} className={`w-full text-left p-3 rounded-xl border transition-colors ${previewLesson?.template_id === j.job_id ? "bg-indigo-50 border-indigo-200 text-indigo-900" : "bg-white border-slate-200 hover:bg-slate-50"}`}>
                           <div className="font-bold text-sm truncate">{j.topic || "Untitled"}</div>
                           <div className="text-xs text-slate-500 truncate">{j.supabase_lesson_id || j.job_id}</div>
                        </button>
                     ))}
                  </div>
               </Section>
            </div>
            
            {/* Preview / Edit Area */}
            <div>
               {previewLesson ? (
                  <div className="space-y-4">
                     <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex gap-2">
                           <button onClick={() => setViewMode("player")} className={`px-4 py-2 rounded-lg text-sm font-bold ${viewMode === 'player' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                             <Play className="w-4 h-4 inline mr-2" /> Player
                           </button>
                           <button onClick={() => setViewMode("json")} className={`px-4 py-2 rounded-lg text-sm font-bold ${viewMode === 'json' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                             <Code className="w-4 h-4 inline mr-2" /> JSON Script
                           </button>
                        </div>
                        {viewMode === "json" && (
                           <Button onClick={saveJsonEdit} disabled={busy} className="shadow-md">
                              <Save className="w-4 h-4 mr-2" /> Save Changes
                           </Button>
                        )}
                     </div>

                     {viewMode === "player" ? (
                        <AdminLessonPlayer lessonData={previewLesson} />
                     ) : (
                        <div className="bg-slate-900 rounded-3xl p-4 shadow-2xl border-4 border-slate-800">
                           <Textarea 
                             value={jsonContent} 
                             onChange={e => setJsonContent(e.target.value)} 
                             className="min-h-[600px] font-mono text-xs bg-transparent text-emerald-400 border-none focus:ring-0 p-2"
                             spellCheck={false}
                           />
                        </div>
                     )}
                  </div>
               ) : (
                  <div className="h-[600px] rounded-3xl border-4 border-dashed border-slate-200 flex items-center justify-center text-slate-400 font-bold">
                     Select a lesson to preview
                  </div>
               )}
            </div>
         </div>
      )}

      {/* INTERACTIVE TAB (Generator) */}
      {tab === "interactive" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-2 space-y-6">
              <Section title="Lesson Parameters" desc="Create manually.">
                 {/* ... (Existing form inputs - kept same) ... */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Subject</label>
                       <Select value={form.subject} onChange={e => { setForm({...form, subject: e.target.value}); setSelectedJobId(""); }}>
                          {availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                       </Select>
                    </div>
                    <div>
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Year Level</label>
                       <Select value={form.year} onChange={e => { setForm({...form, year: e.target.value}); setSelectedJobId(""); }}>
                          {[1,2,3,4,5,6].map(y => <option key={y} value={y}>Year {y}</option>)}
                       </Select>
                    </div>
                 </div>

                 {/* Job Picker */}
                 <div className={`mb-6 p-4 rounded-xl border border-slate-200 transition-colors ${isDuplicate ? 'bg-amber-50 border-amber-200' : 'bg-slate-50'}`}>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 justify-between">
                       <div className="flex items-center gap-2">
                           <ListFilter className="w-4 h-4" /> Select Pending Job
                           {filteredJobs.length > 0 && <span className="bg-white border px-1.5 rounded-full text-xs text-slate-500">{filteredJobs.length}</span>}
                       </div>
                       {isDuplicate && <span className="ml-auto flex items-center gap-1 text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full text-xs"><AlertTriangle className="w-3 h-3" /> Already Generated</span>}
                    </div>
                    <Select value={selectedJobId} onChange={e => selectJob(e.target.value)} className="bg-white">
                        <option value="">-- Choose Topic --</option>
                        {filteredJobs.map(j => <option key={j.job_id || j.id} value={j.job_id || j.id}>{j.topic} {j.subtopic ? ` - ${j.subtopic}` : ""} ({toneForStatus(j.status)})</option>)}
                    </Select>
                 </div>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div><label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Strand</label><Input value={form.strand} onChange={e => setForm({...form, strand: e.target.value})} /></div>
                    <div><label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Topic</label><Input value={form.topic} onChange={e => setForm({...form, topic: e.target.value})} /></div>
                    <div><label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Subtopic</label><Input value={form.subtopic} onChange={e => setForm({...form, subtopic: e.target.value})} /></div>
                 </div>

                 <div className="flex justify-end gap-3">
                    <Button onClick={handleGenerate} disabled={busy} className="h-12 px-6 shadow-md"><Sparkles className="w-5 h-5 mr-2" /> {busy ? "Generating (approx 60s)..." : isDuplicate ? "Regenerate" : "Generate & Save"}</Button>
                 </div>
              </Section>

              {lastResult && (
                 <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-6 animate-in fade-in slide-in-from-bottom-2">
                    <h3 className="font-bold text-emerald-900 text-lg mb-2 flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Success!</h3>
                    <div className="text-sm text-emerald-800 space-y-1">
                       <div><strong>Lesson ID:</strong> {lastResult.lesson_id}</div>
                       <div><strong>Questions:</strong> {lastResult.questions}</div>
                       <div><strong>Assets Queued:</strong> {lastResult.assets_queued}</div>
                    </div>
                    <div className="mt-4 flex gap-2">
                       <Button tone="ghost" onClick={() => setTab("assets")} className="text-emerald-700 hover:text-emerald-900">View Asset Queue</Button>
                       <Button tone="primary" onClick={() => { loadPreview(lastResult.lesson_id); setTab("preview"); }}>Preview Now</Button>
                    </div>
                 </div>
              )}
           </div>

           <div className="lg:col-span-1 space-y-6">
              <Section title="AI Configuration" desc="Switch between Cloud and Local LLMs.">
                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <span className="text-sm font-bold text-slate-700">Use Local LLM</span>
                       <input type="checkbox" className="toggle" checked={form.useLocalLLM} onChange={e => setForm({...form, useLocalLLM: e.target.checked})} />
                    </div>
                    {form.useLocalLLM && (
                       <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 animate-in fade-in">
                          <div><label className="text-xs font-bold text-slate-500 uppercase">Base URL</label><Input value={form.llmUrl} onChange={e => setForm({...form, llmUrl: e.target.value})} placeholder="http://127.0.0.1:11434/v1" /></div>
                          <div><label className="text-xs font-bold text-slate-500 uppercase">Model Name</label><Input value={form.llmModel} onChange={e => setForm({...form, llmModel: e.target.value})} placeholder="qwen2.5:32b" /></div>
                       </div>
                    )}
                 </div>
              </Section>
           </div>
        </div>
      )}

      {/* OTHER TABS (Import, Assets, Jobs - kept consistent) */}
      {tab === "import" && <Section title="Import Spreadsheet" desc="Upload Excel (.xlsx) or CSV files."><div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 relative"><input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" disabled={busy} /><UploadCloud className="w-6 h-6 mb-2 text-slate-400" /><div className="font-bold text-slate-900">{busy ? "Uploading..." : "Click or Drag File"}</div></div></Section>}
      {tab === "assets" && <Section title="Generate Assets" desc="Process queued image requests." right={<Button onClick={() => runAssetBatch(25)} disabled={busy}>Run Batch</Button>}><div className="overflow-auto max-h-[600px]"><table className="w-full text-sm text-left"><thead className="text-xs text-slate-500 border-b border-slate-100"><tr><th className="py-2">Lesson</th><th className="py-2">Prompt</th><th className="py-2">Status</th></tr></thead><tbody>{assets.map(a => (<tr key={a.id} className="border-b border-slate-50 last:border-0"><td className="py-3 font-mono text-xs">{a.edition_id}</td><td className="py-3 truncate max-w-xs text-slate-600">{a.prompt}</td><td className="py-3"><Pill tone={toneForStatus(a.status)}>{a.status}</Pill></td></tr>))}</tbody></table></div></Section>}
      {tab === "jobs" && <Section title="Bulk Jobs" desc="Background processing." right={<div className="flex gap-2"><Button tone="secondary" onClick={loadPresets} disabled={busy}><Database className="w-4 h-4 mr-2" /> Load Defaults</Button><Button onClick={runLessonBatch} disabled={busy}><Play className="w-4 h-4 mr-2" /> Run Next 25</Button></div>}><div className="mt-4 overflow-auto max-h-[500px]"><table className="w-full text-sm text-left"><thead className="text-xs text-slate-500 border-b border-slate-100"><tr><th className="py-2">Job ID</th><th className="py-2">Subject</th><th className="py-2">Topic</th><th className="py-2">Status</th></tr></thead><tbody>{jobs.map(j => (<tr key={j.id} className="border-b border-slate-50 last:border-0"><td className="py-3 font-mono text-xs">{j.job_id}</td><td className="py-3">{j.subject}</td><td className="py-3">{j.topic}</td><td className="py-3"><Pill tone={toneForStatus(j.status)}>{j.status}</Pill></td></tr>))}</tbody></table></div></Section>}
    </div>
  );
}