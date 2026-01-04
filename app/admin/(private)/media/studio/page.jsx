"use client";

import { useEffect, useState } from "react";
import { 
  Folder, Image as ImageIcon, ChevronRight, ChevronDown, 
  Sparkles, Save, Github, Loader2, Link as LinkIcon 
} from "lucide-react";
import { Button, Input, Textarea } from "@/components/admin/AdminControls";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminNotice from "@/components/admin/AdminNotice";
import { cx } from "@/components/admin/adminUi";

function FileTree({ path = "", onSelect, selectedPath, level = 0 }) {
  const [items, setItems] = useState([]);
  const [expanded, setExpanded] = useState(level === 0); // Auto-expand root
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  async function loadItems() {
    if (hasLoaded) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/code?path=${encodeURIComponent(path)}`);
      const data = await res.json();
      if (data.type === "dir") {
          // Filter only dirs and images
          const filtered = data.entries.filter(e => 
              e.type === "dir" || 
              /\.(png|jpg|jpeg|webp|svg)$/i.test(e.name)
          );
          setItems(filtered);
      }
      setHasLoaded(true);
    } catch {} 
    setLoading(false);
  }

  // Load root immediately
  useEffect(() => { 
    if (level === 0) loadItems(); 
  }, []);

  function toggle() {
    const nextState = !expanded;
    setExpanded(nextState);
    if (nextState) loadItems();
  }

  const label = path.split('/').pop() || path;

  // Render entry
  return (
    <div>
      <button 
        onClick={toggle}
        className={cx(
          "w-full flex items-center gap-2 px-2 py-1 text-xs hover:bg-slate-100 rounded text-slate-700 mb-0.5",
          selectedPath === path && "bg-indigo-50 text-indigo-700 font-bold"
        )}
        style={{ paddingLeft: level * 12 + 8 }}
      >
        {expanded ? (
           <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
        ) : (
           <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
        )}
        <Folder className={cx("w-3.5 h-3.5 shrink-0", expanded ? "text-indigo-500" : "text-indigo-400")} />
        <span className="truncate">{label}</span>
      </button>
      
      {expanded && (
        <div>
          {loading ? (
            <div className="pl-6 py-1 text-[10px] text-slate-400 flex items-center gap-2" style={{ paddingLeft: (level + 1) * 12 + 8 }}>
               <Loader2 className="w-3 h-3 animate-spin" /> Loading...
            </div>
          ) : (
            items.map(i => (
              i.type === "dir" ? (
                <FileTree key={i.path} path={i.path} onSelect={onSelect} selectedPath={selectedPath} level={level + 1} />
              ) : (
                <button
                  key={i.path}
                  onClick={() => onSelect(i.path)}
                  className={cx(
                    "w-full flex items-center gap-2 px-2 py-1 text-xs text-left hover:bg-slate-100 rounded mb-0.5",
                    selectedPath === i.path 
                      ? "bg-indigo-600 text-white font-medium hover:bg-indigo-700" 
                      : "text-slate-600"
                  )}
                  style={{ paddingLeft: (level + 1) * 12 + 8 }}
                >
                  <ImageIcon className="w-3.5 h-3.5 opacity-70 shrink-0" />
                  <span className="truncate">{i.name}</span>
                </button>
              )
            ))
          )}
          {!loading && items.length === 0 && (
             <div className="text-[10px] text-slate-400 py-1" style={{ paddingLeft: (level + 1) * 12 + 8 }}>
                (empty)
             </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ImageStudioPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [comfyUrl, setComfyUrl] = useState("https://comfy.smartkidz.app");
  const [prompt, setPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState(null); // data url
  const [generatedBase64, setGeneratedBase64] = useState(null); // raw b64
  
  const [status, setStatus] = useState("idle"); // idle, generating, saving
  const [notice, setNotice] = useState(null);

  // When selecting a file, set initial state
  const handleSelect = (path) => {
      setSelectedFile(path);
      setGeneratedImage(null);
      setGeneratedBase64(null);
      setNotice(null);
      // Try to guess a prompt from filename
      const name = path.split('/').pop().split('.')[0].replace(/[-_]/g, ' ');
      setPrompt(`A high quality educational illustration of ${name}, vector style, flat colors, white background`);
  };

  async function generate() {
    if (!prompt) return;
    setStatus("generating");
    setNotice(null);

    try {
        const res = await fetch("/api/admin/image-gen", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, comfyUrl })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        
        setGeneratedImage(data.image);
        setGeneratedBase64(data.base64);
        setStatus("idle");
    } catch (e) {
        setNotice({ tone: "danger", title: "Generation Failed", message: e.message });
        setStatus("idle");
    }
  }

  async function commit() {
    if (!generatedBase64 || !selectedFile) return;
    if (!confirm(`Overwrite ${selectedFile} and push to GitHub? This cannot be undone.`)) return;

    setStatus("saving");
    try {
        const res = await fetch("/api/admin/code/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                path: selectedFile, 
                content: generatedBase64,
                encoding: "base64"
            })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        
        setNotice({ tone: "success", title: "Updated", message: `Pushed new image to ${selectedFile}` });
        setGeneratedImage(null); // Clear preview to indicate completion
        setGeneratedBase64(null);
    } catch (e) {
        setNotice({ tone: "danger", title: "Commit Failed", message: e.message });
    } finally {
        setStatus("idle");
    }
  }

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col">
      <AdminPageHeader 
        title="Image Studio" 
        subtitle="Replace codebase assets with AI-generated visuals."
        backLink="/admin/media"
      />

      <div className="flex-1 flex overflow-hidden border border-slate-200 rounded-xl bg-white shadow-sm">
         
         {/* Left: File Picker */}
         <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
            <div className="p-3 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
               Public Assets
            </div>
            <div className="flex-1 overflow-y-auto p-2">
               <FileTree path="public" onSelect={handleSelect} selectedPath={selectedFile} />
            </div>
         </div>

         {/* Center: Workspace */}
         <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
            {notice && <AdminNotice tone={notice.tone} title={notice.title} className="mb-6">{notice.message}</AdminNotice>}

            {selectedFile ? (
               <div className="max-w-3xl mx-auto space-y-6">
                  
                  {/* Config Panel */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                     <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-900">Generator Settings</h3>
                        <div className="text-xs font-mono text-slate-400">{selectedFile}</div>
                     </div>
                     
                     <div className="grid gap-4">
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1">ComfyUI URL</label>
                           <Input value={comfyUrl} onChange={e => setComfyUrl(e.target.value)} />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Prompt</label>
                           <Textarea 
                             value={prompt} 
                             onChange={e => setPrompt(e.target.value)} 
                             rows={3}
                           />
                        </div>
                     </div>
                     
                     <div className="flex justify-end">
                        <Button onClick={generate} disabled={status !== "idle"}>
                           {status === "generating" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                           {status === "generating" ? "Generating..." : "Generate Preview"}
                        </Button>
                     </div>
                  </div>

                  {/* Preview / Compare */}
                  <div className="grid md:grid-cols-2 gap-6">
                     {/* Original */}
                     <div>
                        <div className="text-xs font-bold text-slate-500 uppercase mb-2">Original</div>
                        <div className="aspect-video bg-slate-200 rounded-xl overflow-hidden border border-slate-300 flex items-center justify-center relative">
                           {/* Using a timestamp to bust cache if we just updated it, though Next image cache is sticky */}
                           <img src={`/${selectedFile.replace(/^public\//, '')}`} alt="Original" className="max-w-full max-h-full object-contain" />
                        </div>
                     </div>

                     {/* New */}
                     <div>
                        <div className="text-xs font-bold text-slate-500 uppercase mb-2">New Generation</div>
                        <div className="aspect-video bg-slate-200 rounded-xl overflow-hidden border border-slate-300 flex items-center justify-center relative">
                           {generatedImage ? (
                              <img src={generatedImage} alt="Generated" className="w-full h-full object-contain" />
                           ) : (
                              <div className="text-slate-400 text-xs">Preview will appear here</div>
                           )}
                        </div>
                     </div>
                  </div>

                  {/* Actions */}
                  {generatedImage && (
                     <div className="flex justify-end pt-4 border-t border-slate-200">
                        <Button tone="danger" onClick={commit} disabled={status === "saving"}>
                           {status === "saving" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Github className="w-4 h-4 mr-2" />}
                           Overwrite & Commit
                        </Button>
                     </div>
                  )}

               </div>
            ) : (
               <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <ImageIcon className="w-12 h-12 mb-3 opacity-20" />
                  <p>Select an image from the sidebar to modify.</p>
               </div>
            )}
         </div>

      </div>
    </div>
  );
}