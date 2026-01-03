"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/admin/AdminControls";
import AdminNotice from "@/components/admin/AdminNotice";
import LinkPickerModal from "@/components/cms/builder/LinkPickerModal";
import { 
  Plus, Save, Trash2, ArrowUp, ArrowDown, 
  Globe, Lock, Layout, Link as LinkIcon, ExternalLink, RefreshCw
} from "lucide-react";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function DestinationBadge({ href }) {
  if (!href) return <span className="text-slate-300 text-xs">No link</span>;
  
  if (href.startsWith("http")) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
        <ExternalLink className="w-3 h-3" /> External
      </span>
    );
  }
  
  if (href.startsWith("/app")) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider">
        <Lock className="w-3 h-3" /> App
      </span>
    );
  }
  
  if (href.startsWith("/marketing") || href.startsWith("/")) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
        <Globe className="w-3 h-3" /> Public
      </span>
    );
  }
  
  return null;
}

export default function AdminNavigationPage() {
  const [scope, setScope] = useState("app");
  const [items, setItems] = useState([]);
  const [pages, setPages] = useState([]); // For picker
  
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  
  // Picker State
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTargetIndex, setPickerTargetIndex] = useState(null);

  async function load() {
    setBusy(true); setMsg(null);
    try {
      const [navRes, pagesRes] = await Promise.all([
        fetch(`/api/admin/navigation?scope=${encodeURIComponent(scope)}`),
        fetch("/api/admin/cms-pages")
      ]);

      const navData = await navRes.json();
      const pagesData = await pagesRes.json();

      if (!navRes.ok) throw new Error(navData?.error || "Failed to load navigation");
      
      setItems((navData.items || []).map((x, i) => ({ ...x, sort: x.sort ?? i })));
      setPages(pagesData.pages || []);
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

  async function seedDefaults() {
    if (!confirm(`This will reset the "${scope}" menu to system defaults. Continue?`)) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/navigation/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope })
      });
      if (!res.ok) throw new Error("Seed failed");
      await load();
      setMsg({ type: "success", text: "Menu reset to defaults." });
    } catch (e) {
      setMsg({ type: "error", text: e.message });
      setBusy(false);
    }
  }

  async function save() {
    setBusy(true); setMsg(null);
    try {
      const payload = items.map((x, idx) => ({ ...x, sort: idx }));
      
      // 1. Reorder
      await fetch("/api/admin/navigation", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "reorder", items: payload }),
      });
      
      // 2. Upsert each to save content changes
      for (const item of payload) {
         await fetch("/api/admin/navigation", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(item),
         });
      }
      
      setMsg({ type: "success", text: "Navigation map updated successfully." });
      await load();
    } catch (e) {
      setMsg({ type: "error", text: e.message });
    } finally {
      setBusy(false);
    }
  }

  async function del(id) {
    if (!confirm("Remove this link from the menu?")) return;
    setBusy(true);
    try {
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

  const openPicker = (index) => {
    setPickerTargetIndex(index);
    setPickerOpen(true);
  };

  const handlePick = (href) => {
    if (pickerTargetIndex !== null) {
      update(pickerTargetIndex, { href });
    }
    setPickerOpen(false);
    setPickerTargetIndex(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Layout className="w-6 h-6 text-indigo-600" />
          Site Map & Navigation
        </h1>
        <p className="text-slate-500">
          Control the branch structure of your website. Link menus to internal pages or external URLs.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-2">
           <span className="text-sm font-bold text-slate-600 uppercase tracking-wider mr-2">Menu Scope:</span>
           <select 
             value={scope} 
             onChange={e => setScope(e.target.value)}
             className="h-10 pl-3 pr-8 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 outline-none bg-slate-50 hover:bg-white transition-colors"
           >
              <option value="app">App (Authenticated)</option>
              <option value="marketing">Marketing (Public)</option>
           </select>
        </div>
        <div className="flex gap-2">
           <Button onClick={add} tone="ghost"><Plus className="w-4 h-4 mr-2" /> Add Item</Button>
           <Button onClick={save} disabled={busy}><Save className="w-4 h-4 mr-2" /> Save Changes</Button>
        </div>
      </div>

      {msg && (
         <AdminNotice tone={msg.type === "error" ? "danger" : "success"} title={msg.type === "error" ? "Error" : "Success"}>
            {msg.text}
         </AdminNotice>
      )}

      {/* Navigation List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
         <div className="grid grid-cols-[auto_1fr_2fr_120px_120px_auto] gap-4 px-6 py-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <div className="w-8 text-center">Ord</div>
            <div>Label</div>
            <div>Destination Link</div>
            <div>Visibility</div>
            <div>Min Role</div>
            <div className="text-right">Actions</div>
         </div>
         
         <div className="divide-y divide-slate-100">
            {items.map((item, i) => (
               <div key={item.id} className="grid grid-cols-[auto_1fr_2fr_120px_120px_auto] gap-4 px-6 py-4 items-start hover:bg-slate-50/50 transition-colors group">
                  
                  {/* Sort Controls */}
                  <div className="flex flex-col gap-1 w-8 pt-1">
                     <button onClick={() => move(i, -1)} className="text-slate-300 hover:text-indigo-600 disabled:opacity-20" disabled={i === 0}><ArrowUp className="w-4 h-4 mx-auto" /></button>
                     <button onClick={() => move(i, 1)} className="text-slate-300 hover:text-indigo-600 disabled:opacity-20" disabled={i === items.length - 1}><ArrowDown className="w-4 h-4 mx-auto" /></button>
                  </div>
                  
                  {/* Label */}
                  <div>
                    <input 
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                      value={item.label}
                      onChange={e => update(i, { label: e.target.value })}
                      placeholder="Menu Label"
                    />
                  </div>
                  
                  {/* Destination */}
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input 
                          className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm font-mono text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                          value={item.href}
                          onChange={e => update(i, { href: e.target.value })}
                          placeholder="/path"
                        />
                      </div>
                      <button 
                        onClick={() => openPicker(i)}
                        className="px-3 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg border border-slate-200 hover:bg-white hover:border-indigo-300 hover:text-indigo-600 transition-all"
                      >
                        Pick
                      </button>
                    </div>
                    <div>
                      <DestinationBadge href={item.href} />
                    </div>
                  </div>
                  
                  {/* Visibility */}
                  <div>
                    <select
                      className="w-full px-2 py-2 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none bg-white"
                      value={String(item.visible ?? true)}
                      onChange={e => update(i, { visible: e.target.value === "true" })}
                    >
                       <option value="true">Visible</option>
                       <option value="false">Hidden</option>
                    </select>
                  </div>

                  {/* Role */}
                  <div>
                    <select
                      className="w-full px-2 py-2 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none bg-white"
                      value={item.min_role || "public"}
                      onChange={e => update(i, { min_role: e.target.value })}
                    >
                       <option value="public">Public</option>
                       <option value="user">User</option>
                       <option value="admin">Admin</option>
                       <option value="root">Root</option>
                    </select>
                  </div>

                  {/* Delete */}
                  <div className="text-right pt-1">
                     <button onClick={() => del(item.id)} className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
               </div>
            ))}
            
            {items.length === 0 && (
               <div className="p-12 text-center text-slate-400">
                 <Globe className="w-12 h-12 mx-auto mb-3 opacity-20" />
                 <p className="text-sm font-medium">No links found in this menu.</p>
                 <button onClick={seedDefaults} className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-indigo-700 transition-all">
                    <RefreshCw className="w-4 h-4" /> Seed Default Links
                 </button>
               </div>
            )}
         </div>
      </div>

      <LinkPickerModal
        open={pickerOpen}
        pages={pages}
        value={items[pickerTargetIndex]?.href || ""}
        onPick={handlePick}
        onClose={() => setPickerOpen(false)}
      />

    </div>
  );
}