"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import AdminNotice from "@/components/admin/AdminNotice";
import AdminModal from "@/components/admin/AdminModal";
import { Upload } from "lucide-react";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function Button({ children, tone = "primary", className, ...props }) {
  const base = "rounded-xl px-3 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2";
  const toneCls =
    tone === "primary"
      ? "bg-slate-900 text-white hover:bg-slate-800"
      : tone === "danger"
      ? "bg-rose-600 text-white hover:bg-rose-500"
      : "bg-white border border-slate-200 hover:bg-slate-50";
  return (
    <button className={cx(base, toneCls, className)} {...props}>
      {children}
    </button>
  );
}

function Input({ className, ...props }) {
  return (
    <input
      className={cx(
        "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-200",
        className
      )}
      {...props}
    />
  );
}

function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cx(
        "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-slate-200",
        className
      )}
      {...props}
    />
  );
}

function formatDate(ts) {
  if (!ts) return "";
  try {
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString();
  } catch {
    return "";
  }
}

export default function ComfyWorkflows() {
  const [listLoading, setListLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  const [notice, setNotice] = useState(null); 

  const [workflows, setWorkflows] = useState([]);
  const [query, setQuery] = useState("");

  const [selectedName, setSelectedName] = useState(null);
  const [selectedMeta, setSelectedMeta] = useState(null);

  const [notes, setNotes] = useState("");
  const [jsonText, setJsonText] = useState("{\n  \n}\n");

  const baselineRef = useRef({ notes: "", jsonText: "{\n  \n}\n" });

  const [newOpen, setNewOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const [deleteOpen, setDeleteOpen] = useState(false);

  const isDirty = useMemo(() => {
    return notes !== baselineRef.current.notes || jsonText !== baselineRef.current.jsonText;
  }, [notes, jsonText]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return workflows;
    return workflows.filter((w) => {
      const name = String(w.workflow_name || "").toLowerCase();
      const n = String(w.notes || "").toLowerCase();
      return name.includes(q) || n.includes(q);
    });
  }, [workflows, query]);

  async function loadList({ keepSelection = true } = {}) {
    setListLoading(true);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/comfy-workflows", { cache: "no-store" });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Failed to load workflows.");
      setWorkflows(json?.data || []);

      if (!keepSelection) return;

      // Keep selection if it still exists; otherwise select first item.
      if (selectedName) {
        const exists = (json?.data || []).some((x) => x.workflow_name === selectedName);
        if (!exists) setSelectedName(null);
      }
      if (!selectedName && (json?.data || []).length) setSelectedName(json.data[0].workflow_name);
    } catch (e) {
      setNotice({ tone: "danger", title: "Load failed", message: e.message || String(e) });
    } finally {
      setListLoading(false);
    }
  }

  async function loadDetail(name) {
    if (!name) return;
    setDetailLoading(true);
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/comfy-workflows/${encodeURIComponent(name)}`, { cache: "no-store" });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Failed to load workflow.");
      const data = json?.data;
      setSelectedMeta({ updated_at: data?.updated_at || null });
      const nextNotes = data?.notes ? String(data.notes) : "";
      const nextJsonText = JSON.stringify(data?.workflow_json ?? {}, null, 2);

      setNotes(nextNotes);
      setJsonText(nextJsonText);
      baselineRef.current = { notes: nextNotes, jsonText: nextJsonText };
    } catch (e) {
      setNotice({ tone: "danger", title: "Load failed", message: e.message || String(e) });
      setSelectedMeta(null);
    } finally {
      setDetailLoading(false);
    }
  }

  useEffect(() => {
    loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedName) return;
    loadDetail(selectedName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedName]);

  async function onSave() {
    if (!selectedName) return;
    setNotice(null);

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (e) {
      setNotice({ tone: "warning", title: "Invalid JSON", message: e.message || "Please fix the workflow JSON before saving." });
      return;
    }

    try {
      const res = await fetch("/api/admin/comfy-workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflow_name: selectedName,
          notes: notes || null,
          workflow_json: parsed,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Save failed.");

      baselineRef.current = { notes, jsonText };
      setNotice({ tone: "success", title: "Saved", message: "Workflow template updated." });
      await loadList();
      await loadDetail(selectedName);
    } catch (e) {
      setNotice({ tone: "danger", title: "Save failed", message: e.message || String(e) });
    }
  }

  function requestDelete() {
    if (!selectedName) return;
    setDeleteOpen(true);
  }

  async function confirmDelete() {
    if (!selectedName) return;
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/comfy-workflows/${encodeURIComponent(selectedName)}`, { method: "DELETE" });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Delete failed.");

      setDeleteOpen(false);
      setNotice({ tone: "success", title: "Deleted", message: `Workflow “${selectedName}” removed.` });

      setSelectedName(null);
      setSelectedMeta(null);
      setNotes("");
      setJsonText("{\n  \n}\n");
      baselineRef.current = { notes: "", jsonText: "{\n  \n}\n" };

      await loadList({ keepSelection: false });
    } catch (e) {
      setNotice({ tone: "danger", title: "Delete failed", message: e.message || String(e) });
    }
  }

  function openNew() {
    setNewName("");
    setNewNotes("");
    setNewOpen(true);
  }

  async function createNew() {
    const name = String(newName || "").trim();
    if (!name) {
      setNotice({ tone: "warning", title: "Missing name", message: "Enter a workflow name to create it." });
      return;
    }

    const starter = {};
    try {
      const res = await fetch("/api/admin/comfy-workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflow_name: name, notes: newNotes || null, workflow_json: starter }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Create failed.");

      setNewOpen(false);
      setNotice({ tone: "success", title: "Created", message: `Workflow “${name}” created.` });

      await loadList({ keepSelection: false });
      setSelectedName(name);
    } catch (e) {
      setNotice({ tone: "danger", title: "Create failed", message: e.message || String(e) });
    }
  }

  // Import Handler
  function handleImport(e) {
     const file = e.target.files?.[0];
     if (!file) return;
     
     const reader = new FileReader();
     reader.onload = (evt) => {
        try {
           // Validate JSON
           const parsed = JSON.parse(evt.target.result);
           setJsonText(JSON.stringify(parsed, null, 2));
           setNotice({ tone: "success", title: "Imported", message: "JSON loaded into editor. Click Save to persist." });
        } catch (err) {
           setNotice({ tone: "danger", title: "Import Failed", message: "Invalid JSON file." });
        }
     };
     reader.readAsText(file);
     e.target.value = ""; // Reset input
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900">Workflow Templates</div>
            <div className="mt-0.5 text-xs text-slate-500">
              Create, edit, and store ComfyUI workflows in the database.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button tone="secondary" onClick={() => loadList()}>
              Refresh
            </Button>
            <Button onClick={openNew}>New workflow</Button>
          </div>
        </div>

        {notice ? (
          <div className="mt-3">
            <AdminNotice tone={notice.tone} title={notice.title}>
              {notice.message}
            </AdminNotice>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-0 md:grid-cols-3">
        {/* Left: list */}
        <div className="border-b border-slate-200 p-4 md:border-b-0 md:border-r">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search workflows…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search workflows"
            />
          </div>

          <div className="mt-3 space-y-2 max-h-[600px] overflow-y-auto">
            {listLoading ? (
              <div className="text-sm text-slate-500">Loading workflows…</div>
            ) : filtered.length ? (
              filtered.map((w) => {
                const active = w.workflow_name === selectedName;
                return (
                  <button
                    key={w.workflow_name}
                    className={cx(
                      "w-full rounded-2xl border px-3 py-2 text-left transition",
                      active ? "border-slate-300 bg-slate-50" : "border-slate-200 hover:bg-slate-50"
                    )}
                    onClick={() => setSelectedName(w.workflow_name)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-900">{w.workflow_name}</div>
                        {w.notes ? <div className="mt-0.5 truncate text-xs text-slate-500">{w.notes}</div> : null}
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                No workflows found.
              </div>
            )}
          </div>
        </div>

        {/* Right: editor */}
        <div className="p-4 md:col-span-2">
          {!selectedName ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Select a workflow to edit.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="truncate text-lg font-semibold">{selectedName}</div>
                    {isDirty ? (
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                        Unsaved changes
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        Saved
                      </span>
                    )}
                  </div>
                  {selectedMeta?.updated_at ? (
                    <div className="mt-1 text-xs text-slate-500">Last updated: {formatDate(selectedMeta.updated_at)}</div>
                  ) : null}
                </div>

                <div className="flex items-center gap-2">
                  <Button tone="secondary" onClick={requestDelete}>
                    Delete
                  </Button>
                  <Button onClick={onSave} disabled={detailLoading}>
                    Save
                  </Button>
                </div>
              </div>

              {detailLoading ? (
                <div className="text-sm text-slate-500">Loading workflow…</div>
              ) : (
                <>
                  <div>
                    <div className="mb-1 text-xs font-semibold text-slate-700">Notes</div>
                    <Textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Optional notes for admins (e.g., where this workflow is used)"
                      className="font-sans"
                    />
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <div className="text-xs font-semibold text-slate-700">Workflow JSON</div>
                      <div className="flex gap-2">
                        <label className="cursor-pointer inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-600">
                           <Upload className="w-3 h-3" /> Import
                           <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                        </label>
                        <Button
                          tone="secondary"
                          className="!py-1 !px-2 !text-xs !h-auto"
                          onClick={() => {
                            try {
                              const pretty = JSON.stringify(JSON.parse(jsonText), null, 2);
                              setJsonText(pretty);
                            } catch (e) {
                              setNotice({ tone: "warning", title: "Invalid JSON", message: e.message || "Cannot format invalid JSON." });
                            }
                          }}
                        >
                          Format
                        </Button>
                      </div>
                    </div>
                    <Textarea
                      rows={18}
                      value={jsonText}
                      onChange={(e) => setJsonText(e.target.value)}
                      spellCheck={false}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <AdminModal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        title="Create workflow"
        desc="Create a new workflow template."
      >
        <div className="space-y-3">
          <div>
            <div className="mb-1 text-xs font-semibold text-slate-700">Workflow name</div>
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g., default_v1" />
            <div className="mt-1 text-xs text-slate-500">Allowed: letters, numbers, spaces, dot, underscore, dash.</div>
          </div>
          <div>
            <div className="mb-1 text-xs font-semibold text-slate-700">Notes (optional)</div>
            <Textarea
              rows={3}
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="Description..."
              className="font-sans"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button tone="secondary" onClick={() => setNewOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createNew}>Create</Button>
          </div>
        </div>
      </AdminModal>

      <AdminModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete workflow?"
        desc="This cannot be undone."
      >
        <div className="space-y-4">
          <div className="text-sm text-slate-700">
            Delete <span className="font-semibold">{selectedName}</span>?
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button tone="secondary" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button tone="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}