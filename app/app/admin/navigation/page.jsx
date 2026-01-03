"use client";

import { useEffect, useMemo, useState } from "react";
import { Page as PageScaffold } from "@/components/ui/PageScaffold";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Save, Trash2, ChevronUp, ChevronDown } from "lucide-react";

function newItem(scope) {
  return {
    id: `nav_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    scope,
    label: "New item",
    href: "/",
    icon: "",
    sort: 1000,
    visible: true,
    min_role: "public",
  };
}

export default function AdminNavigationPage() {
  const [scope, setScope] = useState("app");
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  async function load() {
    setBusy(true); setMsg(null);
    try {
      const res = await fetch(`/api/admin/navigation?scope=${encodeURIComponent(scope)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load navigation");
      setItems((data.items || []).map((x, i) => ({ ...x, sort: x.sort ?? i })));
    } catch (e) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => { load(); }, [scope]);

  function move(i, dir) {
    setItems((arr) => {
      const j = i + dir;
      if (j < 0 || j >= arr.length) return arr;
      const next = [...arr];
      const tmp = next[i];
      next[i] = next[j];
      next[j] = tmp;
      return next.map((x, idx) => ({ ...x, sort: idx }));
    });
  }

  function update(i, patch) {
    setItems((arr) => arr.map((x, idx) => idx === i ? { ...x, ...patch } : x));
  }

  function add() {
    setItems((arr) => [...arr, { ...newItem(scope), sort: arr.length }]);
  }

  async function save() {
    setBusy(true); setMsg(null);
    try {
      const payload = items.map((x, idx) => ({ ...x, sort: idx }));
      const res = await fetch("/api/admin/navigation", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ items: payload }),
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

  async function del(id) {
    if (!confirm("Delete this nav item?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/navigation?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Delete failed");
      await load();
    } catch (e) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageScaffold title="Navigation">
      <main className="min-h-[70vh]">
        <div className="container-pad py-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm text-slate-600">Configure menus and deep-links.</div>
              {msg && <div className="mt-2 text-sm font-semibold text-slate-800">{msg}</div>}
            </div>

            <div className="flex items-center gap-2">
              <select
                className="h-10 rounded-2xl border border-slate-300 px-3"
                value={scope}
                onChange={(e) => setScope(e.target.value)}
              >
                <option value="app">App navigation</option>
                <option value="marketing">Marketing navigation</option>
              </select>
              <Button onClick={add} variant="ghost">
                <span className="inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Add</span>
              </Button>
              <Button onClick={save} disabled={busy}>
                <span className="inline-flex items-center gap-2"><Save className="w-4 h-4" /> Save</span>
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            {items.map((it, i) => (
              <Card key={it.id} className="p-4">
                <div className="grid gap-3 lg:grid-cols-[1fr_1.2fr_140px_140px_120px] lg:items-end">
                  <label className="grid gap-1 text-sm font-semibold text-slate-800">
                    Label
                    <input
                      className="h-11 rounded-2xl border border-slate-300 px-4"
                      value={it.label || ""}
                      onChange={(e) => update(i, { label: e.target.value })}
                    />
                  </label>
                  <label className="grid gap-1 text-sm font-semibold text-slate-800">
                    Href
                    <input
                      className="h-11 rounded-2xl border border-slate-300 px-4"
                      value={it.href || ""}
                      onChange={(e) => update(i, { href: e.target.value })}
                      placeholder="/app/p/help or /marketing/p/about"
                    />
                  </label>
                  <label className="grid gap-1 text-sm font-semibold text-slate-800">
                    Visible
                    <select
                      className="h-11 rounded-2xl border border-slate-300 px-3"
                      value={String(it.visible ?? true)}
                      onChange={(e) => update(i, { visible: e.target.value === "true" })}
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </label>
                  <label className="grid gap-1 text-sm font-semibold text-slate-800">
                    Min role
                    <select
                      className="h-11 rounded-2xl border border-slate-300 px-3"
                      value={it.min_role || "public"}
                      onChange={(e) => update(i, { min_role: e.target.value })}
                    >
                      <option value="public">Public</option>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="root">Root</option>
                    </select>
                  </label>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => move(i, -1)}><ChevronUp className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => move(i, +1)}><ChevronDown className="w-4 h-4" /></Button>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => del(it.id)}>
                      <span className="inline-flex items-center gap-2 text-rose-700"><Trash2 className="w-4 h-4" /> Delete</span>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            {!busy && items.length === 0 && (
              <div className="text-sm text-slate-600">No items yet.</div>
            )}
          </div>
        </div>
      </main>
    </PageScaffold>
  );
}
