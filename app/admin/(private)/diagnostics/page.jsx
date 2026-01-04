"use client";

import { useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/admin/AdminControls";
import { CheckCircle2, XCircle, Loader2, Play, AlertTriangle } from "lucide-react";

export default function DiagnosticsPage() {
  const [results, setResults] = useState({});
  const [running, setRunning] = useState(false);

  const TESTS = [
    { id: "health_summary", label: "Health Summary Check", url: "/api/admin/system/health" },
    { id: "health_deep", label: "Deep Health Check (LLM+Comfy)", url: "/api/admin/system/health?mode=deep" },
    { id: "integrations", label: "Integration Config Scan", url: "/api/admin/integrations/status" },
  ];

  async function runAll() {
    setRunning(true);
    setResults({});
    
    for (const t of TESTS) {
      try {
        const start = Date.now();
        const res = await fetch(t.url);
        const data = await res.json();
        const duration = Date.now() - start;
        
        setResults(prev => ({
          ...prev,
          [t.id]: {
            ok: res.ok,
            status: res.status,
            duration,
            data,
            error: !res.ok ? (data.error || res.statusText) : null
          }
        }));
      } catch (e) {
        setResults(prev => ({
          ...prev,
          [t.id]: { ok: false, error: e.message }
        }));
      }
    }
    setRunning(false);
  }

  return (
    <div>
      <AdminPageHeader title="Diagnostics" subtitle="Run connectivity tests to debug integration issues." />

      <div className="mb-6">
        <Button onClick={runAll} disabled={running} className="w-full sm:w-auto h-12 text-lg px-8">
           {running ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Running Tests...</> : <><Play className="w-5 h-5 mr-2 fill-current" /> Run Diagnostics</>}
        </Button>
      </div>

      <div className="space-y-6">
        {TESTS.map(t => {
           const res = results[t.id];
           if (!res && !running) return null;

           return (
             <div key={t.id} className={`p-6 rounded-2xl border shadow-sm ${!res ? "bg-slate-50 border-slate-200 opacity-50" : res.ok ? "bg-white border-emerald-200" : "bg-white border-rose-200"}`}>
                <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center gap-3">
                      {res ? (
                         res.ok ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <XCircle className="w-6 h-6 text-rose-500" />
                      ) : (
                         <div className="w-6 h-6 rounded-full border-2 border-slate-300" />
                      )}
                      <h3 className="text-lg font-bold text-slate-900">{t.label}</h3>
                   </div>
                   {res && <span className="text-xs font-mono text-slate-500">{res.duration}ms</span>}
                </div>

                {res && !res.ok && (
                   <div className="p-4 bg-rose-50 rounded-xl border border-rose-100 text-sm text-rose-800 font-mono whitespace-pre-wrap mb-4">
                      ERROR: {res.error}
                   </div>
                )}

                {res?.data && (
                   <div className="space-y-2">
                      {/* LLM Specifics */}
                      {res.data.llm && (
                        <div className={`p-3 rounded-lg border text-sm ${res.data.llm.status === 'connected' ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
                           <div className="font-bold flex items-center gap-2">
                              LLM: {res.data.llm.status}
                              {res.data.llm.fix && <span className="px-2 py-0.5 bg-white rounded text-xs border border-amber-200 text-amber-700">Fix Available</span>}
                           </div>
                           {res.data.llm.error && <div className="mt-1 text-rose-700 font-mono text-xs">{res.data.llm.error}</div>}
                           {res.data.llm.fix && <div className="mt-2 font-bold text-amber-800 flex gap-2"><AlertTriangle className="w-4 h-4" /> {res.data.llm.fix}</div>}
                        </div>
                      )}
                      
                      {/* ComfyUI Specifics */}
                      {res.data.comfy && (
                        <div className={`p-3 rounded-lg border text-sm ${res.data.comfy.status === 'connected' ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
                           <div className="font-bold flex items-center gap-2">
                              Image Gen: {res.data.comfy.status}
                              {res.data.comfy.fix && <span className="px-2 py-0.5 bg-white rounded text-xs border border-amber-200 text-amber-700">Fix Available</span>}
                           </div>
                           <div className="text-xs text-slate-500 mt-1">URL: {res.data.comfy.url}</div>
                           {res.data.comfy.error && <div className="mt-1 text-rose-700 font-mono text-xs">{res.data.comfy.error}</div>}
                           {res.data.comfy.fix && <div className="mt-2 font-bold text-amber-800 flex gap-2"><AlertTriangle className="w-4 h-4" /> {res.data.comfy.fix}</div>}
                        </div>
                      )}

                      <div className="mt-4">
                         <details className="text-xs text-slate-500 cursor-pointer">
                            <summary className="hover:text-slate-800">View Raw JSON</summary>
                            <pre className="mt-2 p-3 bg-slate-900 text-emerald-400 rounded-lg overflow-auto max-h-60">
                               {JSON.stringify(res.data, null, 2)}
                            </pre>
                         </details>
                      </div>
                   </div>
                )}
             </div>
           );
        })}
      </div>
    </div>
  );
}