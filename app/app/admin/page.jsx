"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getSupabaseClient } from "../../../lib/supabaseClient";
import PaywallGate from '@/components/app/PaywallGate';
import { Page as PageScaffold } from "@/components/ui/PageScaffold";
import { Factory, FileJson, ArrowRight, Download, LayoutPanelTop } from "lucide-react";

function download(filename, contentType, text) {
  const blob = new Blob([text], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function toCSV(rows, headers) {
  const escape = (v) => {
    if (v === null || v === undefined) return "";
    const s = typeof v === "string" ? v : JSON.stringify(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  return [
    headers.join(","),
    ...rows.map(r => headers.map(h => escape(r[h])).join(","))
  ].join("\n");
}

export default function Admin() {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  
  // Tokens
  const [exportToken, setExportToken] = useState("");

  async function exportClientSide() {
    setBusy(true); setMsg(null);
    try {
      const { data, error } = await supabase
        .from("lesson_editions")
        .select("edition_id,title,country_code,lesson_templates!inner(subject_id,year_level,topic)")
        .order("year_level", { ascending: true })
        .order("subject_id", { ascending: true });

      if (error) throw error;

      download("smart-kidz-lessons.json", "application/json", JSON.stringify(data, null, 2));

      const headers = ["id","year_level","subject_id","title","topic","content_json","created_at"];
      download("smart-kidz-lessons.csv", "text/csv", toCSV(data, headers));

      setMsg("Exported lessons to JSON + CSV.");
    } catch (e) {
      setMsg(e?.message || "Export failed");
    } finally {
      setBusy(false);
    }
  }

  async function exportServerSide() {
    setBusy(true); setMsg(null);
    try {
      const res = await fetch("/api/admin/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: exportToken })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Server export failed");

      download("smart-kidz-export.json", "application/json", JSON.stringify(data, null, 2));
      setMsg("Server export completed (includes more tables if present).");
    } catch (e) {
      setMsg(e?.message || "Server export failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageScaffold title="Admin">
      <main className="bg-gradient-to-br from-slate-50 to-white min-h-[70vh]">
        <div className="container-pad py-10">
          <PaywallGate>
            <div className="grid gap-6">
              
              {/* Primary Navigation */}
              <div className="grid md:grid-cols-3 gap-4">
                <Button href="/app/admin/generate" className="h-24 text-xl shadow-xl bg-indigo-600 hover:bg-indigo-700 border-none">
                   <Factory className="w-8 h-8 mr-3" /> 
                   <div className="text-left">
                     <div className="font-black">Curriculum Factory</div>
                     <div className="text-sm font-normal opacity-80">Generators: Assets, Lessons, Email</div>
                   </div>
                   <ArrowRight className="ml-auto opacity-50" />
                </Button>

                <Button href="/app/admin/content" variant="secondary" className="h-24 text-xl border-2 hover:border-slate-300">
                   <FileJson className="w-8 h-8 mr-3 text-slate-500" />
                   <div className="text-left">
                     <div className="font-black text-slate-900">Content Manager</div>
                     <div className="text-sm font-normal text-slate-500">Edit existing JSON lessons</div>
                   </div>
                   <ArrowRight className="ml-auto opacity-30 text-slate-400" />
                </Button>

                <Button href="/app/admin/site-builder" variant="secondary" className="h-24 text-xl border-2 hover:border-slate-300">
                   <LayoutPanelTop className="w-8 h-8 mr-3 text-slate-500" />
                   <div className="text-left">
                     <div className="font-black text-slate-900">Site Builder</div>
                     <div className="text-sm font-normal text-slate-500">Create and edit pages</div>
                   </div>
                   <ArrowRight className="ml-auto opacity-30 text-slate-400" />
                </Button>
              </div>

              <Card className="p-6">
                <div className="text-xl font-extrabold mb-4">Data Export</div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="font-bold text-slate-700 mb-1">Quick Export</div>
                    <p className="text-xs text-slate-500 mb-3">Download all lessons currently loaded in the browser.</p>
                    <Button onClick={exportClientSide} disabled={busy} size="sm" variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-2" /> Download JSON/CSV
                    </Button>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="font-bold text-slate-700 mb-1">Full Server Export</div>
                    <p className="text-xs text-slate-500 mb-3">Requires <code className="bg-white px-1 rounded">ADMIN_EXPORT_TOKEN</code>.</p>
                    <div className="flex gap-2">
                      <input
                        className="h-9 flex-1 rounded-xl border border-slate-300 px-3 text-xs outline-none focus:ring-2 focus:ring-slate-900/20"
                        placeholder="Token"
                        type="password"
                        value={exportToken}
                        onChange={(e) => setExportToken(e.target.value)}
                      />
                      <Button onClick={exportServerSide} disabled={busy || !exportToken} size="sm">Export</Button>
                    </div>
                  </div>
                </div>

                {msg && (
                  <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 font-medium">
                    {msg}
                  </div>
                )}
              </Card>

              <div className="flex justify-center">
                 <Button href="/app/admin/import" variant="ghost" size="sm">
                    Looking for Import Tool?
                 </Button>
              </div>

            </div>
          </PaywallGate>
        </div>
      </main>
    </PageScaffold>
  );
}