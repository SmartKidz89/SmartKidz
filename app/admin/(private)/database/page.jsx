"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Copy, Plus, Play, Trash2, Wand2, ShieldAlert, History } from "lucide-react";
// Use relative imports to avoid build failures if the "@" path alias is not
// correctly configured in the deployment environment.
import AdminNotice from "../../../../components/admin/AdminNotice";
import AdminModal from "../../../../components/admin/AdminModal";
import { cx } from "../../../../components/admin/adminUi";
import { Button, Input, Textarea } from "../../../../components/admin/AdminControls";
import { useAdminMe } from "../../../../components/admin/useAdminMe";

function StatusPill({ allowMutations }) {
  if (allowMutations) {
    return (
      <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-1 text-xs font-medium text-rose-800">
        Mutations enabled
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800">
      Read-only mode
    </span>
  );
}

function safeJson(obj) {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
}

function formatSqlMinimal(sql) {
  const raw = String(sql || "");
  const trimmed = raw
    .split("\n")
    .map((l) => l.replace(/\s+$/g, ""))
    .join("\n")
    .trim();
  if (!trimmed) return "";
  // Minimal formatting: normalize blank lines + ensure trailing semicolon.
  const compact = trimmed.replace(/\n{3,}/g, "\n\n");
  return /;\s*$/.test(compact) ? compact : `${compact};`;
}

const LS_SNIPPETS = "sk_admin_sql_snippets_v1";
const LS_HISTORY = "sk_admin_sql_history_v1";

export default function AdminDatabasePage() {
  const me = useAdminMe();
  const isRoot = me.role === "root";

  const [sql, setSql] = useState("select now();");
  const [allowMutations, setAllowMutations] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null); // { tone, title, message }
  const [result, setResult] = useState(null);

  const [snippetQuery, setSnippetQuery] = useState("");
  const [snippets, setSnippets] = useState([]);
  const [history, setHistory] = useState([]);

  const [snippetCreateOpen, setSnippetCreateOpen] = useState(false);
  const [snippetName, setSnippetName] = useState("");
  const [deleteSnippet, setDeleteSnippet] = useState(null);

  const [mutationConfirmOpen, setMutationConfirmOpen] = useState(false);
  const [mutationPhrase, setMutationPhrase] = useState("");

  const editorRef = useRef(null);

  useEffect(() => {
    // Load snippets + history from localStorage.
    try {
      const s = JSON.parse(localStorage.getItem(LS_SNIPPETS) || "[]");
      if (Array.isArray(s)) setSnippets(s);
    } catch {}
    try {
      const h = JSON.parse(localStorage.getItem(LS_HISTORY) || "[]");
      if (Array.isArray(h)) setHistory(h);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_SNIPPETS, JSON.stringify(snippets.slice(0, 50)));
    } catch {}
  }, [snippets]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_HISTORY, JSON.stringify(history.slice(0, 25)));
    } catch {}
  }, [history]);

  const filteredSnippets = useMemo(() => {
    const q = String(snippetQuery || "").trim().toLowerCase();
    if (!q) return snippets;
    return snippets.filter((s) => {
      return (
        String(s?.name || "").toLowerCase().includes(q) ||
        String(s?.sql || "").toLowerCase().includes(q)
      );
    });
  }, [snippets, snippetQuery]);

  async function run() {
    setBusy(true);
    setNotice(null);
    setResult(null);

    const startedAt = Date.now();
    const payload = { sql, allowMutations };

    try {
      const res = await fetch("/api/admin/sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await res.json().catch(() => null);
      if (!res.ok) throw new Error(j?.error || "Query failed");

      setResult(j);
      setNotice({
        tone: "success",
        title: "Query executed",
        message: `${j.command || "OK"} • ${j.rowCount ?? 0} row(s) • ${j.elapsedMs ?? Date.now() - startedAt}ms`,
      });

      setHistory((prev) => {
        const next = [
          {
            id: crypto.randomUUID(),
            ts: new Date().toISOString(),
            sql,
            allowMutations,
            success: true,
            command: j.command,
            rowCount: j.rowCount,
            elapsedMs: j.elapsedMs,
          },
          ...prev,
        ];
        return next.slice(0, 25);
      });
    } catch (e) {
      const msg = e?.message || "Query failed";
      setNotice({ tone: "danger", title: "Query failed", message: msg });
      setHistory((prev) => {
        const next = [
          {
            id: crypto.randomUUID(),
            ts: new Date().toISOString(),
            sql,
            allowMutations,
            success: false,
            error: msg,
            elapsedMs: Date.now() - startedAt,
          },
          ...prev,
        ];
        return next.slice(0, 25);
      });
    } finally {
      setBusy(false);
    }
  }

  function copyToClipboard(text) {
    try {
      navigator.clipboard.writeText(String(text || ""));
      setNotice({ tone: "success", title: "Copied", message: "Copied to clipboard." });
    } catch {
      setNotice({ tone: "danger", title: "Copy failed", message: "Clipboard access was blocked by the browser." });
    }
  }

  function onToggleMutations(next) {
    if (!isRoot) {
      setNotice({
        tone: "warning",
        title: "Root required",
        message: "Mutation mode is restricted to root admins.",
      });
      return;
    }
    if (next) {
      setMutationPhrase("");
      setMutationConfirmOpen(true);
      return;
    }
    setAllowMutations(false);
  }

  function confirmEnableMutations() {
    if (String(mutationPhrase).trim().toUpperCase() !== "ENABLE") {
      setNotice({ tone: "warning", title: "Confirmation required", message: "Type ENABLE to proceed." });
      return;
    }
    setAllowMutations(true);
    setMutationConfirmOpen(false);
    setNotice({
      tone: "warning",
      title: "Mutation mode enabled",
      message: "Proceed carefully. Changes are executed immediately on your database.",
    });
  }

  function createSnippet() {
    const name = String(snippetName || "").trim();
    const body = String(sql || "").trim();
    if (!name) {
      setNotice({ tone: "warning", title: "Name required", message: "Provide a snippet name." });
      return;
    }
    if (!body) {
      setNotice({ tone: "warning", title: "SQL required", message: "Snippet SQL cannot be blank." });
      return;
    }
    const item = { id: crypto.randomUUID(), name, sql: body, createdAt: new Date().toISOString() };
    setSnippets((prev) => [item, ...prev].slice(0, 50));
    setSnippetName("");
    setSnippetCreateOpen(false);
    setNotice({ tone: "success", title: "Saved", message: `Snippet "${name}" saved.` });
  }

  function loadSql(nextSql) {
    setSql(String(nextSql || ""));
    setResult(null);
    setNotice(null);
    setTimeout(() => editorRef.current?.focus?.(), 0);
  }

  return (
    <div className="p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="text-xl font-semibold">Database</div>
            <StatusPill allowMutations={allowMutations} />
          </div>
          <div className="mt-1 text-sm text-slate-500">
            SQL runner against Supabase Postgres. Read-only is available for admins; mutations are root-only.
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            tone="secondary"
            onClick={() => {
              setResult(null);
              setNotice(null);
            }}
          >
            Clear
          </Button>
          <Button
            tone="secondary"
            onClick={() => {
              const formatted = formatSqlMinimal(sql);
              setSql(formatted);
              setNotice({ tone: "info", title: "Formatted", message: "Applied minimal SQL formatting." });
            }}
            disabled={busy}
          >
            <Wand2 className="h-4 w-4" />
            Format
          </Button>
          <Button tone="secondary" onClick={() => copyToClipboard(sql)} disabled={busy}>
            <Copy className="h-4 w-4" />
            Copy SQL
          </Button>
          <Button onClick={run} disabled={busy || !String(sql || "").trim()}>
            <Play className="h-4 w-4" />
            {busy ? "Running…" : "Run"}
          </Button>
        </div>
      </div>

      {notice ? (
        <div className="mt-4">
          <AdminNotice tone={notice.tone} title={notice.title}>
            {notice.message}
          </AdminNotice>
        </div>
      ) : null}

      {!isRoot ? (
        <div className="mt-4">
          <AdminNotice tone="info" title="Read-only access">
            You are signed in as an <span className="font-medium">admin</span>. Only SELECT/CTE/SHOW/EXPLAIN statements
            are permitted.
          </AdminNotice>
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left rail */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-4">
              <div>
                <div className="text-sm font-semibold">Snippets</div>
                <div className="mt-0.5 text-xs text-slate-500">
                  Store frequently-used queries locally (browser storage).
                </div>
              </div>
              <Button tone="secondary" onClick={() => setSnippetCreateOpen(true)}>
                <Plus className="h-4 w-4" />
                New
              </Button>
            </div>
            <div className="p-4">
              <Input
                value={snippetQuery}
                onChange={(e) => setSnippetQuery(e.target.value)}
                placeholder="Search snippets…"
              />
              <div className="mt-3 text-xs text-slate-500">
                Showing {filteredSnippets.length} of {snippets.length}
                {snippetQuery ? (
                  <button
                    className="ml-2 text-slate-700 underline underline-offset-2 hover:text-slate-900"
                    onClick={() => setSnippetQuery("")}
                  >
                    Clear
                  </button>
                ) : null}
              </div>

              <div className="mt-3 max-h-[320px] overflow-auto">
                {filteredSnippets.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 p-3 text-sm text-slate-500">
                    {snippets.length === 0 ? "No snippets saved yet." : "No snippets match your search."}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredSnippets.map((s) => (
                      <div
                        key={s.id}
                        className="rounded-xl border border-slate-200 p-3 hover:bg-slate-50"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium">{s.name}</div>
                            <div className="mt-1 line-clamp-2 text-xs text-slate-500 font-mono">
                              {String(s.sql || "").replace(/\s+/g, " ").slice(0, 140)}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              className="h-9 w-9 rounded-xl border border-slate-200 hover:bg-white"
                              onClick={() => loadSql(s.sql)}
                              aria-label="Load"
                            >
                              <Play className="h-4 w-4 mx-auto" />
                            </button>
                            <button
                              className="h-9 w-9 rounded-xl border border-slate-200 hover:bg-white"
                              onClick={() => setDeleteSnippet(s)}
                              aria-label="Delete"
                            >
                              <Trash2 className="h-4 w-4 mx-auto" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <History className="h-4 w-4" />
                  Recent runs
                </div>
                <div className="mt-0.5 text-xs text-slate-500">Last 25 executions from this browser.</div>
              </div>
              <Button
                tone="secondary"
                onClick={() => {
                  setHistory([]);
                  setNotice({ tone: "info", title: "Cleared", message: "Recent run history cleared." });
                }}
                disabled={history.length === 0}
              >
                Clear
              </Button>
            </div>
            <div className="p-4">
              {history.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-3 text-sm text-slate-500">
                  No history yet.
                </div>
              ) : (
                <div className="max-h-[300px] overflow-auto space-y-2">
                  {history.map((h) => (
                    <button
                      key={h.id}
                      className={cx(
                        "w-full text-left rounded-xl border p-3 hover:bg-slate-50",
                        h.success ? "border-slate-200" : "border-rose-200 bg-rose-50/40"
                      )}
                      onClick={() => loadSql(h.sql)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-xs text-slate-500">{new Date(h.ts).toLocaleString()}</div>
                          <div className="mt-1 line-clamp-2 text-xs font-mono text-slate-700">
                            {String(h.sql || "").replace(/\s+/g, " ").slice(0, 180)}
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className={cx("text-xs font-medium", h.success ? "text-slate-700" : "text-rose-700")}>
                            {h.success ? `${h.command || "OK"}` : "Failed"}
                          </div>
                          <div className="mt-0.5 text-xs text-slate-500">
                            {h.success ? `${h.rowCount ?? 0} rows` : "—"} • {h.elapsedMs ?? "?"}ms
                          </div>
                        </div>
                      </div>
                      {!h.success && h.error ? (
                        <div className="mt-2 text-xs text-rose-700 line-clamp-2">{h.error}</div>
                      ) : null}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Editor + results */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white">
            <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-semibold">SQL Editor</div>
                <div className="mt-0.5 text-xs text-slate-500">
                  Tip: keep mutations disabled unless you are performing deliberate maintenance.
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={allowMutations}
                  onChange={(e) => onToggleMutations(e.target.checked)}
                  disabled={!isRoot}
                />
                <span className={cx("inline-flex items-center gap-2", !isRoot ? "text-slate-400" : "")}> 
                  <ShieldAlert className="h-4 w-4" />
                  Allow mutations
                </span>
              </label>
            </div>

            <div className="p-4">
              <Textarea ref={editorRef} value={sql} onChange={(e) => setSql(e.target.value)} />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-500">
                  Results are limited to the first 200 rows in the UI.
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    tone="secondary"
                    onClick={() => {
                      setSql("");
                      setResult(null);
                      setNotice(null);
                      setAllowMutations(false);
                    }}
                    disabled={busy}
                  >
                    Clear editor
                  </Button>
                  <Button onClick={run} disabled={busy || !String(sql || "").trim()}>
                    <Play className="h-4 w-4" />
                    {busy ? "Running…" : "Run SQL"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {result ? (
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
                <div>
                  <div className="text-sm font-semibold">Result</div>
                  <div className="mt-0.5 text-xs text-slate-500">
                    {result.command} • {result.rowCount} row(s) • {result.elapsedMs}ms
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button tone="secondary" onClick={() => copyToClipboard(safeJson(result))}>
                    <Copy className="h-4 w-4" />
                    Copy JSON
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-left text-slate-500 bg-white sticky top-0">
                    <tr>
                      {(result.fields || []).map((f) => (
                        <th key={f.name} className="py-2 px-4 border-b border-slate-100 whitespace-nowrap">
                          {f.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(result.rows || []).slice(0, 200).map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-100">
                        {(result.fields || []).map((f) => (
                          <td key={f.name} className="py-2 px-4 align-top">
                            <div className="max-w-[520px] break-words whitespace-pre-wrap text-xs font-mono">
                              {typeof row[f.name] === "object"
                                ? safeJson(row[f.name])
                                : String(row[f.name])}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {(result.rows || []).length > 200 ? (
                <div className="p-4 text-xs text-slate-500">Showing first 200 rows.</div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {/* Modals */}
      <AdminModal
        open={snippetCreateOpen}
        title="Save snippet"
        desc="Store a named query locally in your browser."
        onClose={() => {
          setSnippetCreateOpen(false);
          setSnippetName("");
        }}
      >
        <div className="space-y-3">
          <div>
            <div className="text-sm font-medium">Name</div>
            <div className="mt-1">
              <Input value={snippetName} onChange={(e) => setSnippetName(e.target.value)} placeholder="e.g., List pages" />
            </div>
          </div>
          <div>
            <div className="text-sm font-medium">SQL preview</div>
            <div className="mt-1 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-mono text-slate-700 whitespace-pre-wrap max-h-[200px] overflow-auto">
              {String(sql || "").trim() || "(empty)"}
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button tone="secondary" onClick={() => setSnippetCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createSnippet}>Save</Button>
          </div>
        </div>
      </AdminModal>

      <AdminModal
        open={!!deleteSnippet}
        title="Delete snippet"
        desc="This removes the snippet from your browser storage."
        onClose={() => setDeleteSnippet(null)}
      >
        <div className="space-y-3">
          <div className="text-sm">
            Delete <span className="font-semibold">{deleteSnippet?.name}</span>?
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button tone="secondary" onClick={() => setDeleteSnippet(null)}>
              Cancel
            </Button>
            <Button
              tone="danger"
              onClick={() => {
                const id = deleteSnippet?.id;
                setSnippets((prev) => prev.filter((s) => s.id !== id));
                setDeleteSnippet(null);
                setNotice({ tone: "info", title: "Deleted", message: "Snippet removed." });
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </AdminModal>

      <AdminModal
        open={mutationConfirmOpen}
        title="Enable mutation mode"
        desc="Mutation mode allows INSERT/UPDATE/DELETE and DDL. This can permanently modify or destroy production data."
        onClose={() => setMutationConfirmOpen(false)}
        className="max-w-xl"
      >
        <div className="space-y-3">
          <AdminNotice tone="warning" title="High risk">
            Only enable this when you have a verified SQL statement and understand the impact.
          </AdminNotice>
          <div>
            <div className="text-sm font-medium">Type ENABLE to confirm</div>
            <div className="mt-1">
              <Input value={mutationPhrase} onChange={(e) => setMutationPhrase(e.target.value)} placeholder="ENABLE" />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button tone="secondary" onClick={() => setMutationConfirmOpen(false)}>
              Cancel
            </Button>
            <Button tone="danger" onClick={confirmEnableMutations}>
              Enable
            </Button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
