"use client";

import { useEffect, useMemo, useState } from "react";

export default function AdminMediaPage() {
  const [assets, setAssets] = useState([]);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState(null);
  const [alt, setAlt] = useState("");
  const [tags, setTags] = useState("");

  async function load() {
    setMsg("");
    const res = await fetch("/api/admin/assets", { cache: "no-store" });
    const j = await res.json();
    if (!res.ok) throw new Error(j?.error || "Failed to load");
    setAssets(j.assets || []);
  }

  useEffect(() => { load().catch((e) => setMsg(e.message)); }, []);

  async function upload() {
    if (!file) return;
    setBusy(true);
    setMsg("");
    try {
      const fd = new FormData();
      fd.set("file", file);
      if (alt) fd.set("alt_text", alt);
      if (tags) fd.set("tags", tags);
      const res = await fetch("/api/admin/assets", { method: "POST", body: fd });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Upload failed");
      setMsg("Uploaded.");
      setFile(null);
      setAlt("");
      setTags("");
      await load();
    } catch (e) {
      setMsg(e.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    if (!confirm("Delete this asset? (root only)")) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch(`/api/admin/assets?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Delete failed");
      setMsg("Deleted.");
      await load();
    } catch (e) {
      setMsg(e.message || "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  const total = assets.length;

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xl font-semibold">Media</div>
          <div className="text-sm text-slate-500 mt-1">
            Upload images/icons once, then pick them inside the page builder.
          </div>
        </div>
      </div>

      {msg ? <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">{msg}</div> : null}

      <div className="mt-6 rounded-2xl border border-slate-200 p-4">
        <div className="font-semibold">Upload</div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <div className="text-xs text-slate-500 mt-1">Recommended: .png/.jpg/.webp, {"<"} 2–5MB</div>
          </div>
          <div className="grid gap-2">
            <input className="h-10 rounded-xl border border-slate-200 px-3" placeholder="Alt text" value={alt} onChange={(e)=>setAlt(e.target.value)} />
            <input className="h-10 rounded-xl border border-slate-200 px-3" placeholder="Tags (comma-separated)" value={tags} onChange={(e)=>setTags(e.target.value)} />
          </div>
        </div>
        <div className="mt-3">
          <button className="h-10 rounded-xl bg-slate-900 text-white px-4 hover:bg-slate-800 disabled:opacity-60" disabled={!file || busy} onClick={upload}>
            Upload
          </button>
        </div>
      </div>

      <div className="mt-6">
        <div className="text-sm text-slate-500">{total} asset(s)</div>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {assets.map((a) => (
            <div key={a.id} className="rounded-2xl border border-slate-200 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.public_url} alt={a.alt_text || ""} className="h-32 w-full object-cover rounded-xl border border-slate-200" />
              <div className="mt-2 text-xs text-slate-600 truncate">{a.path}</div>
              <div className="mt-2 flex gap-2">
                <button
                  className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs hover:bg-slate-50"
                  onClick={async () => {
                    await navigator.clipboard.writeText(a.public_url);
                    setMsg("Copied URL to clipboard.");
                  }}
                >
                  Copy URL
                </button>
                <button className="rounded-xl border border-slate-200 px-3 py-2 text-xs hover:bg-slate-50" onClick={() => remove(a.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {assets.length === 0 ? <div className="mt-4 text-sm text-slate-500">No assets uploaded yet.</div> : null}
      </div>
    </div>
  );
}
