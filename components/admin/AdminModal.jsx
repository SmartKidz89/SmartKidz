"use client";

import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { cx, getFocusableElements, isBrowser } from "@/components/admin/adminUi";

export default function AdminModal({
  open,
  title,
  desc,
  description,
  children,
  footer,
  onClose,
  className,
}) {
  const headingId = useId();
  const bodyId = useId();
  const panelRef = useRef(null);
  const lastActiveRef = useRef(null);

  const detail = description ?? desc;

  useEffect(() => {
    if (!open) return;

    // Remember last focused element to restore on close.
    if (isBrowser()) lastActiveRef.current = document.activeElement;

    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }

    window.addEventListener("keydown", onKey);

    // Focus first focusable element in the panel (or the close button fallback).
    const t = window.setTimeout(() => {
      const panel = panelRef.current;
      const focusables = getFocusableElements(panel);
      if (focusables.length) focusables[0].focus();
      else {
        const closeBtn = panel?.querySelector('button[aria-label="Close"]');
        closeBtn?.focus();
      }
    }, 0);

    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);

      // Restore focus.
      const el = lastActiveRef.current;
      if (el && typeof el.focus === "function") el.focus();
      lastActiveRef.current = null;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]" role="presentation">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-start justify-center p-4 sm:p-8 overflow-auto">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={headingId}
          aria-describedby={detail ? bodyId : undefined}
          className={cx(
            "w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-xl",
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-4">
            <div className="min-w-0">
              <div id={headingId} className="text-sm font-semibold">
                {title}
              </div>
              {detail ? (
                <div id={bodyId} className="mt-1 text-xs text-slate-500">
                  {detail}
                </div>
              ) : null}
            </div>
            <button
              className="h-9 w-9 rounded-xl border border-slate-200 hover:bg-slate-50"
              onClick={onClose}
              aria-label="Close"
              type="button"
            >
              <X className="h-4 w-4 mx-auto" />
            </button>
          </div>

          <div className="p-4">{children}</div>

          {footer ? <div className="border-t border-slate-100 p-4">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
