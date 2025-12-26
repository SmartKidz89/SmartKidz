"use client";

import SparkleBurst from "@/components/ui/SparkleBurst";
import { Page, BentoGrid, BentoCard, Kpi, Divider } from "@/components/ui/PageScaffold";
import { Button } from "@/components/ui/Button";

export default function RewardsPage() {
  return (
    <Page
      badge="Rewards"
      title="Rewards & Streaks"
      subtitle="Finish lessons to build your streak, unlock badges, and collect shiny rewards. Small steps every day."
      actions={
        <Button variant="secondary" size="md" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          Celebrate
          <SparkleBurst />
        </Button>
      }
    >
      <BentoGrid>
        <BentoCard className="col-span-12 md:col-span-7">
          <div className="flex items-center justify-between gap-3">
            <Kpi label="Daily Streak" value="7 days" hint="Keep the flame alive." icon="🔥" />
            <div className="skz-chip">+20 XP today</div>
          </div>
          <Divider />
          <div className="grid grid-cols-3 gap-3">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => (
              <div key={d} className="rounded-2xl bg-white/60 border border-white/70 p-3 text-center">
                <div className="text-xs font-extrabold text-slate-600">{d}</div>
                <div className="mt-1 text-lg">{i < 5 ? "⭐" : i === 5 ? "✨" : "🔒"}</div>
              </div>
            ))}
          </div>
        </BentoCard>

        <BentoCard className="col-span-12 md:col-span-5">
          <Kpi label="Badges" value="12" hint="You’re collecting fast." icon="🏅" />
          <Divider />
          <div className="flex flex-wrap gap-2">
            {["Brave Reader", "Math Wizard", "Neat Writer", "Science Star", "Kind Helper"].map((b) => (
              <span key={b} className="skz-chip">
                {b}
              </span>
            ))}
          </div>
          <div className="mt-4 text-sm text-slate-600">
            Tip: Repeat a lesson to polish your badge. Neat comes before fast.
          </div>
        </BentoCard>

        <BentoCard className="col-span-12">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-xl font-black text-slate-900">Treasure Chest</div>
              <div className="text-slate-700 mt-1">Spend stars on fun rewards. More coming soon.</div>
            </div>
            <Button size="lg">Open Chest</Button>
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { t: "Sticker Pack", c: "⭐ 20", e: "🎟️" },
              { t: "Avatar Hat", c: "⭐ 35", e: "🧢" },
              { t: "Pet Buddy", c: "⭐ 60", e: "🐾" },
              { t: "Mystery Box", c: "⭐ 80", e: "🎁" },
            ].map((x) => (
              <div key={x.t} className="rounded-3xl bg-white/60 border border-white/70 p-4">
                <div className="text-2xl">{x.e}</div>
                <div className="mt-2 font-extrabold text-slate-900">{x.t}</div>
                <div className="text-sm text-slate-600 mt-1">{x.c}</div>
              </div>
            ))}
          </div>
        </BentoCard>
      </BentoGrid>
    </Page>
  );
}
