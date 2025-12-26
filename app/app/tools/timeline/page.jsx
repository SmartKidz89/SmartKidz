"use client";

import { useEffect, useMemo, useState } from "react";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { useActiveChild } from "@/hooks/useActiveChild";
import { supabase } from "@/lib/supabase/client";
import ChildAvatar from "@/components/avatar/ChildAvatar";
import { playUISound, haptic } from "@/components/ui/sound";

function formatDay(d) {
  try {
    return new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch { return ""; }
}

function iconFor(type) {
  const m = {
    start: "🚀",
    lesson: "✅",
    streak: "🔥",
    badge: "🏅",
    reflection: "🌱",
    subject: "🧭",
  };
  return m[type] || "✨";
}

function subjectName(id) {
  const m = { MAT:"Maths", ENG:"English", SCI:"Science", HASS:"HASS", HPE:"HPE", ARTS:"The Arts", TECH:"Technologies", LANG:"Languages" };
  return m[id] || id || "Learning";
}

function computeStreak(datesUtc) {
  // datesUtc: array of YYYY-MM-DD strings sorted desc
  const set = new Set(datesUtc);
  const today = new Date();
  // use local date for streak, but based on completed days.
  function toKey(dt){
    const y = dt.getFullYear();
    const m = String(dt.getMonth()+1).padStart(2,"0");
    const d = String(dt.getDate()).padStart(2,"0");
    return `${y}-${m}-${d}`;
  }
  let streak = 0;
  let cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  // allow streak to start from yesterday if no completion today
  if (!set.has(toKey(cursor))) cursor.setDate(cursor.getDate()-1);
  while (set.has(toKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate()-1);
  }
  return streak;
}

export default function AchievementTimelinePage() {
  const { activeChild } = useActiveChild();
  const childId = activeChild?.id;

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      setErr("");
      setLoading(true);
      setItems([]);
      if (!childId) { setLoading(false); return; }

      // 1) Progress
      const { data: progress, error: pErr } = await supabase
        .from("lesson_progress")
        .select("lesson_id, updated_at, status")
        .eq("child_id", childId)
        .order("updated_at", { ascending: false })
        .limit(400);

      if (!mounted) return;
      if (pErr) { setErr(pErr.message); setLoading(false); return; }

      const completed = (progress || []).filter(p => (p.status || "").toLowerCase() === "completed");
      const ids = completed.map(p => p.lesson_id).filter(Boolean);

      // 2) Lessons details
      let lessons = [];
      if (ids.length) {
        const { data: lData, error: lErr } = await supabase
          .from("lessons")
          .select("id, title, subject_id, year_level, topic")
          .in("id", ids.slice(0, 300));
        if (!mounted) return;
        if (lErr) { setErr(lErr.message); setLoading(false); return; }
        lessons = lData || [];
      }

      // 3) Reflections (optional table)
      let reflections = [];
      const { data: rData, error: rErr } = await supabase
        .from("child_reflections")
        .select("id, mood, proud, created_at")
        .eq("child_id", childId)
        .order("created_at", { ascending: false })
        .limit(60);
      if (!mounted) return;
      if (!rErr) reflections = rData || [];

      const map = new Map(lessons.map(l => [l.id, l]));
      const timeline = [];

      // Start event (best-effort: use first completion or now)
      const firstCompletion = completed.length ? completed[completed.length - 1]?.updated_at : null;
      timeline.push({
        id: "start",
        type: "start",
        title: "Journey started",
        body: "Every small step builds confidence.",
        at: firstCompletion || new Date().toISOString(),
      });

      // Milestone: first lesson
      if (completed.length) {
        const first = completed[completed.length - 1];
        const l = map.get(first.lesson_id);
        timeline.push({
          id: "first_lesson",
          type: "lesson",
          title: "First lesson completed",
          body: l ? `${l.title} · ${subjectName(l.subject_id)}` : "First lesson completed",
          at: first.updated_at,
        });
      }

      // Milestones by counts
      const counts = [5, 10, 25, 50, 100, 200];
      for (const c of counts) {
        if (completed.length >= c) {
          const p = completed[completed.length - c];
          timeline.push({
            id: `milestone_${c}`,
            type: "badge",
            title: `${c} lessons completed`,
            body: "Consistency is how learning sticks.",
            at: p.updated_at,
          });
        }
      }

      // Subject milestones (first completion per subject)
      const seenSub = new Set();
      for (const p of completed.slice().reverse()) {
        const l = map.get(p.lesson_id);
        if (!l) continue;
        if (seenSub.has(l.subject_id)) continue;
        seenSub.add(l.subject_id);
        timeline.push({
          id: `subject_${l.subject_id}`,
          type: "subject",
          title: `First steps in ${subjectName(l.subject_id)}`,
          body: l.topic || l.title,
          at: p.updated_at,
        });
      }

      // Streak milestone
      const dayKeys = completed.map(p => {
        const d = new Date(p.updated_at);
        const y=d.getUTCFullYear(), m=String(d.getUTCMonth()+1).padStart(2,"0"), da=String(d.getUTCDate()).padStart(2,"0");
        return `${y}-${m}-${da}`;
      });
      const uniqDays = Array.from(new Set(dayKeys));
      const currentStreak = computeStreak(uniqDays);
      if (currentStreak >= 3) {
        timeline.push({
          id: "streak_now",
          type: "streak",
          title: `${currentStreak}-day learning streak`,
          body: "Momentum feels good — keep it calm and steady.",
          at: new Date().toISOString(),
        });
      }

      // Reflections become timeline events
      for (const r of reflections) {
        timeline.push({
          id: `ref_${r.id}`,
          type: "reflection",
          title: "Reflection saved",
          body: r.proud ? `Proud: ${r.proud}` : `Mood: ${r.mood}`,
          at: r.created_at,
        });
      }

      // Sort desc by time
      timeline.sort((a,b) => new Date(b.at) - new Date(a.at));

      setItems(timeline);
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, [childId]);

  function printNow() {
    try { playUISound("tap"); haptic("light"); } catch {}
    window.print();
  }

  return (
    <PageScaffoldMotion className="max-w-6xl mx-auto space-y-6">
      <div className="skz-glass p-6 md:p-8 skz-border-animate skz-shine">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <ChildAvatar config={activeChild?.avatar_config || {}} size={64} />
            <div>
              <div className="text-sm text-slate-500">Premium journey</div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Achievement timeline</h1>
              <p className="mt-2 text-sm md:text-base text-slate-700">
                A calm, beautiful timeline of milestones and growth. Parents can print this anytime.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="skz-chip px-4 py-3 skz-press" onClick={() => history.back()}>Back</button>
            <button className="skz-glass skz-border-animate skz-shine px-5 py-3 skz-press" onClick={printNow}>
              Print
            </button>
            <a className="skz-glass skz-border-animate skz-shine px-4 py-3 skz-press text-sm" href="/app/parent/timeline">
              Parent view →
            </a>
          </div>
        </div>
      </div>

      {err ? <div className="skz-card p-5 text-rose-700">{err}</div> : null}

      {loading ? (
        <div className="skz-card p-6 text-slate-600">Loading timeline…</div>
      ) : items.length ? (
        <div className="skz-card p-6 md:p-8">
          <div className="relative">
            <div className="absolute left-5 top-2 bottom-2 w-px bg-slate-200" />
            <div className="space-y-5">
              {items.map((it) => (
                <div key={it.id} className="relative pl-14">
                  <div className="absolute left-2 top-1 w-8 h-8 skz-chip flex items-center justify-center">
                    <span className="text-lg">{iconFor(it.type)}</span>
                  </div>
                  <div className="skz-glass p-5 skz-glow skz-shine">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-lg font-semibold">{it.title}</div>
                        <div className="mt-1 text-sm text-slate-700">{it.body}</div>
                      </div>
                      <div className="skz-chip px-3 py-2 text-xs">{formatDay(it.at)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="skz-card p-6 text-slate-600">No timeline yet. Complete a lesson to start your journey.</div>
      )}

      <style jsx global>{`
        @media print {
          header, nav, .no-print { display: none !important; }
          body { background: white !important; }
          .skz-glass, .skz-card { box-shadow: none !important; border: 1px solid #e5e7eb !important; }
          .skz-border-animate::after, .skz-glow::before, .skz-shine::after { display: none !important; }
        }
      `}</style>
    </PageMotion>
  );
}
