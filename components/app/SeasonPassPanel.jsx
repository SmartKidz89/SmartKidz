"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Pill } from "@/components/ui/Pill";

const KEY = "skz_season_v1";
const SEASON = { id: "season_01", name: "Aussie Adventure", goalXp: 500 };

function load() {
  if (typeof window === "undefined") return { xp: 0, claimed: {} };
  try { return JSON.parse(window.localStorage.getItem(KEY) || "") || { xp: 0, claimed: {} }; } catch { return { xp: 0, claimed: {} }; }
}
function save(st) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(st));
}

export function addSeasonXp(amount) {
  const st = load();
  st.xp = Math.max(0, (Number(st.xp) || 0) + (Number(amount) || 0));
  save(st);
}

export default function SeasonPassPanel() {
  const [st, setSt] = useState({ xp: 0, claimed: {} });

  useEffect(() => { setSt(load()); }, []);

  const pct = useMemo(() => {
    const p = (Number(st.xp) || 0) / SEASON.goalXp;
    return Math.max(0, Math.min(1, p));
  }, [st.xp]);

  const tiers = useMemo(() => ([
    { id: "t1", xp: 50, label: "Sticker Pack" },
    { id: "t2", xp: 150, label: "Rare Hat" },
    { id: "t3", xp: 300, label: "Epic Outfit" },
    { id: "t4", xp: 500, label: "Legendary Badge" },
  ]), []);

  function claim(tierId) {
    const t = tiers.find(x => x.id === tierId);
    if (!t) return;
    if ((Number(st.xp) || 0) < t.xp) return;
    const next = { ...st, claimed: { ...(st.claimed || {}), [tierId]: true } };
    save(next);
    setSt(next);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">{SEASON.name}</div>
          <div className="text-sm opacity-80">Earn XP to unlock seasonal rewards.</div>
        </div>
        <Pill>{st.xp} / {SEASON.goalXp} XP</Pill>
      </div>

      <ProgressBar value={pct} />

      <div className="grid grid-cols-1 gap-2">
        {tiers.map(t => {
          const unlocked = (Number(st.xp) || 0) >= t.xp;
          const claimed = !!st.claimed?.[t.id];
          return (
            <div key={t.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="flex flex-col">
                <div className="font-semibold">{t.label}</div>
                <div className="text-xs opacity-70">Unlock at {t.xp} XP</div>
              </div>
              <Button
                variant={claimed ? "secondary" : "default"}
                disabled={!unlocked || claimed}
                className="skz-pressable"
                onClick={() => claim(t.id)}
              >
                {claimed ? "Claimed" : unlocked ? "Claim" : "Locked"}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
