"use client";

import { useEffect, useState } from "react";

const ICON_HINT = "Optional: lucide icon name (e.g., Home, Settings, BookOpen)";

export default function AdminNavigationPage() {
  const [items, setItems] = useState([]);
  const [scope, setScope] = useState("app");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    setMsg("");
    const res = await fetch(`/api/admin/navigation?scope=${encodeURIComponent(scope)}`, { cache: "no-store" });
    const j = await res.json();
    if (!res.ok) throw new Error(j?.error || "Failed to load");
    setItems(j.items || []);
  }

  useEffect(() => { load().catch((e) => setMsg(e.message)); }, [scope]);

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
  }

  async function saveOrder() {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/navigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reorder", items: items.map((x, i) => ({ id: x.id, sort: i })) }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed to save");
      setMsg("Order saved.");
      await load();
    } catch (e) {
      setMsg(e.message || "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function upsert(item) {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/navigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed to save");
      setMsg("Saved.");
      await load();
    } catch (e) {
      setMsg(e.message || "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    if (!confirm("Delete this nav item? (root only)")) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch(`/api/admin/navigation?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Delete failed");
      setMsg("Deleted.");
      await load();
    } catch (e) {
      setMsg(e.message || "Failed");
    } finally {
      setBusy(false);
    }
  }

  function newItem() {
    const label = prompt("Label?") || "";
    if (!label.trim()) return;
    const href = prompt("Href? (e.g., /app/p/help)") || "";
    if (!href.trim()) return;
    upsert({ scope, label, href, sort: items.length, is_active: true, min_role: "admin" });
  }

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xl font-semibold">Navigation</div>
          <div className="text-sm text-slate-500 mt-1">
            Edit global nav items. Root can delete; admins can edit/add.
          </div>
        </div>

        <div className="flex gap-2">
          <select
            className="h-10 rounded-xl border border-slate-200 px-3 bg-white"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
          >
            <option value="app">App</option>
            <option value="marketing">Marketing</option>
          </select>
          <button className="h-10 rounded-xl bg-slate-900 text-white px-4 hover:bg-slate-800" onClick={newItem}>
            Add item
          </button>
          <button className="h-10 rounded-xl border border-slate-200 px-4 hover:bg-slate-50" onClick={saveOrder} disabled={busy}>
            Save order
          </button>
        </div>
      </div>

      {msg ? <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">{msg}</div> : null}

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="py-2 pr-3">Order</th>
              <th className="py-2 pr-3">Label</th>
              <th className="py-2 pr-3">Href</th>
              <th className="py-2 pr-3">Icon</th>
              <th className="py-2 pr-3">Min role</th>
              <th className="py-2 pr-3">Active</th>
              <th className="py-2 pr-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr key={it.id} className="border-t border-slate-100">
                <td className="py-2 pr-3">
                  <div className="flex gap-2">
                    <button className="rounded-lg border border-slate-200 px-2 py-1 hover:bg-slate-50" onClick={() => move(it.id, -1)}>↑</button>
                    <button className="rounded-lg border border-slate-200 px-2 py-1 hover:bg-slate-50" onClick={() => move(it.id, 1)}>↓</button>
                  </div>
                </td>
                <td className="py-2 pr-3">
                  <input className="h-9 w-44 rounded-lg border border-slate-200 px-2" defaultValue={it.label} onBlur={(e)=> upsert({ ...it, label: e.target.value })} />
                </td>
                <td className="py-2 pr-3">
                  <input className="h-9 w-72 rounded-lg border border-slate-200 px-2" defaultValue={it.href} onBlur={(e)=> upsert({ ...it, href: e.target.value })} />
                </td>
                <td className="py-2 pr-3">
                  <input className="h-9 w-56 rounded-lg border border-slate-200 px-2" placeholder={ICON_HINT} defaultValue={it.icon || ""} onBlur={(e)=> upsert({ ...it, icon: e.target.value || null })} />
                </td>
                <td className="py-2 pr-3">
                  <select className="h-9 rounded-lg border border-slate-200 px-2 bg-white" defaultValue={it.min_role || "admin"} onChange={(e)=> upsert({ ...it, min_role: e.target.value })}>
                    <option value="admin">admin</option>
                    <option value="root">root</option>
                  </select>
                </td>
                <td className="py-2 pr-3">
                  <input type="checkbox" defaultChecked={it.is_active !== false} onChange={(e)=> upsert({ ...it, is_active: e.target.checked })} />
                </td>
                <td className="py-2 pr-3">
                  <button className="rounded-lg border border-slate-200 px-3 py-1 hover:bg-slate-50" onClick={() => remove(it.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 ? <div className="text-sm text-slate-500 mt-4">No navigation items yet.</div> : null}
      </div>
    </div>
  );
}
