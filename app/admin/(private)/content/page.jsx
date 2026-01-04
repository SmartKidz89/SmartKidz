"use client";

import { useEffect, useState } from "react";
import { Search, Save, Edit3, Loader2 } from "lucide-react";
import { Button, Input, Textarea } from "@/components/admin/AdminControls";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminNotice from "@/components/admin/AdminNotice";

export default function AdminContentPage() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  
  const [selectedId, setSelectedId] = useState(null);
  const [editor, setEditor] = useState({ title: "", json: "" });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/lessons?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setLessons(data.lessons || []);
    } catch (e) {
      setNotice({ tone: "danger", title: "Error", message: "Failed to load lessons." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(load, 500);
    return () => clearTimeout(t);
  }, [query]);

  async function loadDetail(id) {
    setNotice(null);
    setSaving(true);
    try {
       const res = await fetch(`/api/admin/lesson/preview?edition_id=${encodeURIComponent(id)}`);
       const data = await res.json();
       if (!res.ok) throw new Error(data.error);
       
       // Map to editor format
       const wrapper = data.data.wrapper_json || data.data.content_json || {};
       setEditor({
         title: data.data.title || "",
         json: JSON.stringify(wrapper, null, 2)
       });
       setSelectedId(id);
    } catch (e) {
       setNotice({ tone: "danger", title: "Error", message: e.message });
    } finally {
       setSaving(false);
    }
  }

  async function save() {
    if (!selectedId) return;
    setSaving(true);
    setNotice(null);
    try {
       let parsed;
       try { parsed = JSON.parse(editor.json); } catch(e) { throw new Error("Invalid JSON"); }

       const res = await fetch("/api/admin/lessons", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
           edition_id: selectedId,
           title: editor.title,
           wrapper_json: parsed
         })
       });
       
       if (!res.ok) throw new Error("Update failed");
       setNotice({ tone: "success", title: "Saved", message: "Lesson updated successfully." });
       load(); // refresh list
    } catch (e) {
       setNotice({ tone: "danger", title: "Error", message: e.message });
    } finally {
       setSaving(false);
    }
  }

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col">
       <AdminPageHeader title="Content Manager" subtitle="Edit lesson definitions and curriculum data." />
       
       {notice && <AdminNotice tone={notice.tone} title={notice.title} className="mb-4">{notice.message}</AdminNotice>}

       <div className="flex-1 flex overflow-hidden border border-slate-200 rounded-xl bg-white shadow-sm">
          
          {/* List */}
          <div className="w-80 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
             <div className="p-3 border-b border-slate-200">
                <div className="relative">
                   <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input 
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="Search lessons..."
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                   />
                </div>
             </div>
             
             <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {loading && <div className="p-4 text-xs text-slate-400 text-center">Loading...</div>}
                {!loading && lessons.map(l => (
                   <button 
                      key={l.edition_id}
                      onClick={() => loadDetail(l.edition_id)}
                      className={`w-full text-left p-3 rounded-lg text-sm transition-all border ${selectedId === l.edition_id ? "bg-white border-indigo-200 shadow-sm ring-1 ring-indigo-500/20" : "border-transparent hover:bg-slate-100 hover:border-slate-200"}`}
                   >
                      <div className="font-bold text-slate-800 truncate">{l.title}</div>
                      <div className="text-xs text-slate-500 flex gap-2 mt-1">
                         <span className="bg-slate-200 px-1.5 rounded">{l.lesson_templates?.subject_id}</span>
                         <span>Yr {l.lesson_templates?.year_level}</span>
                      </div>
                   </button>
                ))}
             </div>
          </div>

          {/* Editor */}
          <div className="flex-1 flex flex-col min-w-0 bg-slate-50/30">
             {!selectedId ? (
                <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Select a lesson to edit.</div>
             ) : (
                <div className="flex flex-col h-full">
                   <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center">
                      <div className="w-1/2">
                         <label className="text-xs font-bold text-slate-500 uppercase">Title</label>
                         <Input value={editor.title} onChange={e => setEditor({...editor, title: e.target.value})} />
                      </div>
                      <Button onClick={save} disabled={saving}>
                         {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                         Save Changes
                      </Button>
                   </div>
                   <div className="flex-1 relative">
                      <textarea 
                         className="absolute inset-0 w-full h-full p-4 font-mono text-xs text-slate-800 bg-transparent outline-none resize-none"
                         value={editor.json}
                         onChange={e => setEditor({...editor, json: e.target.value})}
                         spellCheck={false}
                      />
                   </div>
                </div>
             )}
          </div>
       </div>
    </div>
  );
}