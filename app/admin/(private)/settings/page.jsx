"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Plus, Link2, Trash2, Copy, ExternalLink, CheckCircle2, ShieldAlert } from "lucide-react";
import AdminNotice from "@/components/admin/AdminNotice";
import AdminModal from "@/components/admin/AdminModal";
import { cx } from "@/components/admin/adminUi";
import { Button, Input, Select } from "@/components/admin/AdminControls";
import { useAdminMe } from "@/components/admin/useAdminMe";

function StatusPill({ dirty }) {
  if (dirty) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800">
        <ShieldAlert className="h-4 w-4" /> Unsaved changes
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800">
      <CheckCircle2 className="h-4 w-4" /> Saved
    </span>
  );
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(String(text ?? ""));
    return true;
  } catch {
    return false;
  }
}

function normalizePath(v) {
  if (!v) return "";
  const s = String(v).trim();
  if (!s) return "";
  return s.startsWith("/") ? s : `/${s}`;
}

export default function AdminSettingsPage() {
  const me = useAdminMe();
  const isRoot = me.role === "root";

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null); // { tone, title, message }

  const [redirects, setRedirects] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [dirty, setDirty] = useState(false);

  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // all | active | inactive
  const [statusFilter, setStatusFilter] = useState("all"); // all | 301 | 302

  const [createOpen, setCreateOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [delPhrase, setDelPhrase] = useState("");

  const [newFrom, setNewFrom] = useState("");
  const [newTo, setNewTo] = useState("");
  const [newStatus, setNewStatus] = useState(301);
  const [newActive, setNewActive] = useState(true);

  async function refresh() {
    setLoading(true);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/redirects", { cache: "no-store" });
      const j = await res.json().catch(() => null);
      if (!res.ok) throw new Error(j?.error || "Failed to load redirects");
      setRedirects(j?.redirects || []);
    } catch (e) {
      setNotice({ tone: "danger", title: "Load failed", message: e?.message || "Failed to load." });
      setRedirects([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setDraft(null);
      setDirty(false);
      return;
    }
    const r = (redirects || []).find((x) => x.id === selectedId);
    if (!r) {
      setDraft(null);
      setDirty(false);
      return;
    }
    setDraft({ ...r });
    setDirty(false);
  }, [selectedId, redirects]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (redirects || []).filter((r) => {
      if (activeFilter === "active" && r.is_active === false) return false;
      if (activeFilter === "inactive" && r.is_active !== false) return false;
      if (statusFilter !== "all" && Number(r.status || 301) !== Number(statusFilter)) return false;
      if (!q) return true;
      const hay = `${r.from_path || ""} ${r.to_path || ""} ${r.status || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [redirects, query, activeFilter, statusFilter]);

  async function saveDraft() {
    if (!draft) return;
    const payload = {
      ...draft,
      from_path: normalizePath(draft.from_path),
      to_path: normalizePath(draft.to_path),
      status: Number(draft.status || 301),
      is_active: draft.is_active !== false,
    };
    if (!payload.from_path || !payload.to_path) {
      setNotice({ tone: "warning", title: "Missing fields", message: "From and To paths are required." });
      return;
    }

    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/redirects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await res.json().catch(() => null);
      if (!res.ok) throw new Error(j?.error || "Save failed");
      setNotice({ tone: "success", title: "Saved", message: "Redirect updated." });
      await refresh();
      if (j?.redirect?.id) setSelectedId(j.redirect.id);
      setDirty(false);
    } catch (e) {
      setNotice({ tone: "danger", title: "Save failed", message: e?.message || "Save failed." });
    } finally {
      setBusy(false);
    }
  }

  function openCreate() {
    setNewFrom("");
    setNewTo("");
    setNewStatus(301);
    setNewActive(true);
    setCreateOpen(true);
  }

  async function createRedirect() {
    const from_path = normalizePath(newFrom);
    const to_path = normalizePath(newTo);
    if (!from_path || !to_path) {
      setNotice({ tone: "warning", title: "Missing fields", message: "From and To paths are required." });
      return;
    }

    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/redirects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from_path, to_path, status: Number(newStatus || 301), is_active: !!newActive }),
      });
      const j = await res.json().catch(() => null);
      if (!res.ok) throw new Error(j?.error || "Create failed");
      setCreateOpen(false);
      setNotice({ tone: "success", title: "Created", message: "Redirect created." });
      await refresh();
      if (j?.redirect?.id) setSelectedId(j.redirect.id);
    } catch (e) {
      setNotice({ tone: "danger", title: "Create failed", message: e?.message || "Create failed." });
    } finally {
      setBusy(false);
    }
  }

  function requestDelete() {
    if (!draft) return;
    if (!isRoot) {
      setNotice({ tone: "warning", title: "Root required", message: "Deleting redirects is restricted to root admins." });
      return;
    }
    setDelPhrase("");
    setDelOpen(true);
  }

  async function doDelete() {
    if (!draft?.id) return;
    if (delPhrase.trim() !== "DELETE") return;

    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/redirects?id=${encodeURIComponent(draft.id)}`, { method: "DELETE" });
      const j = await res.json().catch(() => null);
      if (!res.ok) throw new Error(j?.error || "Delete failed");
      setDelOpen(false);
      setNotice({ tone: "success", title: "Deleted", message: "Redirect deleted." });
      setSelectedId(null);
      await refresh();
    } catch (e) {
      setNotice({ tone: "danger", title: "Delete failed", message: e?.message || "Delete failed." });
    } finally {
      setBusy(false);
    }
  }

  const shownText = useMemo(() => {
    const total = redirects?.length || 0;
    const shown = filtered?.length || 0;
    return `${shown} of ${total}`;
  }, [redirects, filtered]);

  function clearFilters() {
    setQuery("");
    setActiveFilter("all");
    setStatusFilter("all");
  }

  function openPath(p) {
    const path = normalizePath(p);
    if (!path) return;
    window.open(path, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xl font-semibold">Settings</div>
          <div className="mt-1 text-sm text-slate-500">Operational configuration for the Admin Console.</div>
        </div>
        <div className="flex items-center gap-2">
          <Button tone="secondary" onClick={refresh} disabled={loading || busy}>
            <RefreshCw className={cx("h-4 w-4", loading ? "animate-spin" : "")} />
            Refresh
          </Button>
          <Button onClick={openCreate} disabled={busy}>
            <Plus className="h-4 w-4" />
            New redirect
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

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-slate-700" />
              <div className="font-semibold">Redirects</div>
            </div>
            <div className="text-xs text-slate-500">Showing {shownText}</div>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2">
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search redirects..." />
            <div className="grid grid-cols-2 gap-2">
              <Select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">Any status</option>
                <option value="301">301</option>
                <option value="302">302</option>
              </Select>
            </div>
            <Button tone="secondary" onClick={clearFilters}>
              Clear
            </Button>
          </div>

          <div className="mt-4 max-h-[60vh] overflow-auto">
            {loading ? (
              <div className="text-sm text-slate-500">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="text-sm text-slate-500">
                {redirects.length === 0 ? "No redirects yet." : "No matches for the current filters."}
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((r) => {
                  const active = r.id === selectedId;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setSelectedId(r.id)}
                      className={cx(
                        "w-full text-left rounded-2xl border p-3 transition",
                        active ? "border-slate-900 bg-slate-50" : "border-slate-200 hover:bg-slate-50"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold truncate">{r.from_path}</div>
                          <div className="mt-0.5 text-xs text-slate-500 truncate">to {r.to_path}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-medium text-slate-700">{r.status || 301}</div>
                          <div
                            className={cx(
                              "mt-1 text-xs",
                              r.is_active === false ? "text-slate-400" : "text-emerald-700"
                            )}
                          >
                            {r.is_active === false ? "Inactive" : "Active"}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 lg:col-span-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold">Redirect editor</div>
              <div className="mt-1 text-sm text-slate-500">Keep links working when you rename or remove pages.</div>
            </div>
            <StatusPill dirty={dirty} />
          </div>

          {!draft ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
              Select a redirect on the left, or create a new one.
            </div>
          ) : (
            <div className="mt-4 grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-medium text-slate-600">From path</div>
                  <div className="mt-1 flex items-center gap-2">
                    <Input
                      value={draft.from_path || ""}
                      onChange={(e) => {
                        setDraft((d) => ({ ...d, from_path: e.target.value }));
                        setDirty(true);
                      }}
                      placeholder="/old"
                    />
                    <Button tone="secondary" className="shrink-0" onClick={() => openPath(draft.from_path)} title="Open">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-600">To path</div>
                  <div className="mt-1 flex items-center gap-2">
                    <Input
                      value={draft.to_path || ""}
                      onChange={(e) => {
                        setDraft((d) => ({ ...d, to_path: e.target.value }));
                        setDirty(true);
                      }}
                      placeholder="/new"
                    />
                    <Button tone="secondary" className="shrink-0" onClick={() => openPath(draft.to_path)} title="Open">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <div className="text-xs font-medium text-slate-600">Status</div>
                  <div className="mt-1">
                    <Select
                      value={String(draft.status || 301)}
                      onChange={(e) => {
                        setDraft((d) => ({ ...d, status: Number(e.target.value) }));
                        setDirty(true);
                      }}
                    >
                      <option value="301">301</option>
                      <option value="302">302</option>
                    </Select>
                  </div>
                </div>

                <div className="flex items-end">
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={draft.is_active !== false}
                      onChange={(e) => {
                        setDraft((d) => ({ ...d, is_active: e.target.checked }));
                        setDirty(true);
                      }}
                    />
                    Active
                  </label>
                </div>

                <div className="flex items-end justify-end">
                  <Button
                    tone="secondary"
                    onClick={async () => {
                      const ok = await copyText(JSON.stringify(draft, null, 2));
                      setNotice(
                        ok
                          ? { tone: "success", title: "Copied", message: "Redirect JSON copied to clipboard." }
                          : { tone: "danger", title: "Copy failed", message: "Clipboard access was blocked." }
                      );
                    }}
                  >
                    <Copy className="h-4 w-4" />
                    Copy JSON
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <div className="text-xs text-slate-500">ID: {draft.id || "-"}</div>
                <div className="flex items-center gap-2">
                  <Button tone="danger" onClick={requestDelete} disabled={!draft.id || busy}>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                  <Button onClick={saveDraft} disabled={busy || !dirty}>
                    {busy ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
                    Save
                  </Button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="font-semibold">LLM configuration</div>
          <div className="mt-2 text-sm text-slate-600">
            The "AI draft" button uses an OpenAI-compatible endpoint. Configure these server environment variables in your deployment:
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>
                <span className="font-mono">LLM_BASE_URL</span> (example: <span className="font-mono">https://your-llama-host/v1</span>)
              </li>
              <li>
                <span className="font-mono">LLM_API_KEY</span> (optional)
              </li>
              <li>
                <span className="font-mono">LLM_MODEL</span> (example: <span className="font-mono">llama-3.1-70b-instruct</span>)
              </li>
            </ul>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Button
              tone="secondary"
              onClick={async () => {
                const ok = await copyText("LLM_BASE_URL\nLLM_API_KEY\nLLM_MODEL");
                setNotice(
                  ok
                    ? { tone: "success", title: "Copied", message: "Variable names copied to clipboard." }
                    : { tone: "danger", title: "Copy failed", message: "Clipboard access was blocked." }
                );
              }}
            >
              <Copy className="h-4 w-4" />
              Copy var names
            </Button>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="font-semibold">Bootstrap root admin</div>
            <div className="text-xs text-slate-500">Root setup</div>
          </div>
          <div className="mt-2 text-sm text-slate-600">
            Create the first root admin by calling <span className="font-mono">POST /api/admin-auth/bootstrap</span> with header <span className="font-mono">x-bootstrap-token</span> set to <span className="font-mono">ADMIN_BOOTSTRAP_TOKEN</span>.
          </div>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs font-mono whitespace-pre-wrap">
            curl -X POST "$BASE_URL/api/admin-auth/bootstrap" \
  -H "x-bootstrap-token: $ADMIN_BOOTSTRAP_TOKEN" \
  -H "content-type: application/json" \
  -d '{"username":"root","password":"change-me"}'
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Button
              tone="secondary"
              onClick={async () => {
                const ok = await copyText(
                  'curl -X POST "$BASE_URL/api/admin-auth/bootstrap" \\\n  -H "x-bootstrap-token: $ADMIN_BOOTSTRAP_TOKEN" \\\n  -H "content-type: application/json" \\\n  -d \'{"username":"root","password":"change-me"}\''
                );
                setNotice(
                  ok
                    ? { tone: "success", title: "Copied", message: "Bootstrap curl copied to clipboard." }
                    : { tone: "danger", title: "Copy failed", message: "Clipboard access was blocked." }
                );
              }}
            >
              <Copy className="h-4 w-4" />
              Copy curl
            </Button>
            <Button
              tone="secondary"
              onClick={() => window.open("/README_ADMIN.md", "_blank", "noopener,noreferrer")}
            >
              <ExternalLink className="h-4 w-4" />
              Open README
            </Button>
          </div>
        </section>
      </div>

      <AdminModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New redirect"
        desc="Create a redirect to preserve links when you rename or remove a page."
      >
        <div className="grid gap-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="text-xs font-medium text-slate-600">From path</div>
              <div className="mt-1">
                <Input value={newFrom} onChange={(e) => setNewFrom(e.target.value)} placeholder="/old" />
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-600">To path</div>
              <div className="mt-1">
                <Input value={newTo} onChange={(e) => setNewTo(e.target.value)} placeholder="/new" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <div className="text-xs font-medium text-slate-600">Status</div>
              <div className="mt-1">
                <Select value={String(newStatus)} onChange={(e) => setNewStatus(Number(e.target.value))}>
                  <option value="301">301</option>
                  <option value="302">302</option>
                </Select>
              </div>
            </div>
            <div className="flex items-end">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!!newActive} onChange={(e) => setNewActive(e.target.checked)} /> Active
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button tone="secondary" onClick={() => setCreateOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={createRedirect} disabled={busy}>
              {busy ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
              Create
            </Button>
          </div>
        </div>
      </AdminModal>

      <AdminModal
        open={delOpen}
        onClose={() => setDelOpen(false)}
        title="Delete redirect"
        desc="This action is permanent. Type DELETE to confirm."
      >
        <div className="grid gap-3">
          <AdminNotice tone="warning" title="Root-only destructive action">
            Deleting redirects is restricted to root admins. The API will reject non-root deletions.
          </AdminNotice>

          <div>
            <div className="text-xs font-medium text-slate-600">Confirm phrase</div>
            <div className="mt-1">
              <Input value={delPhrase} onChange={(e) => setDelPhrase(e.target.value)} placeholder="DELETE" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button tone="secondary" onClick={() => setDelOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button tone="danger" onClick={doDelete} disabled={busy || delPhrase.trim() !== "DELETE"}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
