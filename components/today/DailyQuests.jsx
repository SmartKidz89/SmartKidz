"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useContext } from "react";
import { ActiveChildContext } from "@/components/app/ActiveChildProvider";
import { getLocalDailyQuests, setLocalDailyQuests } from "@/lib/quests/storage";
import { Events } from "@/lib/telemetry/events";
import { track } from "@/lib/telemetry/track";
import { useRewards } from "@/components/ui/RewardProvider";
import { generateDailyQuests } from "@/lib/quests/generate";
import { useEconomy } from "@/lib/economy/client";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function DailyQuests() {
  const { activeChild } = useContext(ActiveChildContext) || {};
  const childId = activeChild?.id || "anon";
  const date = todayISO();
  const { push } = useRewards();
  const econ = useEconomy(activeChild?.id);

  const [quests, setQuests] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      track(Events.QuestViewed, { childId, date });

      // Prefer server (optional persistence), fallback local
      try {
        const res = await fetch(`/api/quests?childId=${encodeURIComponent(childId)}&date=${encodeURIComponent(date)}`, { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (!mounted) return;
          setQuests(json.quests);
          setLocalDailyQuests(childId, date, json.quests);
          setLoading(false);
          return;
        }
      } catch {}

      const local = getLocalDailyQuests(childId, date);
      if (local) {
        if (!mounted) return;
        setQuests(local);
        setLoading(false);
        return;
      }
      const generated = generateDailyQuests({ childId, dateISO: date });
      if (!mounted) return;
      setQuests(generated);
      setLocalDailyQuests(childId, date, generated);
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, [childId, date]);

  const items = useMemo(() => quests || [], [quests]);

  async function claim(q) {
    if (q?.claimed) return;
    // Mark claimed locally for immediate UI feedback.
    setQuests((prev) => (prev || []).map((x) => (x.key === q.key ? { ...x, claimed: true } : x)));
    track(Events.RewardClaimed, { childId, quest: q.key, coins: q.rewardCoins, xp: q.rewardXp });

    // Award coins/XP (server-first, local fallback inside the hook)
    try { await econ.award(q.rewardCoins, q.rewardXp); } catch {}

    push({ title: "Reward claimed!", message: `+${q.rewardCoins} coins • +${q.rewardXp} XP`, tone: "levelup" });

    // Persist claimed state locally so refresh doesn't reset it.
    try {
      const next = (quests || []).map((x) => (x.key === q.key ? { ...x, claimed: true } : x));
      setLocalDailyQuests(childId, date, next);
    } catch {}
  }

  return (
    <Card className="p-5 mt-6 bg-white/70 backdrop-blur border border-white/60 shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-600">Daily quests</div>
          <div className="text-xl font-extrabold tracking-tight">Today&apos;s Challenges</div>
          <div className="mt-1 text-sm text-slate-600 max-w-2xl">
            Quick wins that keep motivation high. Complete any quest to earn coins and level up.
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {loading && (
          <div className="text-slate-600 text-sm">Loading quests…</div>
        )}
        {!loading && items.map((q) => (
          <div key={q.key} className="rounded-2xl p-4 border border-white/60 bg-white/60 backdrop-blur shadow-[0_10px_30px_rgba(0,0,0,0.10)]">
            <div className="font-bold">{q.title}</div>
            <div className="text-sm text-slate-600 mt-1">{q.desc}</div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <div className="text-xs font-semibold text-slate-700 bg-white/70 rounded-full px-3 py-1 border border-white/60">
                +{q.rewardCoins} coins • +{q.rewardXp} XP
              </div>
              <Button onClick={() => claim(q)} className="skz-pressable" disabled={!!q.claimed} data-testid={`quest-claim-${q.key}`}>
                {q.claimed ? "Claimed" : "Claim"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
