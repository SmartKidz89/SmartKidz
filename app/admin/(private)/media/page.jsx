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
  const s = i === 0 ? String(Math.round(v)) : v.toFixed(v >= 10 ? 1 : 2);
  return `${s} ${units[i]}`;
}

function parseTags(raw) {
  return String(raw || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function AdminMediaPage() {
  const me = useAdminMe();
  const isRoot = me?.role === "root";

  const [assets, setAssets] = useState([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null); // { tone, title, message }

  const [query, setQuery] = useState("");
  const [tagQuery, setTagQuery] = useState("");
  const [sort, setSort] = useState("newest"); // newest | oldest | az

  const [selectedId, setSelectedId] = useState(null);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadAlt, setUploadAlt] = useState("");
  const [uploadTags, setUploadTags] = useState("");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function load() {
    setNotice(null);
    const res = await fetch("/api/admin/assets", { cache: "no-store" });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(j?.error || "Failed to load assets");
    const rows = j.assets || [];
    setAssets(rows);

    // Preserve selection where possible, otherwise select first.
    setSelectedId((prev) => {
      if (prev && rows.some((a) => a.id === prev)) return prev;
      return rows?.[0]?.id || null;
    });
  }

  useEffect(() => {
    load().catch((e) => {
      setNotice({ tone: "danger", title: "Could not load media", message: e.message || "Unknown error" });
    });
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const tq = tagQuery.trim().toLowerCase();
    let list = [...assets];

    if (q) {
      list = list.filter((a) => {
        const hay = `${a.path || ""} ${a.alt_text || ""} ${(a.tags || []).join(" ")}`.toLowerCase();
        return hay.includes(q);
      });
    }

    if (tq) {
      list = list.filter((a) => (a.tags || []).some((t) => String(t).toLowerCase().includes(tq)));
    }

    if (sort === "oldest") {
      list.sort((x, y) => String(x.created_at || "").localeCompare(String(y.created_at || "")));
    } else if (sort === "az") {
      list.sort((x, y) => String(x.path || "").localeCompare(String(y.path || "")));
    } else {
      // newest (API already sorts desc, but keep stable)
      list.sort((x, y) => String(y.created_at || "").localeCompare(String(x.created_at || "")));
    }

    return list;
  }, [assets, query, tagQuery, sort]);

  const selected = useMemo(() => assets.find((a) => a.id === selectedId) || null, [assets, selectedId]);

  async function onUpload() {
    if (!uploadFile) return;
    setBusy(true);
    setNotice(null);

    try {
      const fd = new FormData();
      fd.set("file", uploadFile);
      if (uploadAlt.trim()) fd.set("alt_text", uploadAlt.trim());
      if (uploadTags.trim()) fd.set("tags", uploadTags.trim());

      const res = await fetch("/api/admin/assets", { method: "POST", body: fd });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error || "Upload failed");

      setNotice({ tone: "success", title: "Uploaded", message: "Your asset is now available in the library." });
      setUploadOpen(false);
      setUploadFile(null);
      setUploadAlt("");
      setUploadTags("");
      await load();

      if (j?.asset?.id) setSelectedId(j.asset.id);
    } catch (e) {
      setNotice({ tone: "danger", title: "Upload failed", message: e.message || "Unknown error" });
    } finally {
      setBusy(false);
    }
  }

  function requestDelete(asset) {
    setDeleteTarget(asset);
    setDeleteOpen(true);
  }

  async function onDelete() {
    if (!deleteTarget?.id) return;
    setBusy(true);
    setNotice(null);

    try {
      const res = await fetch(`/api/admin/assets?id=${encodeURIComponent(deleteTarget.id)}`, { method: "DELETE" });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error || "Delete failed");

      setNotice({ tone: "success", title: "Deleted", message: "The asset has been removed." });
      setDeleteOpen(false);
      setDeleteTarget(null);
      await load();
    } catch (e) {
      setNotice({ tone: "danger", title: "Delete failed", message: e.message || "Unknown error" });
    } finally {
      setBusy(false);
    }
  }

  async function copyToClipboard(value, label = "Copied") {
    try {
      await navigator.clipboard.writeText(String(value || ""));
      setNotice({ tone: "success", title: label, message: "Copied to clipboard." });
    } catch {
      setNotice({ tone: "warning", title: "Clipboard blocked", message: "Copy manually from the detail panel." });
    }
  }

  const total = assets.length;
  const shown = filtered.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-indigo-600" />
            Media Library
          </div>
          <div className="mt-1 text-sm text-slate-500">
            Upload images, icons, and assets for your site and lessons.
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            className="h-10 rounded-xl border border-slate-200 px-3 text-sm hover:bg-slate-50 disabled:opacity-60 flex items-center gap-2 bg-white"
            onClick={() => {
              setBusy(true);
              load()
                .catch((e) => setNotice({ tone: "danger", title: "Refresh failed", message: e.message }))
                .finally(() => setBusy(false));
            }}
            disabled={busy}
          >
            <RefreshCcw className={cx("h-4 w-4", busy && "animate-spin")} />
            Refresh
          </button>

          <button
            className="h-10 rounded-xl bg-slate-900 px-4 text-sm text-white hover:bg-slate-800 disabled:opacity-60 flex items-center gap-2 shadow-md"
            onClick={() => setUploadOpen(true)}
            disabled={busy}
          >
            <UploadCloud className="h-4 w-4" />
            Upload Asset
          </button>
        </div>
      </div>

      {notice ? (
        <div className="mt-4">
          <AdminNotice tone={notice.tone} title={notice.title}>{notice.message}</AdminNotice>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <section className="min-w-0">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-4">
             <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search filename..."
                    className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-8 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  {query && (
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded hover:bg-slate-100"
                      onClick={() => setQuery("")}
                    >
                      <X className="h-3 w-3 text-slate-400" />
                    </button>
                  )}
                </div>
                
                <div className="flex gap-2">
                   <select
                     value={sort}
                     onChange={(e) => setSort(e.target.value)}
                     className="h-10 rounded-xl border border-slate-200 px-3 text-sm bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none"
                   >
                     <option value="newest">Newest</option>
                     <option value="oldest">Oldest</option>
                     <option value="az">A–Z</option>
                   </select>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((a) => {
              const isActive = a.id === selectedId;
              const isImage = a.mime_type?.startsWith("image/") || a.path?.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i);
              
              return (
                <button
                  type="button"
                  key={a.id}
                  onClick={() => setSelectedId(a.id)}
                  className={cx(
                    "relative aspect-square rounded-2xl border transition-all overflow-hidden group bg-white",
                    isActive ? "border-slate-900 ring-2 ring-slate-900 ring-offset-2" : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                  )}
                >
                  {isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={a.public_url}
                      alt={a.alt_text || ""}
                      className="w-full h-full object-cover bg-[url('/textures/transparent.png')]"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400 p-4">
                       <FileIcon className="w-8 h-8 mb-2" />
                       <span className="text-[10px] font-bold uppercase truncate max-w-full">{a.mime_type?.split('/')[1] || 'FILE'}</span>
                    </div>
                  )}
                  
                  <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                     <div className="text-white text-xs font-medium truncate drop-shadow-md">{a.path}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {assets.length === 0 && (
            <div className="py-20 text-center text-slate-400 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No assets uploaded yet.</p>
            </div>
          )}
        </section>

        {/* Sidebar Info */}
        <aside className="bg-white rounded-2xl border border-slate-200 p-5 h-fit shadow-sm sticky top-6">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Asset Details</div>

          {selected ? (
            <div className="space-y-6">
              <div className="aspect-video rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative flex items-center justify-center">
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                 <img
                   src={selected.public_url}
                   alt={selected.alt_text || ""}
                   className="max-w-full max-h-full object-contain"
                 />
              </div>

              <div>
                <div className="font-bold text-slate-900 break-all leading-tight">{selected.path}</div>
                <div className="flex gap-2 mt-2">
                   <div className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-500 uppercase">
                      {selected.mime_type?.split('/')[1] || 'FILE'}
                   </div>
                   <div className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-500 uppercase">
                      {bytesToHuman(selected.size_bytes)}
                   </div>
                </div>
              </div>

              {selected.alt_text && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                   <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Alt Text</div>
                   <div className="text-xs text-slate-700">{selected.alt_text}</div>
                </div>
              )}

              <div className="space-y-2">
                <button
                  className="w-full h-10 rounded-xl border border-slate-200 text-sm font-semibold hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors"
                  onClick={() => copyToClipboard(selected.public_url, "URL copied")}
                >
                  <LinkIcon className="h-4 w-4" /> Copy URL
                </button>
                
                <a
                   href={selected.public_url}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="w-full h-10 rounded-xl border border-slate-200 text-sm font-semibold hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors"
                >
                   <ImageIcon className="h-4 w-4" /> Open Original
                </a>

                {isRoot && (
                  <button
                    className="w-full h-10 rounded-xl border border-rose-100 text-rose-600 text-sm font-semibold hover:bg-rose-50 flex items-center justify-center gap-2 transition-colors mt-4"
                    onClick={() => requestDelete(selected)}
                  >
                    <Trash2 className="h-4 w-4" /> Delete Asset
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-400 text-center py-10">Select an asset to view details.</div>
          )}
        </aside>
      </div>

      <AdminModal
        open={uploadOpen}
        onClose={() => {
          if (busy) return;
          setUploadOpen(false);
        }}
        title="Upload Asset"
        desc="Upload images, SVGs, or documents to public storage."
      >
        <div className="space-y-4">
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:bg-slate-50 transition-colors relative">
            <input
              type="file"
              accept="image/*,.svg,.pdf"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="pointer-events-none">
               {uploadFile ? (
                 <div>
                    <div className="text-indigo-600 font-bold mb-1">{uploadFile.name}</div>
                    <div className="text-xs text-slate-500">{bytesToHuman(uploadFile.size)}</div>
                 </div>
               ) : (
                 <>
                    <UploadCloud className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <div className="text-sm font-bold text-slate-600">Click to select file</div>
                    <div className="text-xs text-slate-400 mt-1">PNG, JPG, SVG, WEBP</div>
                 </>
               )}
            </div>
          </div>

          <div>
             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Alt Text (Optional)</label>
             <input
               className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
               placeholder="Describe the image..."
               value={uploadAlt}
               onChange={(e) => setUploadAlt(e.target.value)}
             />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button tone="secondary" onClick={() => setUploadOpen(false)} disabled={busy}>Cancel</Button>
            <Button onClick={onUpload} disabled={!uploadFile || busy}>
               {busy ? "Uploading..." : "Upload Asset"}
            </Button>
          </div>
        </div>
      </AdminModal>

      <AdminModal
        open={deleteOpen}
        onClose={() => { if (!busy) setDeleteOpen(false); }}
        title="Delete Asset?"
        desc="This cannot be undone. Links to this file will break."
      >
        <div className="flex justify-end gap-2 mt-4">
           <Button tone="secondary" onClick={() => setDeleteOpen(false)} disabled={busy}>Cancel</Button>
           <Button tone="danger" onClick={onDelete} disabled={busy}>
              {busy ? "Deleting..." : "Confirm Delete"}
           </Button>
        </div>
      </AdminModal>
    </div>
  );
}