"use client";

import { useEffect, useMemo, useState } from "react";
import { Pill } from "@/components/ui/Pill";

const KEY = "skz_collection_v1";

function load() {
  if (typeof window === "undefined") return { stickers: {} };
  try { return JSON.parse(window.localStorage.getItem(KEY) || "") || { stickers: {} }; } catch { return { stickers: {} }; }
}
function save(st) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(st));
}

export function unlockSticker(stickerId) {
  const st = load();
  st.stickers = st.stickers || {};
  st.stickers[stickerId] = { unlockedAt: Date.now() };
  save(st);
}

export default function CollectionBook() {
  const [st, setSt] = useState({ stickers: {} });

  useEffect(() => { setSt(load()); }, []);

  const stickers = useMemo(() => Object.keys(st.stickers || {}).sort(), [st]);

  if (!stickers.length) {
    return <div className="text-sm opacity-80">Complete lessons to collect stickers. Your collection will appear here.</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Pill>Collected: {stickers.length}</Pill>
        <Pill tone="muted">Sticker Book</Pill>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stickers.map(id => (
          <div key={id} className="rounded-3xl border border-white/10 bg-white/5 p-4 text-center">
            <div className="text-3xl">⭐</div>
            <div className="mt-2 text-xs opacity-80 break-all">{id}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
