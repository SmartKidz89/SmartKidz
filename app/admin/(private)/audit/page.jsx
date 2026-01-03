"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Copy, Download, RefreshCw, Search, Shield } from "lucide-react";
// Use relative imports to avoid build failures if the "@" path alias is not
// correctly configured in the deployment environment.
import AdminNotice from "../../../../components/admin/AdminNotice";
import { cx } from "../../../../components/admin/adminUi";
import { useAdminMe } from "../../../../components/admin/useAdminMe";


function safeJson(v) {
  try {
    return JSON.stringify(v ?? {}, null, 2);
  } catch {
    return "{}";
  }
}

function fmt(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return String(ts);
  return d.toLocaleString();
}

function includesCI(haystack, needle) {
  if (!needle) return true;
  return String(haystack ?? "").toLowerCase().includes(String(needle).toLowerCase());
}

export default function AdminAuditPage() {
  const me = useAdminMe();
  const [logs, setLogs] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [limit, setLimit] = useState(200);

  const [query, setQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");

  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null); // {tone,title,body}

  const lastLoadedAt = useRef(null);

  async function load(nextLimit = limit) {
    setLoading(true);
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/audit?limit=${encodeURIComponent(nextLimit)}`, { cache: "no-store" });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed to load audit log");
      const next = Array.isArray(j?.logs) ? j.logs : [];
      setLogs(next);
      setSelectedId((prev) => (prev && next.some((x) => x.id === prev) ? prev : (next[0]?.id ?? null)));
      lastLoadedAt.current = Date.now();
      setNotice({ tone: "success", title: "Loaded", body: `Fetched ${next.length} entries.` });
    } catch (e) {
      setNotice({ tone: "danger", title: "Unable to load audit log", body: e?.message || "Unknown error" });
      setLogs([]);
      setSelectedId(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const actions = useMemo(() => {
    const set = new Set();
    for (const l of logs) if (l?.action) set.add(l.action);
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [logs]);

  const entities = useMemo(() => {
    const set = new Set();
    for (const l of logs) if (l?.entity) set.add(l.entity);
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [logs]);

  const filtered = useMemo(() => {
    const q = query.trim();
    return logs.filter((l) => {
      if (actionFilter !== "all" && l?.action !== actionFilter) return false;
      if (entityFilter !== "all" && l?.entity !== entityFilter) return false;
      if (!q) return true;

      const metaStr = safeJson(l?.meta);
      return (
        includesCI(l?.actor, q) ||
        includesCI(l?.action, q) ||
        includesCI(l?.entity, q) ||
        includesCI(l?.created_at, q) ||
        includesCI(metaStr, q)
      );
    });
  }, [logs, query, actionFilter, entityFilter]);

  const selected = useMemo(() => filtered.find((l) => l.id === selectedId) || filtered[0] || null, [filtered, selectedId]);

  useEffect(() => {
    if (!selected && filtered.length) setSelectedId(filtered[0].id);
  }, [filtered, selected]);

  async function copy(text, label = "Copied") {
    try {
      await navigator.clipboard.writeText(String(text ?? ""));
      setNotice({ tone: "success", title: label, body: "Copied to clipboard." });
    } catch {
      setNotice({ tone: "warning", title: "Copy failed", body: "Your browser blocked clipboard access." });
    }
  }

  function downloadJson() {
    const payload = {
      exported_at: new Date().toISOString(),
      limit,
      filters: { query: query.trim(), action: actionFilter, entity: entityFilter },
      count: filtered.length,
      logs: filtered,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setNotice({ tone: "success", title: "Exported", body: "Downloaded audit log JSON." });
  }

  const showingText = `${filtered.length} shown of ${logs.length}`;
  const isRoot = (me?.role || "") === "root";

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="text-xl font-semibold">Audit Log</div>
            <span className={cx(
              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs",
              isRoot ? "border-slate-200 bg-slate-50 text-slate-700" : "border-amber-200 bg-amber-50 text-amber-900"
            )}>
              <Shield className="h-3.5 w-3.5" />
              Root-only
            </span>
          </div>
          <div className="text-sm text-slate-500 mt-1">
            Immutable record of privileged admin actions and configuration changes.
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-xl border border-slate-200 bg-white px-2 py-1 flex items-center gap-2">
            <span className="text-xs text-slate-500">Limit</span>
            <select
              className="text-sm bg-transparent outline-none"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value) || 200)}
            >
              {[100, 200, 500, 1000].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => load(limit)}
            disabled={loading}
            className={cx(
              "rounded-xl border px-3 py-2 text-sm inline-flex items-center gap-2",
              loading ? "border-slate-200 bg-slate-50 text-slate-400" : "border-slate-200 hover:bg-slate-50"
            )}
            title="Refresh"
          >
            <RefreshCw className={cx("h-4 w-4", loading ? "animate-spin" : "")} />
            Refresh
          </button>

          <button
            onClick={downloadJson}
            disabled={filtered.length === 0}
            className={cx(
              "rounded-xl border px-3 py-2 text-sm inline-flex items-center gap-2",
              filtered.length === 0 ? "border-slate-200 bg-slate-50 text-slate-400" : "border-slate-200 hover:bg-slate-50"
            )}
            title="Download filtered logs as JSON"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {notice ? (
        <div className="mt-4">
          <AdminNotice tone={notice.tone} title={notice.title}>{notice.body}</AdminNotice>
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between gap-3">
              <div className="font-semibold">Entries</div>
              <div className="text-xs text-slate-500">{showingText}</div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search actor, action, entity, meta…"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <select
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                >
                  {actions.map((a) => (
                    <option key={a} value={a}>{a === "all" ? "All actions" : a}</option>
                  ))}
                </select>

                <select
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                  value={entityFilter}
                  onChange={(e) => setEntityFilter(e.target.value)}
                >
                  {entities.map((en) => (
                    <option key={en} value={en}>{en === "all" ? "All entities" : en}</option>
                  ))}
                </select>
              </div>

              {(query || actionFilter !== "all" || entityFilter !== "all") ? (
                <button
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
                  onClick={() => {
                    setQuery("");
                    setActionFilter("all");
                    setEntityFilter("all");
                  }}
                >
                  Clear filters
                </button>
              ) : null}
            </div>
          </div>

          <div className="max-h-[560px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-4">
                <AdminNotice
                  tone={logs.length ? "warning" : "info"}
                  title={logs.length ? "No matches" : "No entries"}
                >
                  {logs.length
                    ? "Try clearing filters or broadening your search."
                    : "No audit entries were returned. If you expect entries, confirm the database table is present and you are signed in as root."}
                </AdminNotice>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {filtered.map((l) => {
                  const active = l.id === (selected?.id ?? null);
                  return (
                    <li key={l.id}>
                      <button
                        onClick={() => setSelectedId(l.id)}
                        className={cx(
                          "w-full text-left px-4 py-3 hover:bg-slate-50",
                          active ? "bg-slate-50" : "bg-white"
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold truncate">{l.action || "(no action)"}</div>
                            <div className="text-xs text-slate-500 truncate mt-0.5">
                              {l.entity || "-"} · {l.actor || "-"}
                            </div>
                          </div>
                          <div className="text-xs text-slate-500 whitespace-nowrap">{fmt(l.created_at)}</div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold">Details</div>
              <div className="text-xs text-slate-500 mt-0.5">
                {selected ? "Review the selected audit entry." : "Select an entry to view details."}
              </div>
            </div>

            {selected ? (
              <div className="flex items-center gap-2">
                <button
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50 inline-flex items-center gap-2"
                  onClick={() => copy(safeJson(selected.meta), "Meta copied")}
                  title="Copy meta JSON"
                >
                  <Copy className="h-4 w-4" />
                  Copy meta
                </button>
                <button
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50 inline-flex items-center gap-2"
                  onClick={() => copy(safeJson(selected), "Entry copied")}
                  title="Copy entire entry JSON"
                >
                  <Copy className="h-4 w-4" />
                  Copy entry
                </button>
              </div>
            ) : null}
          </div>

          <div className="p-4">
            {selected ? (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="xl:col-span-1 rounded-2xl border border-slate-200 bg-white overflow-hidden">
                  <div className="p-3 border-b border-slate-100 text-sm font-semibold">Summary</div>
                  <div className="p-3 text-sm">
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-slate-500">Action</div>
                        <div className="font-semibold break-words">{selected.action || "-"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Entity</div>
                        <div className="break-words">{selected.entity || "-"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Actor</div>
                        <div className="break-words">{selected.actor || "-"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Timestamp</div>
                        <div className="break-words">{fmt(selected.created_at)}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{selected.created_at}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white overflow-hidden">
                  <div className="p-3 border-b border-slate-100 flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold">Meta</div>
                    <div className="text-xs text-slate-500">JSON payload</div>
                  </div>
                  <pre className="p-3 text-xs font-mono whitespace-pre-wrap break-words max-h-[520px] overflow-y-auto">{safeJson(selected.meta)}</pre>
                </div>
              </div>
            ) : (
              <AdminNotice tone="info" title="No selection">
                Choose an entry from the list to view the full details.
              </AdminNotice>
            )}

            {lastLoadedAt.current ? (
              <div className="mt-4 text-xs text-slate-400">
                Last refreshed: {new Date(lastLoadedAt.current).toLocaleString()}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
