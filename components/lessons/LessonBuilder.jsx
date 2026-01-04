"use client";

import { useEffect, useMemo, useState } from "react";
import AdminNotice from "../admin/AdminNotice";
import { Sparkles, Server, Save, UploadCloud, FileSpreadsheet, Eye, Search, Database, ListFilter, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button, Input, Select } from "@/components/admin/AdminControls";
import AdminLessonPlayer from "@/components/admin/AdminLessonPlayer";

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
  const [tab, setTab] = useState("interactive"); // interactive | import | jobs | assets | preview
  const [jobs, setJobs] = useState([]);
  const [existingLessons, setExistingLessons] = useState([]);
  const [assets, setAssets] = useState([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  // Preview State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [previewLesson, setPreviewLesson] = useState(null);

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

  const [selectedJobId, setSelectedJobId] = useState(""); 

  const [lastResult, setLastResult] = useState(null);

  async function refresh() {
    try {
      // Fetch jobs, assets AND existing lessons to check for dupes
      // We can check lesson_generation_jobs status OR check actual lesson tables
      const [j, a, l] = await Promise.all([
        fetch("/api/admin/lesson-jobs").then((r) => r.json()),
        fetch("/api/admin/lesson-assets").then((r) => r.json()),
        // For dupes, we ideally want a lightweight list of existing lessons.
        // Reusing the content list endpoint or adding a specific check endpoint is best.
        // For now, let's just use the jobs list statuses if they are marked 'completed'.
        // Or fetch a lightweight catalog if available.
        // Let's assume the jobs list has status='completed' for generated ones.
        Promise.resolve({ data: [] }) 
      ]);
      
      if (j?.data) {
         setJobs(j.data);
         // Build a set of "already generated" job IDs based on status
         const completed = j.data.filter(x => x.status === 'completed');
         setExistingLessons(completed); 
      }
      if (a?.data) setAssets(a.data);

    } catch (e) {
      setNotice({ tone: "danger", title: "Refresh failed", text: e?.message || String(e) });
    }
  }

  useEffect(() => { refresh(); }, []);

  // Check if current form selection matches an existing completed job
  const isDuplicate = useMemo(() => {
    if (!selectedJobId) return false;
    // Check if THIS specific job ID is already marked completed
    const job = jobs.find(j => j.job_id === selectedJobId || j.id === selectedJobId);
    if (job && job.status === 'completed') return true;
    
    // Fallback: check if we have a completed job with same subject/year/topic/subtopic
    return existingLessons.some(l => 
       l.subject === form.subject &&
       String(l.year_level) === String(form.year) &&
       l.topic === form.topic &&
       l.subtopic === form.subtopic
    );
  }, [selectedJobId, form, jobs, existingLessons]);


  // Filter logic for spreadsheet jobs
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

  async function searchLessons() {
    if (!searchQuery) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/lesson-jobs`); 
      const { data } = await res.json();
      
      if (data) {
         const filtered = data.filter(j => 
            j.topic?.toLowerCase().includes(searchQuery.toLowerCase()) || 
            j.job_id?.toLowerCase().includes(searchQuery.toLowerCase())
         );
         setSearchResults(filtered);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  }
  
  async function loadPreview(jobId) {
     setBusy(true);
     try {
        const job = jobs.find(j => j.job_id === jobId || j.id === jobId);
        const editionId = job?.supabase_lesson_id || jobId; 
        
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        
        const { data, error } = await supabase
           .from("lesson_editions")
           .select("*, lesson_content_items(*)")
           .eq("edition_id", editionId)
           .single();
           
        if (error) throw error;
        setPreviewLesson(data);
        
     } catch (e) {
        setNotice({ tone: "danger", title: "Load Failed", text: "Could not load lesson content. " + e.message });
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

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setBusy(true);
    setNotice(null);

    const fd = new FormData();
    fd.append("file", file);

    try {
       const res = await fetch("/api/admin/lesson-jobs/import-xlsx", {
         method: "POST",
         body: fd
       });
       const data = await res.json();
       if(!res.ok) throw new Error(data.error || "Import failed");
       
       setNotice({ 
         tone: "success", 
         title: "Import Successful", 
         text: `Imported ${data.jobs_imported} jobs. Check the Jobs tab.` 
       });
       setTab("jobs");
       refresh();
    } catch(err) {
       setNotice({ tone: "danger", title: "Import Failed", text: err.message });
    } finally {
       setBusy(false);
       e.target.value = ""; 
    }
  }

  async function loadPresets() {
    if(!confirm("Load default lesson jobs into the queue?")) return;
    setBusy(true);
    setNotice(null);
    try {
       const res = await fetch("/api/admin/lesson-jobs/seed-preset", { method: "POST" });
       const data = await res.json();
       if(!res.ok) throw new Error(data.error || "Failed");
       
       setNotice({ 
         tone: "success", 
         title: "Presets Loaded", 
         text: `Added ${data.count} jobs to the queue.` 
       });
       refresh();
    } catch(err) {
       setNotice({ tone: "danger", title: "Error", text: err.message });
    } finally {
       setBusy(false);
    }
  }

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
          Interactive
        </button>
        <button
          className={`rounded-xl px-3 py-2 text-sm border ${tab === "preview" ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 hover:bg-slate-50"}`}
          onClick={() => setTab("preview")}
        >
          <Eye className="w-4 h-4 inline mr-2" />
          Preview
        </button>
        <button
          className={`rounded-xl px-3 py-2 text-sm border ${tab === "import" ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 hover:bg-slate-50"}`}
          onClick={() => setTab("import")}
        >
          <FileSpreadsheet className="w-4 h-4 inline mr-2" />
          Import
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

      {/* PREVIEW TAB */}
      {tab === "preview" && (
         <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
            <div className="space-y-4">
               <Section title="Find Lesson" desc="Search by ID or Topic">
                  <div className="flex gap-2">
                     <Input 
                       value={searchQuery} 
                       onChange={e => { setSearchQuery(e.target.value); searchLessons(); }} 
                       placeholder="Search..." 
                     />
                     <Button tone="secondary" onClick={searchLessons} disabled={busy}><Search className="w-4 h-4" /></Button>
                  </div>
                  <div className="mt-4 space-y-2 max-h-[500px] overflow-y-auto">
                     {jobs.filter(j => !searchQuery || j.topic?.toLowerCase().includes(searchQuery.toLowerCase())).map(j => (
                        <button 
                          key={j.id} 
                          onClick={() => loadPreview(j.id)}
                          className={`w-full text-left p-3 rounded-xl border transition-colors ${previewLesson?.template_id === j.job_id ? "bg-indigo-50 border-indigo-200 text-indigo-900" : "bg-white border-slate-200 hover:bg-slate-50"}`}
                        >
                           <div className="font-bold text-sm truncate">{j.topic}</div>
                           <div className="text-xs text-slate-500 truncate">{j.supabase_lesson_id || j.job_id}</div>
                        </button>
                     ))}
                  </div>
               </Section>
            </div>
            <div>
               {previewLesson ? (
                  <AdminLessonPlayer lessonData={previewLesson} />
               ) : (
                  <div className="h-[600px] rounded-3xl border-4 border-dashed border-slate-200 flex items-center justify-center text-slate-400 font-bold">
                     Select a lesson to preview
                  </div>
               )}
            </div>
         </div>
      )}

      {/* INTERACTIVE TAB */}
      {tab === "interactive" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-2 space-y-6">
              <Section title="Lesson Parameters" desc="Select from imported spreadsheet jobs or create manually.">
                 
                 {/* Filters */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Subject</label>
                       <Select 
                         value={form.subject} 
                         onChange={e => { setForm({...form, subject: e.target.value}); setSelectedJobId(""); }}
                       >
                          {availableSubjects.length > 0 ? (
                             availableSubjects.map(s => <option key={s} value={s}>{s}</option>)
                          ) : (
                             <>
                               <option value="Mathematics">Mathematics</option>
                               <option value="English">English</option>
                               <option value="Science">Science</option>
                             </>
                          )}
                       </Select>
                    </div>
                    <div>
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Year Level</label>
                       <Select 
                         value={form.year} 
                         onChange={e => { setForm({...form, year: e.target.value}); setSelectedJobId(""); }}
                       >
                          {availableYears.length > 0 ? (
                             availableYears.map(y => <option key={y} value={y}>{y.replace(/^\D+/g, '')}</option>)
                          ) : (
                             [1,2,3,4,5,6].map(y => <option key={y} value={y}>Year {y}</option>)
                          )}
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
                       {isDuplicate && (
                          <span className="ml-auto flex items-center gap-1 text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full text-xs">
                             <AlertTriangle className="w-3 h-3" /> Already Generated
                          </span>
                       )}
                    </div>
                    {filteredJobs.length > 0 ? (
                       <Select 
                         value={selectedJobId} 
                         onChange={e => selectJob(e.target.value)}
                         className="bg-white"
                       >
                          <option value="">-- Choose Topic --</option>
                          {filteredJobs.map(j => (
                             <option key={j.job_id || j.id} value={j.job_id || j.id}>
                                {j.topic} {j.subtopic ? ` - ${j.subtopic}` : ""} ({toneForStatus(j.status)})
                             </option>
                          ))}
                       </Select>
                    ) : (
                       <div className="text-xs text-slate-500 bg-white p-3 rounded-lg border border-slate-200 italic">
                         No jobs match <strong>{form.subject}</strong> Year <strong>{form.year}</strong>. <br/>
                         Check your spreadsheet data or change the filters above.
                       </div>
                    )}
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

                 <div className="flex justify-end gap-3">
                    {isDuplicate && (
                       <div className="text-xs text-amber-600 font-bold self-center">
                          Warning: This lesson exists. Generating again will overwrite or create a new edition.
                       </div>
                    )}
                    <Button onClick={handleGenerate} disabled={busy} className="h-12 px-6 shadow-md">
                       <Sparkles className="w-5 h-5 mr-2" />
                       {busy ? "Generating (approx 30s)..." : isDuplicate ? "Regenerate" : "Generate & Save"}
                    </Button>
                 </div>
              </Section>

              {lastResult && (
                 <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-6 animate-in fade-in slide-in-from-bottom-2">
                    <h3 className="font-bold text-emerald-900 text-lg mb-2 flex items-center gap-2">
                       <CheckCircle2 className="w-5 h-5" /> Success!
                    </h3>
                    <div className="text-sm text-emerald-800 space-y-1">
                       <div><strong>Lesson ID:</strong> {lastResult.lesson_id}</div>
                       <div><strong>Questions:</strong> {lastResult.questions}</div>
                       <div><strong>Assets Queued:</strong> {lastResult.assets_queued}</div>
                    </div>
                    <div className="mt-4 flex gap-2">
                       <Button tone="ghost" onClick={() => setTab("assets")} className="text-emerald-700 hover:text-emerald-900">
                          View Asset Queue
                       </Button>
                       <Button tone="primary" onClick={() => { loadPreview(lastResult.lesson_id); setTab("preview"); }}>
                          Preview Now
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
                       </div>
                    )}
                 </div>
              </Section>
           </div>
        </div>
      )}

      {/* IMPORT TAB */}
      {tab === "import" && (
         <Section title="Import Spreadsheet" desc="Upload Excel (.xlsx) or CSV files containing lesson jobs.">
             <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:bg-white transition-colors cursor-pointer relative">
                <input 
                  type="file" 
                  accept=".xlsx, .xls, .csv" 
                  onChange={handleFileUpload} 
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={busy}
                />
                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 mb-3">
                   {busy ? <Server className="w-6 h-6 animate-pulse" /> : <UploadCloud className="w-6 h-6" />}
                </div>
                <div className="font-bold text-slate-900">
                   {busy ? "Uploading..." : "Click or Drag File"}
                </div>
                <div className="text-xs text-slate-500 mt-1">Supports Excel and CSV</div>
             </div>
             <div className="mt-6 text-sm text-slate-600">
                <p className="font-bold mb-2">Required Columns (Sheet: "Lesson Jobs")</p>
                <ul className="list-disc pl-5 space-y-1">
                   <li><code>job_id</code> (Unique ID)</li>
                   <li><code>subject</code> (Mathematics, English, etc.)</li>
                   <li><code>year_level</code> (1-6)</li>
                   <li><code>topic</code></li>
                   <li><code>subtopic</code></li>
                </ul>
             </div>
         </Section>
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
         <Section 
            title="Bulk Jobs" 
            desc="Background processing for spreadsheet imports."
            right={
               <Button tone="secondary" onClick={loadPresets} disabled={busy}>
                  <Database className="w-4 h-4 mr-2" /> Load Default Presets
               </Button>
            }
         >
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