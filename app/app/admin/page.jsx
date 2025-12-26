"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getSupabaseClient } from "../../../lib/supabaseClient";
import PaywallGate from '@/components/app/PaywallGate';

import { Page as PageScaffold } from "@/components/ui/PageScaffold";;
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
  const [token, setToken] = useState("");

  async function exportClientSide() {
    setBusy(true); setMsg(null);
    try {
      const { data, error } = await supabase
        .from("lessons")
        .select("id,year_level,subject_id,title,topic,content_json,created_at")
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
        body: JSON.stringify({ token })
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
          <Card className="p-6">
            <div className="text-2xl font-extrabold">Admin Tools</div>
            <p className="mt-2 text-slate-700 max-w-2xl">
              Export or import your curriculum data so you are never locked into a platform. Use client-side export for lessons (fast),
              or protected server export/import for full datasets.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Button onClick={exportClientSide} disabled={busy}>
                {busy ? "Working…" : "Export lessons (JSON + CSV)"}
              </Button>
              <Button variant="outline" href="/admin/import">
                Import lessons (JSON)
              </Button>
              <Button variant="outline" href="/app/admin/content">
                Content manager (edit lessons)
              </Button>
            </div>

            <div className="mt-8 rounded-2xl border border-slate-200 p-4">
              <div className="font-bold">Optional: Protected server export</div>
              <p className="text-sm text-slate-600 mt-1">
                If you set <code className="font-mono">ADMIN_EXPORT_TOKEN</code> in your environment, you can export multiple tables safely via the server.
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
                <input
                  className="h-11 rounded-2xl border border-slate-300 px-4 outline-none focus:ring-2 focus:ring-slate-900/20"
                  placeholder="Admin export token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />
                <Button onClick={exportServerSide} disabled={busy || !token}>Server export</Button>
              </div>
            </div>

            {msg && (
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                {msg}
              </div>
            )}
          </Card>
        </PaywallGate>
      </div>
    </main>
  
    </PageScaffold>
  );
}