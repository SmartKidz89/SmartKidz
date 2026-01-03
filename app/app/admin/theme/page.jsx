"use client";

import { useEffect, useState } from "react";
import { Page as PageScaffold } from "@/components/ui/PageScaffold";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Save, Plus, Trash2 } from "lucide-react";

function asRows(theme) {
  return Object.entries(theme || {}).map(([key, value]) => ({ key, value }));
}

export default function AdminThemePage() {
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  async function load() {
    setBusy(true); setMsg(null);
    try {
      const res = await fetch("/api/admin/theme");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load theme");
      setRows(asRows(data.theme));
    } catch (e) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => { load(); }, []);

  function add() {
    setRows((r) => [...r, { key: "NEW_KEY", value: "" }]);
  }

  function update(i, patch) {
    setRows((r) => r.map((x, idx) => idx === i ? { ...x, ...patch } : x));
  }

  function del(i) {
    setRows((r) => r.filter((_, idx) => idx !== i));
  }

  async function save() {
    setBusy(true); setMsg(null);
    try {
      const theme = {};
      for (const r of rows) {
        const k = String(r.key || "").trim();
        if (!k) continue;
        theme[k] = String(r.value ?? "");
      }
      const res = await fetch("/api/admin/theme", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ theme }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Save failed");
      setMsg("Saved");
      await load();
    } catch (e) {
      setMsg(e.message);
    } finally {
      setBusy(false);
      setTimeout(() => setMsg(null), 1500);
    }
  }

  return (
    <PageScaffold title="Theme">
      <main className="min-h-[70vh]">
        <div className="container-pad py-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm text-slate-600">
                Store global theme tokens (CSS variables, feature flags, etc.). Your components can read them server-side.
              </div>
              {msg && <div className="mt-2 text-sm font-semibold text-slate-800">{msg}</div>}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={add}>
                <span className="inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Add</span>
              </Button>
              <Button onClick={save} disabled={busy}>
                <span className="inline-flex items-center gap-2"><Save className="w-4 h-4" /> Save</span>
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            {rows.map((r, i) => (
              <Card key={`${r.key}-${i}`} className="p-4">
                <div className="grid gap-3 lg:grid-cols-[360px_1fr_120px] lg:items-end">
                  <label className="grid gap-1 text-sm font-semibold text-slate-800">
                    Key
                    <input
                      className="h-11 rounded-2xl border border-slate-300 px-4"
                      value={r.key}
                      onChange={(e) => update(i, { key: e.target.value })}
                      placeholder="e.g., --brand-primary"
                    />
                  </label>
                  <label className="grid gap-1 text-sm font-semibold text-slate-800">
                    Value
                    <input
                      className="h-11 rounded-2xl border border-slate-300 px-4"
                      value={r.value}
                      onChange={(e) => update(i, { value: e.target.value })}
                      placeholder="#0f172a"
                    />
                  </label>
                  <Button variant="ghost" onClick={() => del(i)}>
                    <span className="inline-flex items-center gap-2 text-rose-700"><Trash2 className="w-4 h-4" /> Delete</span>
                  </Button>
                </div>
              </Card>
            ))}
            {!busy && rows.length === 0 && (
              <div className="text-sm text-slate-600">No theme tokens defined.</div>
            )}
          </div>
        </div>
      </main>
    </PageScaffold>
  );
}
