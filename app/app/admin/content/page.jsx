"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import PaywallGate from "@/components/app/PaywallGate";
import { getSupabaseClient } from "@/lib/supabaseClient";

import { Page as PageScaffold } from "@/components/ui/PageScaffold";;
function safeJsonParse(raw, fallback) {
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export default function AdminContent() {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editor, setEditor] = useState({ title: "", year_level: 1, subject_id: "maths", topic: "", content_json: "{}" });
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    setLoading(true);
    setMsg(null);
    try {
      const { data, error } = await supabase
        .from("lesson_editions")
        .select("edition_id,title,country_code,lesson_templates!inner(subject_id,year_level,topic)")
        .order("updated_at", { ascending: false })
        .limit(150);
      if (error) throw error;
      setRows(data || []);
    } catch (e) {
      setMsg(e?.message || "Could not load lessons");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function openLesson(id) {
    setMsg(null);
    try {
      const { data, error } = await supabase.from("lesson_editions").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      setSelected(data);
      const content = data?.content_json || data?.content || data?.lesson_json || {};
      setEditor({
        title: data?.title || "",
        year_level: data?.year_level || 1,
        subject_id: data?.subject_id || "maths",
        topic: data?.topic || "",
        content_json: typeof content === "string" ? content : JSON.stringify(content, null, 2),
      });
    } catch (e) {
      setMsg(e?.message || "Could not open lesson");
    }
  }

  async function createNew() {
    setSelected({ id: null });
    setEditor({ title: "New lesson", year_level: 1, subject_id: "maths", topic: "", content_json: JSON.stringify({ overview: "", quiz: { questions: [] } }, null, 2) });
  }

  async function save() {
    setBusy(true);
    setMsg(null);
    try {
      const payload = {
        title: editor.title,
        year_level: Number(editor.year_level || 1),
        subject_id: editor.subject_id,
        topic: editor.topic,
        content_json: safeJsonParse(editor.content_json, {}),
        updated_at: new Date().toISOString(),
      };
      if (selected?.id) {
        const { error } = await supabase.from("lesson_editions").update(payload).eq("id", selected.id);
        if (error) throw error;
        setMsg("Saved lesson changes.");
      } else {
        const { data, error } = await supabase.from("lesson_editions").insert(payload).select("id").maybeSingle();
        if (error) throw error;
        setMsg("Created new lesson.");
        if (data?.id) await openLesson(data.id);
      }
      await refresh();
    } catch (e) {
      setMsg(e?.message || "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    
    <PageScaffold title="Content">
<main className="bg-gradient-to-br from-slate-50 to-white min-h-[70vh]">
      <div className="container-pad py-10">
        <PaywallGate>
          <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-2xl font-extrabold">Content Manager</div>
                <p className="mt-2 text-slate-700 max-w-2xl">
                  Edit lessons directly without code changes. This is intentionally simple and safe for launch; you can iterate into a full CMS later.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" href="/app/admin">Back</Button>
                <Button onClick={createNew}>New lesson</Button>
              </div>
            </div>

            {msg && <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">{msg}</div>}

            <div className="mt-6 grid gap-4 lg:grid-cols-[360px_1fr]">
              <Card className="p-4">
                <div className="font-bold">Lessons</div>
                <div className="mt-3 max-h-[560px] overflow-auto pr-2">
                  {loading ? (
                    <div className="text-sm text-slate-600">Loading…</div>
                  ) : (
                    <div className="space-y-2">
                      {rows.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => openLesson(r.id)}
                          className={`w-full text-left rounded-2xl border p-3 hover:bg-white transition ${selected?.id === r.id ? "border-slate-900 bg-white" : "border-slate-200 bg-white/60"}`}
                        >
                          <div className="font-extrabold text-slate-900">{r.title || `Lesson ${r.id}`}</div>
                          <div className="text-xs text-slate-600 mt-1">Year {r.year_level} • {r.subject_id}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-bold">Editor</div>
                    <div className="text-xs text-slate-600">JSON is validated on save. Invalid JSON will not be saved.</div>
                  </div>
                  <Button onClick={save} disabled={busy || !selected}> {busy ? "Saving…" : "Save"}</Button>
                </div>

                {!selected ? (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-700">
                    Select a lesson to edit or create a new one.
                  </div>
                ) : (
                  <div className="mt-4 grid gap-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Title
                        <input className="mt-1 h-11 w-full rounded-2xl border border-slate-300 px-4" value={editor.title} onChange={(e) => setEditor((p) => ({ ...p, title: e.target.value }))} />
                      </label>
                      <label className="text-sm font-semibold text-slate-700">
                        Topic
                        <input className="mt-1 h-11 w-full rounded-2xl border border-slate-300 px-4" value={editor.topic} onChange={(e) => setEditor((p) => ({ ...p, topic: e.target.value }))} />
                      </label>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Year level
                        <input type="number" min="1" max="10" className="mt-1 h-11 w-full rounded-2xl border border-slate-300 px-4" value={editor.year_level} onChange={(e) => setEditor((p) => ({ ...p, year_level: e.target.value }))} />
                      </label>
                      <label className="text-sm font-semibold text-slate-700">
                        Subject
                        <select className="mt-1 h-11 w-full rounded-2xl border border-slate-300 px-4" value={editor.subject_id} onChange={(e) => setEditor((p) => ({ ...p, subject_id: e.target.value }))}>
                          <option value="maths">Maths</option>
                          <option value="science">Science</option>
                          <option value="english">English</option>
                        </select>
                      </label>
                    </div>

                    <label className="text-sm font-semibold text-slate-700">
                      Content JSON
                      <textarea
                        className="mt-1 w-full rounded-2xl border border-slate-300 p-3 font-mono text-xs min-h-[340px]"
                        value={editor.content_json}
                        onChange={(e) => setEditor((p) => ({ ...p, content_json: e.target.value }))}
                      />
                    </label>
                  </div>
                )}
              </Card>
            </div>
          </Card>
        </PaywallGate>
      </div>
    </main>
  
    </PageScaffold>
  );
}