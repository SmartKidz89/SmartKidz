"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Image as ImageIcon,
  RefreshCcw,
  UploadCloud,
  Link as LinkIcon,
  Trash2,
  Search,
  X,
  FileIcon
} from "lucide-react";
import AdminNotice from "@/components/admin/AdminNotice";
import AdminModal from "@/components/admin/AdminModal";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/admin/AdminControls";
import { cx } from "@/components/admin/adminUi";
import { useAdminMe } from "@/components/admin/useAdminMe";

function bytesToHuman(n) {
  const num = Number(n || 0);
  if (!Number.isFinite(num) || num <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let v = num;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${i === 0 ? String(Math.round(v)) : v.toFixed(1)} ${units[i]}`;
}

export default function AdminMediaPage() {
  const me = useAdminMe();
  const isRoot = me?.role === "root";

  const [assets, setAssets] = useState([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadAlt, setUploadAlt] = useState("");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function load() {
    setNotice(null);
    const res = await fetch("/api/admin/assets", { cache: "no-store" });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(j?.error || "Failed to load assets");
    setAssets(j.assets || []);
  }

  useEffect(() => {
    load().catch((e) => setNotice({ tone: "danger", title: "Error", message: e.message }));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return assets;
    return assets.filter((a) => {
      const hay = `${a.path || ""} ${a.alt_text || ""} ${(a.tags || []).join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [assets, query]);

  const selected = useMemo(() => assets.find((a) => a.id === selectedId) || null, [assets, selectedId]);

  async function onUpload() {
    if (!uploadFile) return;
    setBusy(true);
    setNotice(null);

    try {
      const fd = new FormData();
      fd.set("file", uploadFile);
      if (uploadAlt.trim()) fd.set("alt_text", uploadAlt.trim());

      const res = await fetch("/api/admin/assets", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const j = await res.json();

      setNotice({ tone: "success", title: "Uploaded", message: "Asset saved." });
      setUploadOpen(false);
      setUploadFile(null);
      setUploadAlt("");
      await load();
      if (j?.asset?.id) setSelectedId(j.asset.id);
    } catch (e) {
      setNotice({ tone: "danger", title: "Error", message: e.message });
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    if (!deleteTarget?.id) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/assets?id=${encodeURIComponent(deleteTarget.id)}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setNotice({ tone: "success", title: "Deleted", message: "Asset removed." });
      setDeleteOpen(false);
      setDeleteTarget(null);
      if (selectedId === deleteTarget.id) setSelectedId(null);
      await load();
    } catch (e) {
      setNotice({ tone: "danger", title: "Error", message: e.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <AdminPageHeader 
        title="Media Library" 
        subtitle="Manage images, documents, and generated assets."
        actions={
          <>
            <Button tone="ghost" onClick={load} disabled={busy}>
              <RefreshCcw className={cx("w-4 h-4", busy && "animate-spin")} />
            </Button>
            <Button onClick={() => setUploadOpen(true)} disabled={busy}>
              <UploadCloud className="w-4 h-4 mr-2" /> Upload
            </Button>
          </>
        }
      />

      {notice && <AdminNotice tone={notice.tone} title={notice.title} className="mb-6">{notice.message}</AdminNotice>}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Main Grid */}
        <div className="space-y-4">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input 
               className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" 
               placeholder="Search assets..." 
               value={query}
               onChange={e => setQuery(e.target.value)}
             />
           </div>

           {filtered.length === 0 ? (
             <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
                <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <div>No assets found.</div>
             </div>
           ) : (
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
               {filtered.map(a => {
                 const isImage = a.mime_type?.startsWith("image/") || a.path?.match(/\.(png|jpg|jpeg|webp|svg)$/i);
                 const active = a.id === selectedId;
                 return (
                   <button 
                     key={a.id} 
                     onClick={() => setSelectedId(a.id)}
                     className={cx(
                       "relative aspect-square rounded-2xl border overflow-hidden transition-all group bg-slate-50",
                       active ? "border-indigo-600 ring-2 ring-indigo-600 ring-offset-2" : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                     )}
                   >
                      {isImage ? (
                        <img src={a.public_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <FileIcon className="w-8 h-8" />
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <div className="text-white text-[10px] truncate">{a.path}</div>
                      </div>
                   </button>
                 );
               })}
             </div>
           )}
        </div>

        {/* Sidebar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 h-fit sticky top-6 shadow-sm">
           {!selected ? (
             <div className="text-center text-slate-400 py-10 text-sm">Select an asset to view details.</div>
           ) : (
             <div className="space-y-4">
                <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200">
                   <img src={selected.public_url} alt="" className="max-w-full max-h-full object-contain" />
                </div>
                
                <div>
                   <div className="font-bold text-slate-900 break-all text-sm">{selected.path}</div>
                   <div className="text-xs text-slate-500 mt-1 flex gap-2">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded">{selected.mime_type?.split("/")[1]?.toUpperCase() || "FILE"}</span>
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded">{bytesToHuman(selected.size_bytes)}</span>
                   </div>
                </div>

                {selected.alt_text && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                     <div className="text-[10px] font-bold text-slate-400 uppercase">Alt Text</div>
                     <div className="text-xs text-slate-700 mt-0.5">{selected.alt_text}</div>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 space-y-2">
                   <a href={selected.public_url} target="_blank" className="flex items-center justify-center gap-2 w-full py-2 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200">
                      <LinkIcon className="w-3 h-3" /> Open URL
                   </a>
                   {isRoot && (
                     <button onClick={() => { setDeleteTarget(selected); setDeleteOpen(true); }} className="flex items-center justify-center gap-2 w-full py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-100">
                        <Trash2 className="w-3 h-3" /> Delete
                     </button>
                   )}
                </div>
             </div>
           )}
        </div>
      </div>

      {/* Modals */}
      <AdminModal open={uploadOpen} onClose={() => !busy && setUploadOpen(false)} title="Upload Asset">
         <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center relative hover:bg-slate-50">
               <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setUploadFile(e.target.files?.[0])} />
               <div className="pointer-events-none">
                  {uploadFile ? (
                    <div className="text-indigo-600 font-bold text-sm">{uploadFile.name}</div>
                  ) : (
                    <>
                      <UploadCloud className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <div className="text-sm text-slate-500 font-medium">Click to select file</div>
                    </>
                  )}
               </div>
            </div>
            <Input placeholder="Alt text (optional)" value={uploadAlt} onChange={e => setUploadAlt(e.target.value)} />
            <div className="flex justify-end gap-2">
               <Button tone="secondary" onClick={() => setUploadOpen(false)}>Cancel</Button>
               <Button onClick={onUpload} disabled={!uploadFile || busy}>{busy ? "Uploading..." : "Upload"}</Button>
            </div>
         </div>
      </AdminModal>

      <AdminModal open={deleteOpen} onClose={() => !busy && setDeleteOpen(false)} title="Delete Asset?">
         <div className="space-y-4">
            <p className="text-sm text-slate-600">This action cannot be undone. Any pages using this asset will show a broken image.</p>
            <div className="flex justify-end gap-2">
               <Button tone="secondary" onClick={() => setDeleteOpen(false)}>Cancel</Button>
               <Button tone="danger" onClick={onDelete} disabled={busy}>{busy ? "Deleting..." : "Confirm"}</Button>
            </div>
         </div>
      </AdminModal>

    </div>
  );
}