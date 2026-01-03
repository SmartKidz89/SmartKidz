"use client";

import { useEffect, useMemo, useState } from "react";
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import { Button } from "@/components/ui/Button"; 
import { useAdminMe } from "@/components/admin/useAdminMe";
import { BLOCK_TYPES, defaultBlock, normalizePageContent } from "@/lib/cms/blocks";
import { RenderBlocks } from "@/components/cms/RenderBlocks"; // Import named export
import { useUndoRedoState } from "@/components/cms/builder/useUndoRedo";
import LinkPickerModal from "@/components/cms/builder/LinkPickerModal";
import AssetPickerModal from "@/components/cms/builder/AssetPickerModal";
import AdminNotice from "@/components/admin/AdminNotice";
import AdminModal from "@/components/admin/AdminModal";

import {
  ChevronDown,
  ChevronUp,
  Eye,
  Plus,
  Redo2,
  Save,
  Trash2,
  Undo2,
  Layout,
  Search,
  Settings,
  FileText,
  Smartphone,
  Tablet,
  Monitor,
  Palette,
  Type,
  FileQuestion
} from "lucide-react";

function slugify(input) {
  return (input || "")
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9\-\/]+/g, "")
    .toLowerCase();
}

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

export default function SiteBuilderEditor() {
  const { role, loading, authenticated } = useAdminMe();
  const canUse = !loading && authenticated && (role === "admin" || role === "root");

  const [pages, setPages] = useState([]);
  const [loadingPages, setLoadingPages] = useState(true);
  const [assets, setAssets] = useState([]);
  
  // Selection State
  const [selectedId, setSelectedId] = useState(null);
  const [selectedMeta, setSelectedMeta] = useState(null);

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const [device, setDevice] = useState("desktop"); // desktop | tablet | mobile
  const [previewMode, setPreviewMode] = useState(false);
  
  // Inspector Tabs
  const [sidebarTab, setSidebarTab] = useState("content"); // content | style

  // Pickers
  const [linkPicker, setLinkPicker] = useState({ open: false, value: "", onPick: null });
  const [assetPicker, setAssetPicker] = useState({ open: false, onPick: null });

  // Page Data
  const [scheduleAt, setScheduleAt] = useState("");
  const [pageSettingsTab, setPageSettingsTab] = useState("general"); // general | seo

  const [dirty, setDirty] = useState(false);
  const [pageQuery, setPageQuery] = useState("");
  
  // Create Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ title: "", scope: "marketing" });

  // Content State
  const [content, setContent, history] = useUndoRedoState({ version: 1, seo: {}, blocks: [] }, { limit: 50 });
  const [selectedBlockId, setSelectedBlockId] = useState(null);

  const blocks = Array.isArray(content?.blocks) ? content.blocks : [];
  const selectedBlock = useMemo(() => blocks.find((b) => b?.id === selectedBlockId) || null, [blocks, selectedBlockId]);

  // Loaders
  async function loadPages() {
    setLoadingPages(true);
    try {
      const res = await fetch("/api/admin/cms-pages", { cache: "no-store" });
      const j = await res.json();
      if (res.ok) setPages(j.pages || []);
    } catch (e) {
      console.error("Failed to load pages", e);
    } finally {
      setLoadingPages(false);
    }
  }

  async function loadAssets() {
    try {
      const res = await fetch("/api/admin/assets", { cache: "no-store" });
      if (res.ok) {
        const j = await res.json();
        setAssets(j.assets || []);
      }
    } catch {}
  }

  async function loadPage(id) {
    setMsg(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/cms-pages?id=${encodeURIComponent(id)}`, { cache: "no-store" });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed");
      const page = j.pages?.[0];
      if (!page) throw new Error("Not found");

      const normalized = normalizePageContent(page.content_json);
      
      setSelectedMeta(page);
      setSelectedId(page.id);
      history.reset(normalized);
      setSelectedBlockId(null);
      setDirty(false);
      setPreviewMode(false);
    } catch (e) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (canUse) {
       loadPages();
       loadAssets();
    }
  }, [canUse]);

  // Mutations
  function addBlock(type) {
    const blk = defaultBlock(type);
    setDirty(true);
    setContent((c) => ({ ...c, blocks: [...(c.blocks || []), blk] }));
    setSelectedBlockId(blk.id);
    setSidebarTab("content");
  }

  function updateBlock(blockId, patch) {
    setDirty(true);
    setContent((c) => ({
      ...c,
      blocks: (c.blocks || []).map((b) => (b.id === blockId ? { ...b, ...patch } : b)),
    }));
  }

  function updateSeo(patch) {
    setDirty(true);
    setContent((c) => ({
      ...c,
      seo: { ...c.seo, ...patch }
    }));
  }

  function removeBlock(blockId) {
    setDirty(true);
    setContent((c) => ({ ...c, blocks: (c.blocks || []).filter((b) => b.id !== blockId) }));
    if (selectedBlockId === blockId) setSelectedBlockId(null);
  }

  function moveBlock(blockId, dir) {
    setDirty(true);
    setContent((c) => {
      const list = [...(c.blocks || [])];
      const idx = list.findIndex((b) => b.id === blockId);
      if (idx < 0) return c;
      const j = idx + dir;
      if (j < 0 || j >= list.length) return c;
      const tmp = list[idx];
      list[idx] = list[j];
      list[j] = tmp;
      return { ...c, blocks: list };
    });
  }

  async function save() {
    if (!selectedMeta) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/cms-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedMeta.id,
          scope: selectedMeta.scope,
          slug: selectedMeta.slug,
          title: selectedMeta.title,
          published: !!selectedMeta.published,
          content_json: content,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      const j = await res.json();
      setSelectedMeta(prev => ({ ...prev, updated_at: j.page.updated_at }));
      setDirty(false);
      setMsg("Saved successfully.");
      await loadPages();
    } catch (e) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function createPage() {
    if(!createForm.title) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/cms-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: createForm.title,
          slug: slugify(createForm.title),
          scope: createForm.scope,
          published: false
        })
      });
      const j = await res.json();
      if(j.page) {
        await loadPages();
        await loadPage(j.page.id);
        setCreateOpen(false);
      }
    } catch(e) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  }

  const filteredPages = useMemo(() => {
    const q = pageQuery.trim().toLowerCase();
    return pages.filter(p => !q || (p.title || "").toLowerCase().includes(q));
  }, [pages, pageQuery]);

  if (!canUse) return <div className="p-12 text-center text-slate-500">Loading editor...</div>;

  return (
    <div className="h-[calc(100vh-60px)] flex flex-col bg-white">
      
      {/* 1. Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2 shrink-0 bg-white z-20">
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 text-slate-900 font-black">
             <Layout className="w-5 h-5 text-indigo-600" /> Site Builder
           </div>
           {selectedMeta && (
             <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                <span className="font-bold text-slate-500 uppercase">{selectedMeta.scope}</span>
                <span className="text-slate-300">/</span>
                <span className="font-mono text-slate-700">{selectedMeta.slug}</span>
                {dirty && <span className="ml-2 w-2 h-2 rounded-full bg-amber-400" />}
             </div>
           )}
        </div>
        <div className="flex items-center gap-2">
           <Button variant="ghost" size="sm" onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4 mr-1" /> New</Button>
           <div className="h-6 w-px bg-slate-200 mx-1" />
           <Button variant="ghost" size="sm" onClick={history.undo} disabled={!history.canUndo}><Undo2 className="w-4 h-4" /></Button>
           <Button variant="ghost" size="sm" onClick={history.redo} disabled={!history.canRedo}><Redo2 className="w-4 h-4" /></Button>
           <div className="h-6 w-px bg-slate-200 mx-1" />
           <Button variant={previewMode ? "secondary" : "ghost"} size="sm" onClick={() => setPreviewMode(!previewMode)}>
             <Eye className="w-4 h-4 mr-1" /> Preview
           </Button>
           <Button onClick={save} disabled={!dirty || busy} size="sm">
             <Save className="w-4 h-4 mr-1" /> {busy ? "Saving..." : "Save"}
           </Button>
        </div>
      </div>

      {msg && <div className="bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800 text-center border-b border-emerald-100">{msg}</div>}

      <div className="flex-1 flex overflow-hidden">
         {/* Left: Pages */}
         <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
            <div className="p-3 border-b border-slate-200">
               <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none" placeholder="Find page..." value={pageQuery} onChange={e => setPageQuery(e.target.value)} />
               </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
               {loadingPages && <div className="p-4 text-xs text-slate-400 text-center">Loading pages...</div>}
               
               {!loadingPages && filteredPages.length === 0 && (
                 <div className="p-6 text-center">
                    <FileQuestion className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <div className="text-xs text-slate-500 font-bold mb-1">No CMS Pages</div>
                    <p className="text-[10px] text-slate-400 leading-snug mb-3">
                       This builder is for new dynamic content (e.g. landing pages). It does not edit hardcoded system routes.
                    </p>
                    <button onClick={() => setCreateOpen(true)} className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold shadow-sm hover:bg-indigo-700 w-full">
                       Create First Page
                    </button>
                 </div>
               )}

               {filteredPages.map(p => (
                 <button key={p.id} onClick={() => loadPage(p.id)} className={cx("w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all", selectedId === p.id ? "bg-white shadow-sm ring-1 ring-slate-200 text-indigo-700" : "text-slate-600 hover:text-slate-900")}>
                    <div className="truncate">{p.title || "Untitled"}</div>
                    <div className="flex justify-between mt-1 opacity-70 text-[10px]">
                       <span className="font-mono uppercase">{p.scope}</span>
                       <span className={cx("w-1.5 h-1.5 rounded-full", p.published ? "bg-emerald-400" : "bg-slate-300")} />
                    </div>
                 </button>
               ))}
            </div>
         </div>

         {/* Center: Canvas */}
         <div className="flex-1 bg-slate-100/50 overflow-y-auto p-8 relative flex flex-col items-center" onClick={() => setSelectedBlockId(null)}>
            {selectedMeta ? (
               <div 
                 className={cx(
                   "w-full bg-white shadow-2xl transition-all duration-300 min-h-[800px]",
                   device === "mobile" ? "max-w-[375px] rounded-3xl border-8 border-slate-800 my-8" : 
                   device === "tablet" ? "max-w-[768px] rounded-xl my-8" : "max-w-full"
                 )}
                 onClick={e => e.stopPropagation()}
               >
                 <RenderBlocks 
                   content={content} 
                   selectable={!previewMode} 
                   selectedBlockId={selectedBlockId} 
                   onSelectBlock={(id) => { setSelectedBlockId(id); setSidebarTab("content"); }} 
                 />
                 {!content.blocks?.length && <div className="py-32 text-center text-slate-400 italic">Page is empty. Add blocks from the sidebar.</div>}
               </div>
            ) : (
               <div className="m-auto text-slate-400 flex flex-col items-center">
                  <Layout className="w-12 h-12 mb-3 opacity-20" />
                  <div>Select a page to edit</div>
               </div>
            )}
            
            <div className="absolute bottom-6 flex gap-1 bg-slate-900 text-white p-1 rounded-full shadow-lg z-30">
               <button onClick={() => setDevice("desktop")} className={cx("p-2 rounded-full", device === "desktop" ? "bg-white text-slate-900" : "text-slate-400 hover:text-white")}><Monitor className="w-4 h-4" /></button>
               <button onClick={() => setDevice("tablet")} className={cx("p-2 rounded-full", device === "tablet" ? "bg-white text-slate-900" : "text-slate-400 hover:text-white")}><Tablet className="w-4 h-4" /></button>
               <button onClick={() => setDevice("mobile")} className={cx("p-2 rounded-full", device === "mobile" ? "bg-white text-slate-900" : "text-slate-400 hover:text-white")}><Smartphone className="w-4 h-4" /></button>
            </div>
         </div>

         {/* Right: Inspector */}
         <div className="w-80 bg-white border-l border-slate-200 flex flex-col shrink-0">
            {selectedMeta ? (
              selectedBlock ? (
                 <>
                   {/* Block Inspector Header */}
                   <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex gap-4">
                         <button onClick={() => setSidebarTab("content")} className={cx("text-xs font-bold uppercase pb-1 border-b-2 transition-colors", sidebarTab === "content" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400")}>Content</button>
                         <button onClick={() => setSidebarTab("style")} className={cx("text-xs font-bold uppercase pb-1 border-b-2 transition-colors", sidebarTab === "style" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400")}>Design</button>
                      </div>
                      <button onClick={() => removeBlock(selectedBlock.id)} className="text-rose-500 p-1 hover:bg-rose-50 rounded"><Trash2 className="w-4 h-4" /></button>
                   </div>
                   
                   <div className="flex-1 overflow-y-auto p-5">
                      {sidebarTab === "content" ? (
                         <BlockFields 
                           block={selectedBlock} 
                           onChange={p => updateBlock(selectedBlock.id, p)}
                           onLink={(v, cb) => setLinkPicker({ open: true, value: v, onPick: cb })}
                           onAsset={(cb) => setAssetPicker({ open: true, onPick: cb })}
                         />
                      ) : (
                         <BlockStyles 
                           style={selectedBlock.style || {}} 
                           onChange={s => updateBlock(selectedBlock.id, { style: { ...(selectedBlock.style || {}), ...s } })} 
                         />
                      )}
                   </div>
                   <div className="p-3 border-t border-slate-100 bg-slate-50 flex justify-between">
                      <button onClick={() => moveBlock(selectedBlock.id, -1)} className="p-2 hover:bg-white rounded border border-transparent hover:border-slate-200"><ChevronUp className="w-4 h-4" /></button>
                      <button onClick={() => moveBlock(selectedBlock.id, 1)} className="p-2 hover:bg-white rounded border border-transparent hover:border-slate-200"><ChevronDown className="w-4 h-4" /></button>
                   </div>
                 </>
              ) : (
                 <>
                   {/* Page Settings & Add Block */}
                   <div className="px-4 py-3 border-b border-slate-100 flex gap-4">
                      <button onClick={() => setPageSettingsTab("general")} className={cx("text-xs font-bold uppercase pb-1 border-b-2 transition-colors", pageSettingsTab === "general" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400")}>Add Block</button>
                      <button onClick={() => setPageSettingsTab("seo")} className={cx("text-xs font-bold uppercase pb-1 border-b-2 transition-colors", pageSettingsTab === "seo" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400")}>Page SEO</button>
                   </div>

                   <div className="flex-1 overflow-y-auto p-5 space-y-6">
                      {pageSettingsTab === "general" ? (
                         <div className="grid grid-cols-2 gap-2">
                            {Object.keys(BLOCK_TYPES).map(type => (
                               <button key={type} onClick={() => addBlock(type)} className="p-3 bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 rounded-xl text-left transition-all group">
                                  <div className="font-bold text-xs text-slate-700 group-hover:text-indigo-700">{BLOCK_TYPES[type]}</div>
                               </button>
                            ))}
                         </div>
                      ) : (
                         <div className="space-y-4">
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Page Title</label>
                               <input className="w-full p-2 border rounded-lg text-sm" value={selectedMeta.title} onChange={e => { setDirty(true); setSelectedMeta(m => ({ ...m, title: e.target.value })) }} />
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">URL Slug</label>
                               <div className="flex items-center px-2 py-2 border rounded-lg bg-slate-50 text-sm text-slate-500">
                                  <span>/{selectedMeta.scope}/</span>
                                  <input className="bg-transparent outline-none w-full ml-1 text-slate-900" value={selectedMeta.slug} onChange={e => { setDirty(true); setSelectedMeta(m => ({ ...m, slug: slugify(e.target.value) })) }} />
                               </div>
                            </div>
                            <hr />
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Meta Title</label>
                               <input className="w-full p-2 border rounded-lg text-sm" value={content.seo?.metaTitle || ""} onChange={e => updateSeo({ metaTitle: e.target.value })} placeholder="Browser Tab Title" />
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Meta Description</label>
                               <textarea className="w-full p-2 border rounded-lg text-sm h-24" value={content.seo?.metaDescription || ""} onChange={e => updateSeo({ metaDescription: e.target.value })} placeholder="Search engine summary..." />
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Social Image (OG)</label>
                               <div className="flex gap-2">
                                  <input className="w-full p-2 border rounded-lg text-sm" value={content.seo?.ogImage || ""} onChange={e => updateSeo({ ogImage: e.target.value })} placeholder="https://..." />
                                  <button onClick={() => setAssetPicker({ open: true, onPick: a => updateSeo({ ogImage: a.public_url }) })} className="px-3 bg-slate-100 border rounded-lg text-xs font-bold">Pick</button>
                               </div>
                            </div>
                            <div className="flex items-center justify-between pt-2">
                               <span className="text-sm font-medium text-slate-700">No-Index (Hide from Google)</span>
                               <input type="checkbox" checked={!!content.seo?.noIndex} onChange={e => updateSeo({ noIndex: e.target.checked })} className="w-4 h-4 accent-indigo-600" />
                            </div>
                         </div>
                      )}
                   </div>
                 </>
              )
            ) : (
              <div className="p-8 text-center text-slate-400 text-sm">No page selected.</div>
            )}
         </div>
      </div>

      {/* Create Modal */}
      <AdminModal open={createOpen} onClose={() => setCreateOpen(false)} title="New Page">
         <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label>
              <input className="w-full p-2 border rounded-lg" value={createForm.title} onChange={e => setCreateForm({...createForm, title: e.target.value})} autoFocus />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Scope</label>
              <select className="w-full p-2 border rounded-lg" value={createForm.scope} onChange={e => setCreateForm({...createForm, scope: e.target.value})}>
                 <option value="marketing">Marketing (Public)</option>
                 <option value="app">App (Private)</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
               <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
               <Button onClick={createPage} disabled={!createForm.title}>Create</Button>
            </div>
         </div>
      </AdminModal>

      <LinkPickerModal open={linkPicker.open} value={linkPicker.value} onPick={linkPicker.onPick} onClose={() => setLinkPicker({ open: false, value: "", onPick: null })} pages={pages} />
      <AssetPickerModal open={assetPicker.open} onPick={assetPicker.onPick} onClose={() => setAssetPicker({ open: false, onPick: null })} assets={assets} />

    </div>
  );
}

function BlockStyles({ style, onChange }) {
   const colors = [
     { id: "white", bg: "bg-white border border-slate-200" },
     { id: "light", bg: "bg-slate-50 border border-slate-200" },
     { id: "dark", bg: "bg-slate-900 border border-slate-900" },
     { id: "brand", bg: "bg-indigo-600 border border-indigo-600" },
   ];
   
   return (
     <div className="space-y-6">
        <div>
           <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Background</label>
           <div className="flex gap-2">
              {colors.map(c => (
                 <button 
                   key={c.id} 
                   onClick={() => onChange({ bg: c.id })}
                   className={cx("w-8 h-8 rounded-full shadow-sm ring-offset-1 transition-all", c.bg, style.bg === c.id ? "ring-2 ring-indigo-500 scale-110" : "")} 
                 />
              ))}
           </div>
        </div>

        <div>
           <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Vertical Padding</label>
           <div className="flex bg-slate-50 rounded-lg p-1 border border-slate-200">
              {["none", "sm", "md", "lg", "xl"].map(p => (
                 <button 
                   key={p} 
                   onClick={() => onChange({ padding: p })}
                   className={cx("flex-1 py-1 text-xs font-medium rounded-md transition-all", style.padding === p ? "bg-white shadow text-indigo-600" : "text-slate-500 hover:text-slate-900")}
                 >
                   {p}
                 </button>
              ))}
           </div>
        </div>

        <div>
           <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Text Align</label>
           <div className="flex bg-slate-50 rounded-lg p-1 border border-slate-200">
              {["left", "center", "right"].map(a => (
                 <button 
                   key={a} 
                   onClick={() => onChange({ align: a })}
                   className={cx("flex-1 py-1 text-xs font-medium rounded-md transition-all capitalize", style.align === a ? "bg-white shadow text-indigo-600" : "text-slate-500 hover:text-slate-900")}
                 >
                   {a}
                 </button>
              ))}
           </div>
        </div>
     </div>
   );
}

function BlockFields({ block, onChange, onLink, onAsset }) {
   const Input = (p) => <input className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none" {...p} />;
   const Area = (p) => <textarea className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none min-h-[80px]" {...p} />;
   
   if (block.type === "section" || block.type === "split") {
      return (
         <div className="space-y-4">
            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label><Input value={block.title || ""} onChange={e => onChange({ title: e.target.value })} /></div>
            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Body</label><Area value={block.body || ""} onChange={e => onChange({ body: e.target.value })} /></div>
            {block.type === "split" && (
               <>
                  <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Image URL</label>
                     <div className="flex gap-2"><Input value={block.imageUrl || ""} onChange={e => onChange({ imageUrl: e.target.value })} /><button onClick={() => onAsset(a => onChange({ imageUrl: a.public_url }))} className="px-3 bg-slate-100 border rounded-lg text-xs font-bold">Pick</button></div>
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Layout</label>
                     <select className="w-full p-2 border rounded-lg text-sm" value={block.imagePosition} onChange={e => onChange({ imagePosition: e.target.value })}><option value="right">Text Left / Image Right</option><option value="left">Image Left / Text Right</option></select>
                  </div>
               </>
            )}
         </div>
      );
   }

   if (block.type === "hero") {
      return (
         <div className="space-y-4">
            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Headline</label><Input value={block.headline || ""} onChange={e => onChange({ headline: e.target.value })} /></div>
            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subheadline</label><Area value={block.subheadline || ""} onChange={e => onChange({ subheadline: e.target.value })} /></div>
            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">CTA Text</label><Input value={block.ctaText || ""} onChange={e => onChange({ ctaText: e.target.value })} /></div>
            <div>
               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">CTA Link</label>
               <div className="flex gap-2"><Input value={block.ctaHref || ""} onChange={e => onChange({ ctaHref: e.target.value })} /><button onClick={() => onLink(block.ctaHref, h => onChange({ ctaHref: h }))} className="px-3 bg-slate-100 border rounded-lg text-xs font-bold">Pick</button></div>
            </div>
         </div>
      );
   }

   if (block.type === "faq") {
      return (
         <div className="space-y-4">
            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Section Title</label><Input value={block.title || ""} onChange={e => onChange({ title: e.target.value })} /></div>
            <div className="space-y-3">
               <label className="block text-xs font-bold text-slate-500 uppercase">Items</label>
               {(block.items || []).map((item, i) => (
                  <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 relative group">
                     <button onClick={() => onChange({ items: block.items.filter((_, idx) => idx !== i) })} className="absolute top-2 right-2 text-slate-400 hover:text-rose-500"><Trash2 className="w-3 h-3" /></button>
                     <Input placeholder="Question" value={item.question} onChange={e => { const n = [...block.items]; n[i].question = e.target.value; onChange({ items: n }); }} />
                     <Area placeholder="Answer" value={item.answer} onChange={e => { const n = [...block.items]; n[i].answer = e.target.value; onChange({ items: n }); }} />
                  </div>
               ))}
               <button onClick={() => onChange({ items: [...(block.items || []), { id: Date.now(), question: "", answer: "" }] })} className="w-full py-2 bg-white border border-dashed border-slate-300 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-800">+ Add Item</button>
            </div>
         </div>
      );
   }
   
   if (block.type === "video") {
      return (
         <div className="space-y-4">
            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">YouTube URL</label><Input value={block.url || ""} onChange={e => onChange({ url: e.target.value })} placeholder="https://youtube.com/watch?v=..." /></div>
            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Caption</label><Input value={block.caption || ""} onChange={e => onChange({ caption: e.target.value })} /></div>
         </div>
      );
   }

   if (block.type === "markdown") {
      return <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Content</label><Area className="font-mono text-xs min-h-[300px]" value={block.markdown || ""} onChange={e => onChange({ markdown: e.target.value })} /></div>;
   }

   return <div className="text-sm text-slate-400 italic">No fields configured for this block type.</div>;
}