"use client";

import { useEffect, useMemo, useState } from "react";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { useActiveChild } from "@/hooks/useActiveChild";
import { supabase } from "@/lib/supabase/client";
import ChildAvatar from "@/components/avatar/ChildAvatar";
import { playUISound, haptic } from "@/components/ui/sound";

function formatDate(d) {
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export default function StorybookPage() {
  const { activeChild } = useActiveChild();
  const childId = activeChild?.id;
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      setErr("");
      setLoading(true);
      if (!childId) { setPages([]); setLoading(false); return; }

      // Pull completed lesson_progress then join lessons for title/topic/subject/year.
      const { data: progress, error: pErr } = await supabase
        .from("lesson_progress")
        .select("lesson_id, updated_at, status")
        .eq("child_id", childId)
        .order("updated_at", { ascending: false })
        .limit(120);

      if (!mounted) return;
      if (pErr) { setErr(pErr.message); setLoading(false); return; }

      const completed = (progress || []).filter((p) => (p.status || "").toLowerCase() === "completed");
      const ids = completed.map((p) => p.lesson_id).filter(Boolean);

      if (!ids.length) { setPages([]); setLoading(false); return; }

      const { data: lessons, error: lErr } = await supabase
        .from("lessons")
        .select("id, title, topic, subject_id, year_level")
        .in("id", ids);

      if (!mounted) return;
      if (lErr) { setErr(lErr.message); setLoading(false); return; }

      const lessonMap = new Map((lessons || []).map((l) => [l.id, l]));
      const story = completed
        .map((p, idx) => {
          const l = lessonMap.get(p.lesson_id);
          if (!l) return null;
          return {
            id: `${p.lesson_id}_${idx}`,
            lessonId: p.lesson_id,
            when: p.updated_at,
            title: l.title,
            topic: l.topic,
            subject: l.subject_id,
            year: l.year_level,
            reflection: pickReflectionPrompt(l.subject_id, l.year_level),
            badge: pickBadge(l.subject_id),
          };
        })
        .filter(Boolean);

      setPages(story);
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, [childId]);

  const header = useMemo(() => {
    const name = activeChild?.display_name || "Your child";
    const year = typeof activeChild?.year_level === "number" ? `Year ${activeChild.year_level}` : "";
    return { name, year };
  }, [activeChild]);

  function printNow() {
    try { playUISound("tap"); haptic("light"); } catch {}
    window.print();
  }

  return (
    <PageScaffoldMotion className="max-w-6xl mx-auto space-y-6">
      <div className="skz-glass p-6 md:p-8 skz-border-animate skz-shine">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <ChildAvatar config={activeChild?.avatar_config || {}} size={72} />
            <div>
              <div className="text-sm text-slate-500">Learning storybook</div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{header.name}</h1>
              <div className="mt-1 text-sm text-slate-600">{header.year} · A journal of completed lessons</div>
              <div className="mt-3 text-sm text-slate-700">
                This turns learning into a story. Parents can print it any time as a keepsake.
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button className="skz-chip px-4 py-3 skz-press" onClick={() => history.back()}>Back</button>
            <button className="skz-glass skz-border-animate skz-shine px-5 py-3 skz-press" onClick={printNow}>
              Print storybook
            </button>
          </div>
        </div>
      </div>

      {err ? <div className="skz-card p-5 text-rose-700">{err}</div> : null}

      {loading ? (
        <div className="skz-card p-6 text-slate-600">Loading storybook…</div>
      ) : pages.length === 0 ? (
        <div className="skz-card p-6 text-slate-600">
          No completed lessons yet. Complete a lesson to start your storybook.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pages.map((p, idx) => (
            <div key={p.id} className="skz-card p-6 relative overflow-hidden skz-glow skz-shine">
              <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-indigo-400/10 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-rose-400/10 blur-3xl" />

              <div className="relative">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs text-slate-500">Page {idx + 1}</div>
                    <div className="mt-1 text-lg font-semibold leading-tight">{p.title}</div>
                    <div className="mt-1 text-sm text-slate-600">{p.topic}</div>
                  </div>
                  <div className="skz-chip px-3 py-2 text-sm">{p.badge} Badge</div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="skz-glass p-3">
                    <div className="text-xs text-slate-500">World</div>
                    <div className="font-semibold">{p.subject}</div>
                  </div>
                  <div className="skz-glass p-3">
                    <div className="text-xs text-slate-500">When</div>
                    <div className="font-semibold">{formatDate(p.when)}</div>
                  </div>
                </div>

                <div className="mt-4 skz-glass p-4">
                  <div className="text-xs text-slate-500">Reflection prompt</div>
                  <div className="mt-1 text-sm text-slate-700">{p.reflection}</div>
                </div>

                <div className="mt-4 skz-divider" />
                <div className="mt-3 text-xs text-slate-500">
                  Tip: Print weekly and keep it on the fridge — kids love seeing progress.
                </div>
              </div>
            </div>
          ))}
        </div>
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

function pickBadge(subject) {
  const m = {
    MAT: "⭐",
    ENG: "📚",
    SCI: "🔬",
    HASS: "🧭",
    HPE: "🏃",
    ARTS: "🎨",
    TECH: "🛠️",
    LANG: "🗣️",
  };
  return m[subject] || "✨";
}

function pickReflectionPrompt(subject, year) {
  const y = typeof year === "number" ? year : 2;
  if (y <= 1) {
    return "Tell a parent: What was your favourite part? Point to one thing you learned.";
  }
  const bySubject = {
    MAT: "Where could you use this in real life (shopping, games, cooking)?",
    ENG: "Use a new word from today in a sentence. What does it mean?",
    SCI: "What did you observe? What would you test next time?",
    HASS: "What did you learn about people/places? Why does it matter?",
    HPE: "How does this help your body or mind feel strong?",
    ARTS: "What choices did you make (colour, rhythm, movement)? Why?",
    TECH: "What did you build or design? How would you improve it?",
    LANG: "Say one new phrase. When could you use it with someone?",
  };
  return bySubject[subject] || "What did you learn today? How will you remember it?";
}
