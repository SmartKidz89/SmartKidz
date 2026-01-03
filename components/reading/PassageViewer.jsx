"use client";

import { useMemo } from "react";

function splitWords(line) {
  return line.split(/(\s+)/).filter(Boolean);
}

export default function PassageViewer({ text, onWordClick, highlightSentenceIndex = null }) {
  const sentences = useMemo(() => {
    const t = (text || "").replace(/\n/g, " ");
    // simple sentence split
    const parts = t.split(/(?<=[.!?])\s+/).filter(Boolean);
    return parts.length ? parts : [t];
  }, [text]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-xl p-6 shadow-xl">
      <div className="text-sm font-semibold text-slate-600">Passage</div>

      <div className="mt-4 grid gap-3 leading-relaxed">
        {sentences.map((s, si) => (
          <div
            key={si}
            className={`rounded-2xl p-3 transition ${
              highlightSentenceIndex === si ? "bg-indigo-50 border border-indigo-200" : "bg-white/60"
            }`}
          >
            {splitWords(s).map((w, i) => {
              const isSpace = /^\s+$/.test(w);
              if (isSpace) return <span key={i}>{w}</span>;
              const clean = w.replace(/[^a-zA-Z']/g, "");
              return (
                <button
                  key={i}
                  onClick={() => onWordClick?.(clean)}
                  className="text-left hover:bg-yellow-100 rounded px-1"
                  title="Tap to hear this word"
                >
                  {w}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
