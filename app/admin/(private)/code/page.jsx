"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Folder, FileCode, ChevronRight, ChevronDown, Save, 
  Github, RefreshCw, AlertTriangle, CheckCircle2 
} from "lucide-react";
import { Button } from "@/components/admin/AdminControls";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { cx } from "@/components/admin/adminUi";

function FileTree({ path = "", onSelect, selectedPath, level = 0 }) {
  const [items, setItems] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  // Auto-expand root folders
  useEffect(() => { if (level === 0) setExpanded(true); }, [level]);

  async function toggle() {
    if (!expanded && items.length === 0) {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/code?path=${encodeURIComponent(path)}`);
        const data = await res.json();
        if (data.type === "dir") setItems(data.entries);
      } catch {} 
      setLoading(false);
    }
    setExpanded(!expanded);
  }

  // Load root immediately
  useEffect(() => {
    if (path === "") toggle();
  }, []);

  if (path !== "" && !expanded) {
    return (
      <button 
        onClick={toggle}
        className={cx(
          "w-full flex items-center gap-2 px-2 py-1 text-xs hover:bg-slate-100 rounded text-slate-700",
          selectedPath === path && "bg-indigo-50 text-indigo-700 font-bold"
        )}
        style={{ paddingLeft: level * 12 + 8 }}
      >
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <Folder className="w-3.5 h-3.5 text-indigo-400" />
        <span className="truncate">{path.split('/').pop()}</span>
      </button>
    );
  }

  return (
    <div>
      {path !== "" && (
        <button 
          onClick={() => setExpanded(false)}
          className="w-full flex items-center gap-2 px-2 py-1 text-xs hover:bg-slate-100 rounded text-slate-700"
          style={{ paddingLeft: level * 12 + 8 }}
        >
          <ChevronDown className="w-3 h-3 text-slate-400" />
          <Folder className="w-3.5 h-3.5 text-indigo-400" />
          <span className="truncate">{path.split('/').pop()}</span>
        </button>
      )}
      
      {loading ? (
        <div className="pl-6 text-[10px] text-slate-400">Loading...</div>
      ) : (
        items.map(i => (
          i.type === "dir" ? (
            <FileTree key={i.path} path={i.path} onSelect={onSelect} selectedPath={selectedPath} level={level + 1} />
          ) : (
            <button
              key={i.path}
              onClick={() => onSelect(i.path)}
              className={cx(
                "w-full flex items-center gap-2 px-2 py-1 text-xs text-left hover:bg-slate-100 rounded",
                selectedPath === i.path 
                  ? "bg-indigo-600 text-white font-medium hover:bg-indigo-700" 
                  : "text-slate-600"
              )}
              style={{ paddingLeft: (level + 1) * 12 + 8 }}
            >
              <FileCode className="w-3.5 h-3.5 opacity-70" />
              <span className="truncate">{i.name}</span>
            </button>
          )
        ))
      )}
    </div>
  );
}

export default function CodeEditorPage() {
  const [activeFile, setActiveFile] = useState(null);
  const [content, setContent] = useState("");
  const [original, setOriginal] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, saving, syncing
  const [msg, setMsg] = useState(null);

  async function openFile(path) {
    if (content !== original && !confirm("Discard unsaved changes?")) return;
    
    setActiveFile(path);
    setStatus("loading");
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/code?path=${encodeURIComponent(path)}`);
      const data = await res.json();
      if (data.type === "file") {
        setContent(data.content);
        setOriginal(data.content);
        setStatus("idle");
      }
    } catch (e) {
      setMsg({ type: "error", text: "Failed to open file" });
      setStatus("idle");
    }
  }

  async function saveFile() {
    setStatus("saving");
    try {
      const res = await fetch("/api/admin/code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: activeFile, content })
      });
      if (!res.ok) throw new Error("Save failed");
      setOriginal(content);
      setMsg({ type: "success", text: "Saved to disk" });
      setTimeout(() => setMsg(null), 2000);
    } catch (e) {
      setMsg({ type: "error", text: e.message });
    } finally {
      setStatus("idle");
    }
  }

  async function pushToGit() {
    if (content !== original) {
      if(!confirm("You have unsaved changes. Save to disk first?")) return;
      await saveFile();
    }
    
    setStatus("syncing");
    try {
      const res = await fetch("/api/admin/code/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: activeFile })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMsg({ type: "success", text: "Committed to GitHub" });
    } catch (e) {
      setMsg({ type: "error", text: e.message });
    } finally {
      setStatus("idle");
    }
  }

  const isDirty = content !== original;

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col">
      <AdminPageHeader 
        title="Code Editor" 
        subtitle="Root-level file system access."
        className="mb-4"
        actions={
          activeFile && (
            <div className="flex gap-2">
               <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1.5 rounded-lg flex items-center">
                 {activeFile}
                 {isDirty && <span className="ml-2 text-amber-500 font-bold">*</span>}
               </span>
               <Button onClick={saveFile} disabled={status !== "idle" || !isDirty} size="sm">
                  <Save className="w-4 h-4 mr-2" /> {status === "saving" ? "Saving..." : "Save"}
               </Button>
               <Button onClick={pushToGit} disabled={status !== "idle"} tone="secondary" size="sm">
                  <Github className="w-4 h-4 mr-2" /> {status === "syncing" ? "Pushing..." : "Sync to GitHub"}
               </Button>
            </div>
          )
        }
      />

      <div className="flex-1 flex overflow-hidden border border-slate-200 rounded-xl bg-white shadow-sm">
        
        {/* Sidebar */}
        <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col">
           <div className="p-3 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
             Project Root
           </div>
           <div className="flex-1 overflow-y-auto p-2">
              <FileTree onSelect={openFile} selectedPath={activeFile} />
           </div>
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col relative bg-slate-900">
           {activeFile ? (
             <textarea 
               className="flex-1 w-full h-full p-4 bg-transparent text-slate-200 font-mono text-xs leading-relaxed resize-none outline-none"
               value={content}
               onChange={e => setContent(e.target.value)}
               spellCheck={false}
             />
           ) : (
             <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
                Select a file to edit
             </div>
           )}
           
           {/* Footer Status */}
           <div className="h-8 bg-slate-800 border-t border-slate-700 flex items-center px-4 text-[10px] text-slate-400 justify-between">
              <div>{activeFile ? `${content.split('\n').length} lines` : "Ready"}</div>
              {msg && (
                <div className={cx("flex items-center gap-1.5", msg.type === "error" ? "text-rose-400" : "text-emerald-400")}>
                   {msg.type === "error" ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                   {msg.text}
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}