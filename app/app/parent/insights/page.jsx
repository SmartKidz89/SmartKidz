"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import PaywallGate from "@/components/app/PaywallGate";
import { useActiveChild } from "@/hooks/useActiveChild";
import { readProgressLog } from "@/lib/progress/log";
import { loadMastery } from "@/lib/mastery/store";
import { deriveLearningSignals } from "@/lib/lesson/insights";

import { Page as PageScaffold } from "@/components/ui/PageScaffold";;
function startOfWeek(ts) {
  const d = new Date(ts);
  const day = (d.getDay() + 6) % 7; // Monday=0
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d.getTime();
}

function dayLabel(ts) {
  return new Date(ts).toLocaleDateString(undefined, { weekday: "short" });
}

function labelSkill(id) {
  if (!id) return "Skill";
  return String(id).replace(/_/g, " ");
}

function LatestActivityCard({ latest }) {
  if (!latest) return null;
  const accuracy = latest?.quiz?.accuracy ?? latest?.telemetry?.accuracy ?? 1;
  const signals = deriveLearningSignals({ accuracy, summary: latest?.telemetry || {} });
  const stateLabel = signals.state === "frustrated" ? "Felt tricky" : signals.state === "bored" ? "Too easy" : "In the flow";

  return (
    
    <PageScaffold title="Insights">
<div className="skz-glass p-4 rounded-2xl" data-testid="latest-activity">
      <div className="text-xs font-semibold text-slate-500">Latest activity</div>
      <div className="mt-1 font-extrabold text-slate-900" data-testid="latest-activity-title">
        {latest.title || latest.kind || "Activity"}
      </div>
      <div className="text-sm text-slate-600 mt-1" data-testid="latest-activity-meta">
        {latest.subject ? `${latest.subject} • ` : ""}{new Date(latest.ts).toLocaleString()}
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white/60 p-3">
          <div className="text-xs text-slate-500">Confidence</div>
          <div className="text-lg font-extrabold">{Math.round((signals.confidence || 0) * 100)}%</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white/60 p-3">
          <div className="text-xs text-slate-500">Feel</div>
          <div className="text-lg font-extrabold">{stateLabel}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white/60 p-3">
          <div className="text-xs text-slate-500">Time</div>
          <div className="text-lg font-extrabold">{signals.minutes.toFixed(1)}m</div>
        </div>
      </div>
    </div>
  
    </PageScaffold>
  );
}

function MasteryHighlights() {
  const [top, setTop] = useState([]);
  useEffect(() => {
    try {
      const m = loadMastery();
      const entries = Object.entries(m || {})
        .map(([id, v]) => ({ id, v }))
        .filter((x) => typeof x.v === "number")
        .sort((a, b) => b.v - a.v)
        .slice(0, 6);
      setTop(entries);
    } catch {
      setTop([]);
    }
  }, []);

  if (!top.length) {
    return <div className="text-sm text-slate-600">No mastery data yet.</div>;
  }
  return (
    <div className="mt-3 space-y-2">
      {top.map((s) => (
        <div key={s.id} className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-slate-800">{labelSkill(s.id)}</div>
          <div className="text-sm font-extrabold text-slate-900">{Math.round(s.v * 100)}%</div>
        </div>
      ))}
    </div>
  );
}

export default function ParentInsightsPage() {
  const { kids, setActiveChild, activeChildId } = useActiveChild();

  const entries = useMemo(() => {
    const log = readProgressLog();
    return (log || []).filter((e) => !activeChildId || e.childId === activeChildId);
  }, [activeChildId]);

  const latest = entries?.[0] || null;
  const weekStart = startOfWeek(Date.now());

  const weekCounts = useMemo(() => {
    const m = new Map();
    for (const e of entries) {
      if (!e?.ts) continue;
      if (e.ts < weekStart) continue;
      const d = dayLabel(e.ts);
      m.set(d, (m.get(d) || 0) + 1);
    }
    return Array.from(m.entries());
  }, [entries, weekStart]);

  function doPrint() {
    try {
      window.print();
    } catch {}
  }

  return (
    <PaywallGate>
      <div className="container-pad py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between print:hidden">
          <div>
            <div className="text-2xl font-black text-slate-900">Parent insights</div>
            <div className="text-sm text-slate-600">A calm, parent-friendly summary you can print or save.</div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/app/parent" className="skz-pressable rounded-2xl px-4 py-2 text-sm font-semibold bg-white/80 border border-slate-200 shadow-sm backdrop-blur">
              Back to Parent
            </Link>
            <Link href="/app/parent/share" className="skz-pressable rounded-2xl px-4 py-2 text-sm font-semibold bg-white/80 border border-slate-200 shadow-sm backdrop-blur">
              Export milestone
            </Link>
            <Button onClick={doPrint} className="rounded-2xl px-5 py-2 font-black">Print / Save PDF</Button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 print:hidden">
          <span className="text-xs font-semibold text-slate-600">Child:</span>
          {(kids || []).map((k) => (
            <button
              key={k.id}
              onClick={() => setActiveChild(k.id)}
              className={
                "skz-pressable rounded-full px-3 py-1 text-xs font-bold border backdrop-blur " +
                (activeChildId === k.id ? "bg-white border-slate-300" : "bg-white/60 border-slate-200")
              }
            >
              {k.name}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3 print:grid-cols-3">
          <Card className="rounded-3xl bg-white/80 border border-slate-200 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur p-5">
            <div className="text-xs font-semibold text-slate-600">Top mastered skills</div>
            <MasteryHighlights />
          </Card>

          <Card className="rounded-3xl bg-white/80 border border-slate-200 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur p-5 md:col-span-2 print:col-span-2">
            <LatestActivityCard latest={latest} />
          </Card>
        </div>

        <Card className="mt-4 rounded-3xl bg-white/75 border border-slate-200 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur p-6">
          <div className="flex items-center justify-between gap-2">
            <div className="text-lg font-black text-slate-900">This week</div>
            <div className="text-xs text-slate-600">Based on activity captured on this device</div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {weekCounts.length ? (
              weekCounts.map(([day, count]) => (
                <div key={day} className="rounded-2xl border border-slate-200 bg-white/60 p-4">
                  <div className="text-sm font-bold text-slate-900">{day}</div>
                  <div className="mt-1 text-sm text-slate-600">{count} activity{count === 1 ? "" : "ies"}</div>
                </div>
              ))
            ) : (
              <div className="text-sm text-slate-600">No activity logged yet this week.</div>
            )}
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 border border-slate-200 p-4 print:hidden">
            <div className="text-sm font-bold text-slate-900">Note</div>
            <div className="mt-1 text-sm text-slate-600">
              For full cross-device reporting, enable Supabase persistence (service role key) and wire this view to backend progress tables.
            </div>
          </div>
        </Card>
      </div>
    </PaywallGate>
  );
}