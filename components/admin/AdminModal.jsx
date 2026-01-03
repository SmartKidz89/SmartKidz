"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

export default function AdminModal({ open, title, desc, children, onClose, className }) {
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-start justify-center p-4 sm:p-8 overflow-auto">
        <div
          className={cx(
            "w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-xl",
            className
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-4">
            <div>
              <div className="text-sm font-semibold">{title}</div>
              {desc ? <div className="mt-1 text-xs text-slate-500">{desc}</div> : null}
            </div>
            <button
              className="h-9 w-9 rounded-xl border border-slate-200 hover:bg-slate-50"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="h-4 w-4 mx-auto" />
            </button>
          </div>
          <div className="p-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
