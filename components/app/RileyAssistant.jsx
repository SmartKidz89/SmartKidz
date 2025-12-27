"use client";

import { useEffect, useState } from "react";

export function RileyAssistant({ open, onClose, title = "Riley can help", tips = [] }) {
  const [visible, setVisible] = useState(open);

  useEffect(() => setVisible(open), [open]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 md:items-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => { setVisible(false); onClose?.(); }} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl ring-1 ring-slate-200">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-semibold">
              R
            </div>
            <div>
              <div className="text-sm text-slate-500">Robot assistant</div>
              <div className="text-lg font-semibold text-slate-900">{title}</div>
            </div>
          </div>
          <button
            type="button"
            className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50"
            onClick={() => { setVisible(false); onClose?.(); }}
          >
            Close
          </button>
        </div>

        <div className="mt-4 space-y-3 text-sm text-slate-700">
          {tips.length ? (
            <ul className="list-disc pl-5 space-y-2">
              {tips.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          ) : (
            <div>
              Try re-reading the question, underline key words, and eliminate options that cannot be correct.
            </div>
          )}
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            onClick={() => { setVisible(false); onClose?.(); }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
