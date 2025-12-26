"use client";

import { useMemo, useState } from "react";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { useActiveChild } from "@/hooks/useActiveChild";
import { playUISound } from "@/components/ui/sound";

const WORDS = [
  { word: "observe", simple: "to look carefully", example: "I observe the clouds." },
  { word: "predict", simple: "to guess what will happen", example: "I predict it will rain." },
  { word: "addition", simple: "putting numbers together", example: "2 + 3 is addition." },
  { word: "noun", simple: "a person, place or thing", example: "Dog is a noun." },
  { word: "habitat", simple: "a place an animal lives", example: "A pond is a frog’s habitat." },
];

export default function DictionaryPage() {
  const { activeChild } = useActiveChild();
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return WORDS;
    return WORDS.filter((w) => w.word.includes(s));
  }, [q]);

  return (
    <PageMotion className="max-w-4xl mx-auto space-y-6">
      <div className="skz-glass p-6 md:p-8">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-sm text-slate-500">Helper tool</div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Dictionary</h1>
            <p className="mt-2 text-sm md:text-base text-slate-700">
              Kid-friendly meanings with an example sentence.
            </p>
          </div>
          <button className="skz-chip px-4 py-3 skz-press" onClick={() => history.back()}>Back</button>
        </div>

        <div className="mt-5 skz-card p-4">
          <div className="text-xs text-slate-500">Search</div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Type a word…"
            className="mt-2 w-full skz-glass p-3 outline-none"
            onFocus={() => { try{ playUISound("tap"); }catch{}; }}
          />
          <div className="mt-2 text-xs text-slate-500">
            For {activeChild?.display_name || "your child"} · Year {typeof activeChild?.year_level==="number" ? activeChild.year_level : "—"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {results.map((w) => (
          <div key={w.word} className="skz-card p-5 skz-press skz-glow">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xl font-semibold">{w.word}</div>
                <div className="mt-1 text-slate-700">{w.simple}</div>
                <div className="mt-2 text-sm text-slate-600">
                  Example: <span className="italic">{w.example}</span>
                </div>
              </div>
              <div className="skz-chip w-12 h-12 flex items-center justify-center">
                <span className="text-xl">🔎</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageMotion>
  );
}
