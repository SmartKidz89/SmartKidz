"use client";

import { useMemo, useState } from "react";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

export default function LinkPickerModal({ open, pages = [], value = "", onPick, onClose }) {
  const [q, setQ] = useState("");

  const options = useMemo(() => {
    const cms = (pages || []).map((p) => {
      const href = p.scope === "app" ? `/app/p/${p.slug}` : `/marketing/p/${p.slug}`;
      return {
        key: p.id,
        label: `${p.scope}/${p.slug}`,
        sub: p.title || "",
        href,
      };
    });

    // A small curated list of common routes for convenience.
    const common = [
      { key: "home", label: "Home", sub: "/", href: "/" },
      { key: "m_features", label: "Marketing: Features", sub: "/marketing/features", href: "/marketing/features" },
      { key: "m_pricing", label: "Marketing: Pricing", sub: "/marketing/pricing", href: "/marketing/pricing" },
      { key: "app_today", label: "App: Today", sub: "/app/today", href: "/app/today" },
      { key: "app_login", label: "App: Login", sub: "/app/login", href: "/app/login" },
    ];

    const all = [...common, ...cms];
    const query = q.trim().toLowerCase();
    if (!query) return all;
    return all.filter((o) => (o.label + " " + o.sub + " " + o.href).toLowerCase().includes(query));
  }, [pages, q]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80]">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Link picker</div>
              <div className="text-xs text-slate-500">Choose a destination (CMS pages and common routes).</div>
            </div>
            <button className="text-sm text-slate-500 hover:text-slate-800" onClick={onClose}>
              Close
            </button>
          </div>

          <div className="p-4">
            <div className="flex gap-2">
              <input
                className="h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="Search pages or paste a URL…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                autoFocus
              />
              <button
                className="h-11 rounded-xl border border-slate-200 px-4 text-sm hover:bg-slate-50"
                onClick={() => {
                  const v = q.trim();
                  if (!v) return;
                  onPick?.(v);
                  onClose?.();
                }}
                title="Use the typed value"
              >
                Use
              </button>
            </div>

            <div className="mt-3 max-h-[55vh] overflow-auto rounded-xl border border-slate-100">
              {options.map((o) => (
                <button
                  key={o.key}
                  onClick={() => {
                    onPick?.(o.href);
                    onClose?.();
                  }}
                  className={cx(
                    "w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50",
                    value === o.href ? "bg-slate-900 text-white hover:bg-slate-900" : ""
                  )}
                >
                  <div className={cx("text-sm font-semibold", value === o.href ? "text-white" : "text-slate-900")}>
                    {o.label}
                  </div>
                  <div className={cx("text-xs mt-0.5", value === o.href ? "text-white/80" : "text-slate-500")}>
                    {o.href}{o.sub ? ` • ${o.sub}` : ""}
                  </div>
                </button>
              ))}
              {!options.length ? (
                <div className="p-4 text-sm text-slate-500">No matches.</div>
              ) : null}
            </div>

            <div className="mt-3 text-xs text-slate-500">
              Tip: You can paste external URLs here as well.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
