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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xl font-semibold">Media</div>
          <div className="mt-1 text-sm text-slate-500">
            Upload once, reuse everywhere. Assets are stored in Supabase Storage and indexed for the builder.
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            className="h-10 rounded-xl border border-slate-200 px-3 text-sm hover:bg-slate-50 disabled:opacity-60 flex items-center gap-2"
            onClick={() => {
              setBusy(true);
              load()
                .catch((e) => setNotice({ tone: "danger", title: "Refresh failed", message: e.message }))
                .finally(() => setBusy(false));
            }}
            disabled={busy}
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </button>

          <button
            className="h-10 rounded-xl bg-slate-900 px-4 text-sm text-white hover:bg-slate-800 disabled:opacity-60 flex items-center gap-2"
            onClick={() => setUploadOpen(true)}
            disabled={busy}
          >
            <UploadCloud className="h-4 w-4" />
            Upload asset
          </button>
        </div>
      </div>

      {notice ? (
        <div className="mt-4">
          <AdminNotice tone={notice.tone} title={notice.title}>{notice.message}</AdminNotice>
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        <section className="min-w-0">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-500">
              Showing <span className="font-semibold text-slate-900">{shown}</span> of {total}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <div className="relative">
                <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search filename, alt, tags"
                  className="h-10 w-full sm:w-64 rounded-xl border border-slate-200 pl-9 pr-9 text-sm"
                />
                {query ? (
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-lg hover:bg-slate-50"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4 mx-auto text-slate-500" />
                  </button>
                ) : null}
              </div>

              <input
                value={tagQuery}
                onChange={(e) => setTagQuery(e.target.value)}
                placeholder="Tag contains"
                className="h-10 w-full sm:w-40 rounded-xl border border-slate-200 px-3 text-sm"
              />

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-10 w-full sm:w-36 rounded-xl border border-slate-200 px-3 text-sm"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="az">A–Z</option>
              </select>

              {(query || tagQuery) ? (
                <button
                  className="h-10 rounded-xl border border-slate-200 px-3 text-sm hover:bg-slate-50"
                  onClick={() => {
                    setQuery("");
                    setTagQuery("");
                  }}
                >
                  Clear
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((a) => {
              const isActive = a.id === selectedId;
              return (
                <button
                  type="button"
                  key={a.id}
                  onClick={() => setSelectedId(a.id)}
                  className={cx(
                    "text-left rounded-2xl border p-3 transition shadow-sm",
                    isActive ? "border-slate-900 ring-2 ring-slate-200" : "border-slate-200 hover:bg-slate-50"
                  )}
                >
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={a.public_url}
                      alt={a.alt_text || ""}
                      className="h-28 w-full object-cover rounded-xl border border-slate-200 bg-slate-50"
                    />
                  </div>
                  <div className="mt-2 text-xs text-slate-600 truncate">{a.path}</div>
                  <div className="mt-1 text-[11px] text-slate-400">
                    {a.size_bytes ? bytesToHuman(a.size_bytes) : ""}
                  </div>
                </button>
              );
            })}
          </div>

          {assets.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              No assets uploaded yet.
            </div>
          ) : null}

          {assets.length > 0 && filtered.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              No assets match the current filters.
            </div>
          ) : null}
        </section>

        <aside className="rounded-2xl border border-slate-200 p-4 h-fit">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-sm font-semibold">Details</div>
              <div className="mt-1 text-xs text-slate-500">Select an asset to view metadata and actions.</div>
            </div>
          </div>

          {selected ? (
            <div className="mt-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selected.public_url}
                alt={selected.alt_text || ""}
                className="w-full h-44 object-cover rounded-xl border border-slate-200 bg-slate-50"
              />

              <div className="mt-3 grid gap-2 text-sm">
                <div className="font-semibold truncate" title={selected.path}>{selected.path}</div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-2">
                    <div className="text-[10px] text-slate-500">Type</div>
                    <div className="font-medium truncate">{selected.mime_type || "—"}</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-2">
                    <div className="text-[10px] text-slate-500">Size</div>
                    <div className="font-medium truncate">{bytesToHuman(selected.size_bytes)}</div>
                  </div>
                </div>

                {selected.alt_text ? (
                  <div className="rounded-xl border border-slate-200 p-2">
                    <div className="text-[10px] text-slate-500">Alt text</div>
                    <div className="text-xs text-slate-700 mt-1">{selected.alt_text}</div>
                  </div>
                ) : null}

                {Array.isArray(selected.tags) && selected.tags.length ? (
                  <div className="rounded-xl border border-slate-200 p-2">
                    <div className="text-[10px] text-slate-500">Tags</div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {selected.tags.map((t) => (
                        <span key={t} className="text-[11px] px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="mt-2 grid gap-2">
                  <button
                    className="h-10 rounded-xl border border-slate-200 px-3 text-sm hover:bg-slate-50 flex items-center justify-center gap-2"
                    onClick={() => copyToClipboard(selected.public_url, "URL copied")}
                  >
                    <LinkIcon className="h-4 w-4" />
                    Copy public URL
                  </button>

                  <a
                    href={selected.public_url}
                    target="_blank"
                    rel="noreferrer"
                    className="h-10 rounded-xl border border-slate-200 px-3 text-sm hover:bg-slate-50 flex items-center justify-center gap-2"
                  >
                    <ImageIcon className="h-4 w-4" />
                    Open preview
                  </a>

                  <button
                    className={cx(
                      "h-10 rounded-xl border px-3 text-sm flex items-center justify-center gap-2",
                      isRoot
                        ? "border-rose-200 text-rose-700 hover:bg-rose-50"
                        : "border-slate-200 text-slate-400 cursor-not-allowed"
                    )}
                    onClick={() => {
                      if (!isRoot) {
                        setNotice({ tone: "warning", title: "Root only", message: "Deleting assets is restricted to root users." });
                        return;
                      }
                      requestDelete(selected);
                    }}
                    disabled={busy}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete (root)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              No asset selected.
            </div>
          )}
        </aside>
      </div>

      <AdminModal
        open={uploadOpen}
        onClose={() => {
          if (busy) return;
          setUploadOpen(false);
        }}
        title="Upload asset"
        desc="Uploads to Supabase Storage (cms-assets) and indexes the record for the builder."
      >
        <div className="grid gap-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold">File</div>
            <div className="mt-2">
              <input
                type="file"
                accept="image/*,.svg"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              />
              <div className="mt-2 text-xs text-slate-500">
                Recommended: .png/.jpg/.webp/.svg under 2–5MB.
              </div>
              {uploadFile ? (
                <div className="mt-2 text-xs text-slate-600">
                  Selected: <span className="font-medium">{uploadFile.name}</span> ({bytesToHuman(uploadFile.size)})
                </div>
              ) : null}
            </div>
          </div>

          <div className="grid gap-2">
            <div>
              <div className="text-sm font-semibold">Alt text</div>
              <input
                className="mt-2 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm"
                placeholder="Short descriptive alt text"
                value={uploadAlt}
                onChange={(e) => setUploadAlt(e.target.value)}
              />
            </div>

            <div>
              <div className="text-sm font-semibold">Tags</div>
              <input
                className="mt-2 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm"
                placeholder="Comma-separated tags (e.g., hero, icon, math)"
                value={uploadTags}
                onChange={(e) => setUploadTags(e.target.value)}
              />
              {parseTags(uploadTags).length ? (
                <div className="mt-2 flex flex-wrap gap-1">
                  {parseTags(uploadTags).map((t) => (
                    <span key={t} className="text-[11px] px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50">
                      {t}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              className="h-10 rounded-xl border border-slate-200 px-4 text-sm hover:bg-slate-50"
              onClick={() => setUploadOpen(false)}
              disabled={busy}
            >
              Cancel
            </button>
            <button
              className="h-10 rounded-xl bg-slate-900 px-4 text-sm text-white hover:bg-slate-800 disabled:opacity-60"
              onClick={onUpload}
              disabled={!uploadFile || busy}
            >
              Upload
            </button>
          </div>
        </div>
      </AdminModal>

      <AdminModal
        open={deleteOpen}
        onClose={() => {
          if (busy) return;
          setDeleteOpen(false);
        }}
        title="Delete asset"
        desc="This removes the Storage object and the cms_assets row. Root only."
        className="max-w-xl"
      >
        <div className="grid gap-4">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
            <div className="font-semibold">This cannot be undone.</div>
            <div className="mt-1 text-rose-800">
              {deleteTarget?.path ? (
                <>You are about to delete <span className="font-semibold">{deleteTarget.path}</span>.</>
              ) : (
                <>You are about to delete this asset.</>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              className="h-10 rounded-xl border border-slate-200 px-4 text-sm hover:bg-slate-50"
              onClick={() => setDeleteOpen(false)}
              disabled={busy}
            >
              Cancel
            </button>
            <button
              className="h-10 rounded-xl bg-rose-600 px-4 text-sm text-white hover:bg-rose-700 disabled:opacity-60"
              onClick={onDelete}
              disabled={busy}
            >
              Delete
            </button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
