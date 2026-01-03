"use client";

import { useMemo, useState } from "react";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

export default function AssetPickerModal({ open, assets = [], onPick, onClose }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return assets || [];
    return (assets || []).filter((a) => {
      const hay = `${a.path || ""} ${a.alt_text || ""}`.toLowerCase();
      return hay.includes(query);
    });
  }, [assets, q]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80]">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Media library</div>
              <div className="text-xs text-slate-500">Pick an uploaded asset. Upload more in Admin → Media.</div>
            </div>
            <button className="text-sm text-slate-500 hover:text-slate-800" onClick={onClose}>
              Close
            </button>
          </div>

          <div className="p-4">
            <input
              className="h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="Search by filename or alt text…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              autoFocus
            />

            <div className="mt-3 max-h-[60vh] overflow-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {filtered.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => {
                      onPick?.(a);
                      onClose?.();
                    }}
                    className="group rounded-xl border border-slate-200 p-2 text-left hover:bg-slate-50"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={a.public_url}
                      alt={a.alt_text || ""}
                      className={cx(
                        "h-24 w-full object-cover rounded-lg border border-slate-200",
                        "group-hover:border-slate-300"
                      )}
                    />
                    <div className="mt-2 text-xs text-slate-600 truncate">{a.path}</div>
                  </button>
                ))}
              </div>
              {!filtered.length ? (
                <div className="mt-4 text-sm text-slate-500">No assets found.</div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
