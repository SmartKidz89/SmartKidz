"use client";

import { useEffect, useMemo, useState } from "react";

function Button({ children, tone = "primary", ...props }) {
  const cls =
    tone === "primary"
      ? "bg-slate-900 text-white hover:bg-slate-800"
      : tone === "danger"
      ? "bg-rose-600 text-white hover:bg-rose-500"
      : "bg-white border border-slate-200 hover:bg-slate-50";
  const border = tone === "secondary" ? "" : "border border-transparent";
  return (
    <button
      className={`rounded-xl px-3 py-2 text-sm disabled:opacity-50 ${cls} ${border}`}
      {...props}
    >
      {children}
    </button>
  );
}

function Input({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <div className="text-xs font-medium text-slate-600">{label}</div>
      <input
        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export default function ComfyWorkflows() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [workflowName, setWorkflowName] = useState("");
  const [notes, setNotes] = useState("");
  const [jsonText, setJsonText] = useState("{\n  \n}");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  async function refresh() {
    const res = await fetch("/api/admin/comfy-workflows");
    const out = await res.json();
    if (out?.data) setItems(out.data);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function loadOne(name) {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/comfy-workflows/${encodeURIComponent(name)}`);
      const out = await res.json();
      if (!res.ok) throw new Error(out?.error || "Failed to load workflow");
      const w = out.data;
      setSelected(name);
      setWorkflowName(w.workflow_name);
      setNotes(w.notes || "");
      setJsonText(JSON.stringify(w.workflow_json || {}, null, 2));
    } catch (e) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  }

  function newWorkflow() {
    setSelected(null);
    setWorkflowName("");
    setNotes("");
    setJsonText("{\n  \n}");
    setMsg(null);
  }

  async function save() {
    setBusy(true);
    setMsg(null);
    try {
      let workflow_json = null;
      try {
        workflow_json = JSON.parse(jsonText);
      } catch {
        throw new Error("Workflow JSON is not valid JSON.");
      }

      const res = await fetch("/api/admin/comfy-workflows", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ workflow_name: workflowName, notes, workflow_json }),
      });
      const out = await res.json();
      if (!res.ok) throw new Error(out?.error || "Save failed");
      setMsg("Saved.");
      await refresh();
      setSelected(workflowName);
    } catch (e) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function del() {
    if (!selected) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/comfy-workflows/${encodeURIComponent(selected)}`, { method: "DELETE" });
      const out = await res.json();
      if (!res.ok) throw new Error(out?.error || "Delete failed");
      setMsg("Deleted.");
      newWorkflow();
      await refresh();
    } catch (e) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function importJson(file) {
    setBusy(true);
    setMsg(null);
    try {
      const text = await file.text();
      JSON.parse(text); // validate
      setJsonText(text);
      setMsg("Imported JSON into editor. Save to persist.");
    } catch {
      setMsg("Selected file is not valid JSON.");
    } finally {
      setBusy(false);
    }
  }

  const sorted = useMemo(() => [...items].sort((a, b) => String(a.workflow_name).localeCompare(String(b.workflow_name))), [items]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Workflows</div>
            <div className="text-xs text-slate-500">{sorted.length} saved</div>
          </div>
          <Button tone="secondary" onClick={newWorkflow} disabled={busy}>
            New
          </Button>
        </div>
        <div className="p-2">
          {sorted.map((w) => (
            <button
              key={w.workflow_name}
              className={`w-full text-left rounded-xl px-3 py-2 text-sm hover:bg-slate-50 ${selected === w.workflow_name ? "bg-slate-100" : ""}`}
              onClick={() => loadOne(w.workflow_name)}
              disabled={busy}
            >
              <div className="font-medium">{w.workflow_name}</div>
              <div className="text-xs text-slate-500 truncate">{w.notes || "No notes"}</div>
            </button>
          ))}
          {sorted.length === 0 ? <div className="p-3 text-sm text-slate-500">No workflows saved yet.</div> : null}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-2 justify-between">
          <div>
            <div className="text-sm font-semibold">Editor</div>
            <div className="text-xs text-slate-500">Store your workflow JSON here (optional) and reference it by name from Image Specs / job overrides.</div>
          </div>
          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer">
              <input type="file" accept="application/json,.json" className="hidden" onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importJson(f);
              }} />
              Import JSON
            </label>
            <Button onClick={save} disabled={busy || !workflowName}>
              Save
            </Button>
            <Button tone="danger" onClick={del} disabled={busy || !selected}>
              Delete
            </Button>
          </div>
        </div>

        {msg ? (
          <div className="mx-4 mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            {msg}
          </div>
        ) : null}

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Workflow name"
              value={workflowName}
              onChange={setWorkflowName}
              placeholder="basic_text2img"
            />
            <Input label="Notes" value={notes} onChange={setNotes} placeholder="What this workflow does" />
          </div>

          <div>
            <div className="text-xs font-medium text-slate-600">Workflow JSON</div>
            <textarea
              className="mt-1 w-full min-h-[420px] rounded-2xl border border-slate-200 px-3 py-2 font-mono text-xs"
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              spellCheck={false}
            />
            <div className="mt-2 text-xs text-slate-500">
              Tip: use variables like <span className="font-mono">{{"{{prompt}}"}}</span>, <span className="font-mono">{{"{{negative_prompt}}"}}</span>, <span className="font-mono">{{"{{width}}"}}</span>, <span className="font-mono">{{"{{height}}"}}</span>, etc.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
