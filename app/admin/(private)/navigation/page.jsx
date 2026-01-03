"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/admin/AdminControls";
import AdminNotice from "@/components/admin/AdminNotice";
import { Plus, Save, Trash2, GripVertical, ArrowUp, ArrowDown } from "lucide-react";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
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
      setMsg({ type: "error", text: e.message });
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
    setItems((arr) => [...arr, {
      id: `new_${Date.now()}`,
      scope,
      label: "New Link",
      href: "/",
      sort: arr.length,
      visible: true,
      min_role: "public"
    }]);
  }

  async function save() {
    setBusy(true); setMsg(null);
    try {
      const payload = items.map((x, idx) => ({ ...x, sort: idx }));
      // We send one by one or batch if API supported it. The current API supports one-by-one upsert or 'reorder' action.
      // Let's use reorder action which is safer for bulk updates if available, otherwise just save them.
      // Actually, checking previous code, POST supports { action: 'reorder', items: ... }
      
      const res = await fetch("/api/admin/navigation", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "reorder", items: payload }),
      });
      
      // Also need to save content changes (labels/hrefs) which reorder doesn't do.
      // For MVP we just iterate upsert.
      for (const item of payload) {
         await fetch("/api/admin/navigation", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(item),
         });
      }
      
      setMsg({ type: "success", text: "Navigation updated successfully." });
      await load();
    } catch (e) {
      setMsg({ type: "error", text: e.message });
    } finally {
      setBusy(false);
    }
  }

  async function del(id) {
    if (!confirm("Delete this link?")) return;
    setBusy(true);
    try {
      // If it's a new item not in DB (starts with new_), just filter local
      if (id.startsWith("new_")) {
         setItems(items.filter(i => i.id !== id));
      } else {
         await fetch(`/api/admin/navigation?id=${encodeURIComponent(id)}`, { method: "DELETE" });
         await load();
      }
    } catch (e) {
      setMsg({ type: "error", text: e.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div>
           <h1 className="text-xl font-bold text-slate-900">Navigation</h1>
           <p className="text-sm text-slate-500">Manage main menu links.</p>
        </div>
        <div className="flex gap-3">
           <select 
             value={scope} 
             onChange={e => setScope(e.target.value)}
             className="h-10 pl-3 pr-8 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 outline-none"
           >
              <option value="app">App (Private)</option>
              <option value="marketing">Marketing (Public)</option>
           </select>
           <Button onClick={add} tone="ghost"><Plus className="w-4 h-4 mr-2" /> Add Link</Button>
           <Button onClick={save} disabled={busy}><Save className="w-4 h-4 mr-2" /> Save Changes</Button>
        </div>
      </div>

      {msg && (
         <AdminNotice tone={msg.type === "error" ? "danger" : "success"} title={msg.type === "error" ? "Error" : "Success"}>
            {msg.text}
         </AdminNotice>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
         <div className="grid grid-cols-[auto_1fr_1fr_120px_120px_auto] gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <div className="w-8">Sort</div>
            <div>Label</div>
            <div>Destination</div>
            <div>Visibility</div>
            <div>Role</div>
            <div className="text-right">Actions</div>
         </div>
         
         <div className="divide-y divide-slate-100">
            {items.map((item, i) => (
               <div key={item.id} className="grid grid-cols-[auto_1fr_1fr_120px_120px_auto] gap-4 px-6 py-3 items-center hover:bg-slate-50/50 transition-colors">
                  <div className="flex flex-col gap-1 w-8">
                     <button onClick={() => move(i, -1)} className="text-slate-400 hover:text-indigo-600 disabled:opacity-30" disabled={i === 0}><ArrowUp className="w-4 h-4" /></button>
                     <button onClick={() => move(i, 1)} className="text-slate-400 hover:text-indigo-600 disabled:opacity-30" disabled={i === items.length - 1}><ArrowDown className="w-4 h-4" /></button>
                  </div>
                  
                  <input 
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    value={item.label}
                    onChange={e => update(i, { label: e.target.value })}
                    placeholder="Link Label"
                  />
                  
                  <input 
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    value={item.href}
                    onChange={e => update(i, { href: e.target.value })}
                    placeholder="/path"
                  />
                  
                  <select
                    className="w-full px-2 py-2 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none"
                    value={String(item.visible ?? true)}
                    onChange={e => update(i, { visible: e.target.value === "true" })}
                  >
                     <option value="true">Visible</option>
                     <option value="false">Hidden</option>
                  </select>

                  <select
                    className="w-full px-2 py-2 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none"
                    value={item.min_role || "public"}
                    onChange={e => update(i, { min_role: e.target.value })}
                  >
                     <option value="public">Public</option>
                     <option value="user">User</option>
                     <option value="admin">Admin</option>
                     <option value="root">Root</option>
                  </select>

                  <div className="text-right">
                     <button onClick={() => del(item.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
               </div>
            ))}
            
            {items.length === 0 && (
               <div className="p-8 text-center text-slate-500">No links found for this scope.</div>
            )}
         </div>
      </div>
    </div>
  );
}