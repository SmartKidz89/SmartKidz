"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import PaywallGate from '@/components/app/PaywallGate';

import { Page as PageScaffold } from "@/components/ui/PageScaffold";;
export default function ImportPage() {
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [fileName, setFileName] = useState("");

  async function onFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    const text = await f.text();
    setBusy(true); setMsg(null);
    try {
      const res = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, payload: JSON.parse(text) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Import failed");
      setMsg(`Imported/updated ${data.upserted} lessons.`);
    } catch (err) {
      setMsg(err?.message || "Import failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    
    <PageScaffold title="Import">
<main className="bg-gradient-to-br from-indigo-50 via-white to-cyan-50 min-h-[70vh]">
      <div className="container-pad py-10">
        <PaywallGate>
          <Card className="p-6 max-w-2xl mx-auto">
            <div className="text-2xl font-extrabold">Import Lessons</div>
            <p className="mt-2 text-slate-700">
              Upload a JSON export of lessons to upsert them into Supabase. This endpoint is protected by an admin token.
            </p>

            <div className="mt-5 grid gap-2">
              <label className="text-sm font-semibold text-slate-700">Admin import token</label>
              <input
                className="h-11 rounded-2xl border border-slate-300 px-4 outline-none focus:ring-2 focus:ring-slate-900/20"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Set ADMIN_IMPORT_TOKEN in env, paste here"
              />
            </div>

            <div className="mt-5">
              <input type="file" accept="application/json" onChange={onFile} disabled={!token || busy} />
              <div className="text-xs text-slate-600 mt-2">{fileName ? `Selected: ${fileName}` : "Choose a JSON file to import."}</div>
            </div>

            {msg && (
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                {msg}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <Button href="/admin" variant="secondary">Back</Button>
              <Button href="/app" variant="outline">Go to app</Button>
            </div>
          </Card>
        </PaywallGate>
      </div>
    </main>
  
    </PageScaffold>
  );
}