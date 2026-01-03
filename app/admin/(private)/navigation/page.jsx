"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import AdminNotice from "@/components/admin/AdminNotice";
import AdminModal from "@/components/admin/AdminModal";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function Button({ children, tone = "primary", className, ...props }) {
  const base = "rounded-xl px-3 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed";
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

function Select({ className, ...props }) {
  return (
    <select
      className={cx(
        "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-200",
        className
      )}
      {...props}
    />
  );
}

const ICON_HINT = "Lucide icon name (e.g., Home, Settings, BookOpen)";

function normalizeItem(it) {
  if (!it) return null;
  return {
    id: it.id,
    scope: it.scope || "app",
    label: it.label || "",
    href: it.href || "",
    icon: it.icon || "",
    min_role: it.min_role || "admin",
    is_active: it.is_active !== false,
    sort: Number.isFinite(Number(it.sort)) ? Number(it.sort) : 0,
    updated_at: it.updated_at || null,
  };
}

export default function AdminNavigationPage() {
  const [scope, setScope] = useState("app");

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null); // { tone, title, message }

  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // all | active | inactive
  const [minRoleFilter, setMinRoleFilter] = useState("all"); // all | admin | root

  const [form, setForm] = useState({ label: "", href: "", icon: "", min_role: "admin", is_active: true });
  const baselineRef = useRef({ label: "", href: "", icon: "", min_role: "admin", is_active: true });

  const [orderDirty, setOrderDirty] = useState(false);

  const [newOpen, setNewOpen] = useState(false);
  const [newForm, setNewForm] = useState({ label: "", href: "", icon: "", min_role: "admin", is_active: true });
  const [deleteOpen, setDeleteOpen] = useState(false);

  const isDirty = useMemo(() => {
    return JSON.stringify(form) !== JSON.stringify(baselineRef.current);
  }, [form]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      if (activeFilter === "active" && it.is_active !== true) return false;
      if (activeFilter === "inactive" && it.is_active !== false) return false;
      if (minRoleFilter !== "all" && String(it.min_role || "admin") !== minRoleFilter) return false;
      if (!q) return true;
      const label = String(it.label || "").toLowerCase();
      const href = String(it.href || "").toLowerCase();
      const icon = String(it.icon || "").toLowerCase();
      return label.includes(q) || href.includes(q) || icon.includes(q);
    });
  }, [items, query, activeFilter, minRoleFilter]);

  const selected = useMemo(() => {
    return normalizeItem(items.find((x) => x.id === selectedId));
  }, [items, selectedId]);

  async function load({ keepSelection = true } = {}) {
    setLoading(true);
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/navigation?scope=${encodeURIComponent(scope)}`, { cache: "no-store" });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Failed to load navigation items.");
      const list = (json?.items || []).map(normalizeItem);
      setItems(list);
      setOrderDirty(false);

      if (!keepSelection) return;
      if (selectedId) {
        const exists = list.some((x) => x.id === selectedId);
        if (!exists) setSelectedId(null);
      }
      if (!selectedId && list.length) setSelectedId(list[0].id);
    } catch (e) {
      setNotice({ tone: "danger", title: "Load failed", message: e.message || String(e) });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);

  useEffect(() => {
    if (!selected) {
      setForm({ label: "", href: "", icon: "", min_role: "admin", is_active: true });
      baselineRef.current = { label: "", href: "", icon: "", min_role: "admin", is_active: true };
      return;
    }
    const next = {
      label: selected.label,
      href: selected.href,
      icon: selected.icon || "",
      min_role: selected.min_role || "admin",
      is_active: selected.is_active !== false,
    };
    setForm(next);
    baselineRef.current = next;
  }, [selectedId]);

  function move(id, dir) {
    setItems((prev) => {
      const idx = prev.findIndex((x) => x.id === id);
      if (idx < 0) return prev;
      const j = idx + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      const tmp = next[idx];
      next[idx] = next[j];
      next[j] = tmp;
      return next.map((it, k) => ({ ...it, sort: k }));
    });
    setOrderDirty(true);
  }

  async function saveOrder() {
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/navigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reorder", items: items.map((x, i) => ({ id: x.id, sort: i })) }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Failed to save order.");
      setNotice({ tone: "success", title: "Saved", message: "Navigation order updated." });
      setOrderDirty(false);
      await load();
    } catch (e) {
      setNotice({ tone: "danger", title: "Save failed", message: e.message || String(e) });
    } finally {
      setBusy(false);
    }
  }

  async function saveItem() {
    if (!selected) return;
    const label = String(form.label || "").trim();
    const href = String(form.href || "").trim();
    if (!label || !href) {
      setNotice({ tone: "warning", title: "Missing fields", message: "Label and href are required." });
      return;
    }

    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/navigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...selected,
          scope,
          label,
          href,
          icon: form.icon ? String(form.icon).trim() : null,
          min_role: form.min_role,
          is_active: form.is_active,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Save failed.");
      baselineRef.current = { ...form, label, href, icon: form.icon || "" };
      setNotice({ tone: "success", title: "Saved", message: "Navigation item updated." });
      await load();
    } catch (e) {
      setNotice({ tone: "danger", title: "Save failed", message: e.message || String(e) });
    } finally {
      setBusy(false);
    }
  }

  function openNew() {
    setNewForm({ label: "", href: "", icon: "", min_role: "admin", is_active: true });
    setNewOpen(true);
  }

  async function createNew() {
    const label = String(newForm.label || "").trim();
    const href = String(newForm.href || "").trim();
    if (!label || !href) {
      setNotice({ tone: "warning", title: "Missing fields", message: "Label and href are required." });
      return;
    }

    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/navigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope,
          label,
          href,
          icon: newForm.icon ? String(newForm.icon).trim() : null,
          min_role: newForm.min_role,
          is_active: newForm.is_active,
          sort: items.length,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Create failed.");
      setNewOpen(false);
      setNotice({ tone: "success", title: "Created", message: "Navigation item created." });
      await load({ keepSelection: false });
      const createdId = json?.item?.id;
      if (createdId) setSelectedId(createdId);
    } catch (e) {
      setNotice({ tone: "danger", title: "Create failed", message: e.message || String(e) });
    } finally {
      setBusy(false);
    }
  }

  function requestDelete() {
    if (!selected) return;
    setDeleteOpen(true);
  }

  async function confirmDelete() {
    if (!selected) return;
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/navigation?id=${encodeURIComponent(selected.id)}`, { method: "DELETE" });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Delete failed.");
      setDeleteOpen(false);
      setNotice({ tone: "success", title: "Deleted", message: "Navigation item removed." });
      setSelectedId(null);
      await load({ keepSelection: false });
    } catch (e) {
      setNotice({ tone: "danger", title: "Delete failed", message: e.message || String(e) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xl font-semibold">Navigation</div>
          <div className="mt-1 text-sm text-slate-500">Configure global navigation items with scope, role gating, and ordering.</div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="w-44">
            <Select value={scope} onChange={(e) => setScope(e.target.value)} aria-label="Scope">
              <option value="app">App</option>
              <option value="marketing">Marketing</option>
            </Select>
          </div>
          <Button tone="secondary" onClick={() => load()} disabled={busy || loading}>
            Refresh
          </Button>
          <Button onClick={openNew} disabled={busy}>
            New item
          </Button>
          <Button tone="secondary" onClick={saveOrder} disabled={busy || loading || !orderDirty}>
            Save order
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

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-5">
            <div className="md:col-span-3">
              <Input placeholder="Search label, href, icon…" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <div>
              <Select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)} aria-label="Active filter">
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
            <div>
              <Select value={minRoleFilter} onChange={(e) => setMinRoleFilter(e.target.value)} aria-label="Min role filter">
                <option value="all">All roles</option>
                <option value="admin">admin+</option>
                <option value="root">root only</option>
              </Select>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <div>
              Showing <span className="font-medium text-slate-700">{filtered.length}</span> of{" "}
              <span className="font-medium text-slate-700">{items.length}</span>
            </div>
            <div className="flex items-center gap-2">
              {(query || activeFilter !== "all" || minRoleFilter !== "all") && (
                <Button
                  tone="secondary"
                  className="py-1"
                  onClick={() => {
                    setQuery("");
                    setActiveFilter("all");
                    setMinRoleFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              )}
              {orderDirty ? <span className="rounded-full bg-amber-50 px-2 py-1 text-amber-700">Order not saved</span> : null}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3">
          {/* List */}
          <div className="border-b border-slate-200 p-4 md:border-b-0 md:border-r">
            {loading ? (
              <div className="text-sm text-slate-500">Loading…</div>
            ) : filtered.length ? (
              <div className="space-y-2">
                {filtered.map((it) => {
                  const active = it.id === selectedId;
                  return (
                    <div
                      key={it.id}
                      className={cx(
                        "rounded-2xl border p-3 transition",
                        active ? "border-slate-300 bg-slate-50" : "border-slate-200 hover:bg-slate-50"
                      )}
                    >
                      <button className="w-full text-left" onClick={() => setSelectedId(it.id)}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-slate-900">{it.label}</div>
                            <div className="mt-0.5 truncate text-xs text-slate-500">{it.href}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {it.min_role === "root" ? (
                              <span className="rounded-full bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white">ROOT</span>
                            ) : (
                              <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">admin+</span>
                            )}
                            {it.is_active ? (
                              <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">Active</span>
                            ) : (
                              <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">Inactive</span>
                            )}
                          </div>
                        </div>
                      </button>

                      <div className="mt-3 flex items-center justify-between gap-2">
                        <div className="flex gap-2">
                          <button
                            className="rounded-lg border border-slate-200 px-2 py-1 text-xs hover:bg-white"
                            onClick={() => move(it.id, -1)}
                            title="Move up"
                            aria-label="Move up"
                          >
                            ↑
                          </button>
                          <button
                            className="rounded-lg border border-slate-200 px-2 py-1 text-xs hover:bg-white"
                            onClick={() => move(it.id, 1)}
                            title="Move down"
                            aria-label="Move down"
                          >
                            ↓
                          </button>
                        </div>
                        {it.icon ? <div className="text-xs text-slate-500">Icon: {it.icon}</div> : <div className="text-xs text-slate-400">No icon</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-slate-500">No navigation items match the current filters.</div>
            )}
          </div>

          {/* Detail */}
          <div className="p-4 md:col-span-2">
            {!selected ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                Select an item to edit.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900">Edit item</div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      ID: <span className="font-mono">{selected.id}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {isDirty ? (
                      <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">Unsaved changes</span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">Saved</span>
                    )}
                    <Button tone="secondary" onClick={() => window.open(form.href || selected.href, "_blank")}>
                      Preview link
                    </Button>
                    <Button tone="danger" onClick={requestDelete}>
                      Delete
                    </Button>
                    <Button onClick={saveItem} disabled={busy || !isDirty}>
                      Save
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <div className="text-xs font-medium text-slate-600">Label</div>
                    <div className="mt-1">
                      <Input value={form.label} onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-600">Href</div>
                    <div className="mt-1">
                      <Input value={form.href} onChange={(e) => setForm((p) => ({ ...p, href: e.target.value }))} placeholder="/app/p/help" />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-600">Icon</div>
                    <div className="mt-1">
                      <Input value={form.icon} onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))} placeholder={ICON_HINT} />
                    </div>
                    <div className="mt-1 text-xs text-slate-500">Optional. Matches lucide icon export name.</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-600">Minimum role</div>
                    <div className="mt-1">
                      <Select value={form.min_role} onChange={(e) => setForm((p) => ({ ...p, min_role: e.target.value }))}>
                        <option value="admin">admin</option>
                        <option value="root">root</option>
                      </Select>
                    </div>
                    <div className="mt-1 text-xs text-slate-500">If set to root, non-root admins should not see this link.</div>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Active</div>
                    <div className="text-xs text-slate-500">Inactive items remain stored but will not render in navigation.</div>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
                    />
                    <span className="text-slate-700">Enabled</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AdminModal
        open={newOpen}
        title="New navigation item"
        description="Create a new navigation link for the selected scope."
        onClose={() => setNewOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button tone="secondary" onClick={() => setNewOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createNew} disabled={busy}>
              Create
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="md:col-span-1">
            <div className="text-xs font-medium text-slate-600">Label</div>
            <div className="mt-1">
              <Input value={newForm.label} onChange={(e) => setNewForm((p) => ({ ...p, label: e.target.value }))} />
            </div>
          </div>
          <div className="md:col-span-1">
            <div className="text-xs font-medium text-slate-600">Href</div>
            <div className="mt-1">
              <Input value={newForm.href} onChange={(e) => setNewForm((p) => ({ ...p, href: e.target.value }))} placeholder="/app/p/help" />
            </div>
          </div>
          <div className="md:col-span-1">
            <div className="text-xs font-medium text-slate-600">Icon</div>
            <div className="mt-1">
              <Input value={newForm.icon} onChange={(e) => setNewForm((p) => ({ ...p, icon: e.target.value }))} placeholder={ICON_HINT} />
            </div>
          </div>
          <div className="md:col-span-1">
            <div className="text-xs font-medium text-slate-600">Minimum role</div>
            <div className="mt-1">
              <Select value={newForm.min_role} onChange={(e) => setNewForm((p) => ({ ...p, min_role: e.target.value }))}>
                <option value="admin">admin</option>
                <option value="root">root</option>
              </Select>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={newForm.is_active}
                onChange={(e) => setNewForm((p) => ({ ...p, is_active: e.target.checked }))}
              />
              <span className="text-slate-700">Active</span>
            </label>
          </div>
        </div>
      </AdminModal>

      <AdminModal
        open={deleteOpen}
        title="Delete navigation item"
        description="This action is restricted to root admins and cannot be undone."
        onClose={() => setDeleteOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button tone="secondary" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button tone="danger" onClick={confirmDelete} disabled={busy}>
              Delete
            </Button>
          </div>
        }
      >
        <div className="text-sm text-slate-700">
          Delete <span className="font-semibold">{selected?.label || "this item"}</span>? This will remove it from the database.
        </div>
      </AdminModal>
    </div>
  );
}
