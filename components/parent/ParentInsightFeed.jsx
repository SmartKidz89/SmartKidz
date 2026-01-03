"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { transitions, variants } from "@/lib/motion";
import { supabase } from "@/lib/supabase/client";

function niceSubject(id) {
  const m = {
    MAT: "Mathematics",
    ENG: "English",
    SCI: "Science",
    HASS: "HASS",
    HPE: "HPE",
    ARTS: "The Arts",
    TECH: "Technologies",
    LANG: "Languages",
  };
  return m[id] || id || "Learning";
}

function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

function buildNarratives({ childName, recentLessons }) {
  const name = childName || "Your child";
  const bySubject = new Map();
  for (const l of recentLessons) {
    const key = l.subject_id || "GEN";
    bySubject.set(key, (bySubject.get(key) || 0) + 1);
  }
  const top = [...bySubject.entries()].sort((a,b)=>b[1]-a[1])[0];
  const topSubject = top ? niceSubject(top[0]) : "learning";

  const streakHint =
    "A short lesson most days is the fastest way to build confidence. Aim for a calm 10–15 minutes.";

  const insights = [];

  insights.push({
    icon: "✨",
    title: "Momentum is building",
    body: `${name} has completed ${recentLessons.length} lessons recently. That consistency is how skills stick.`,
    meta: "Evidence-based habit",
    tone: "indigo",
  });

  insights.push({
    icon: "🧠",
    title: `Strongest focus: ${topSubject}`,
    body: `${name} has been spending the most time in ${topSubject}. Keep that momentum and add a small mix-in from another world each week.`,
    meta: "Balanced progression",
    tone: "emerald",
  });

  insights.push({
    icon: "🛡️",
    title: "Confidence signal",
    body: `When kids complete short lessons regularly, they feel safer trying harder questions. Celebrate effort, not just correct answers.`,
    meta: "Parent coaching tip",
    tone: "rose",
  });

  insights.push({
    icon: "📌",
    title: "Next best step",
    body: streakHint,
    meta: "Recommended routine",
    tone: "amber",
  });

  return insights;
}

export default function ParentInsightFeed({ childId, childName }) {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState([]);
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError("");
      setInsights([]);
      setRecent([]);
      if (!childId) { setLoading(false); return; }

      const { data: attemptsData, error: pErr } = await supabase
        .from("attempts")
        .select("edition_id,title,country_code,lesson_templates(subject_id,year_level,topic)")
        .eq("child_id", childId)
        .order("updated_at", { ascending: false })
        .limit(40);

      if (!mounted) return;
      if (pErr) { setError(pErr.message); setLoading(false); return; }

      const completed = (progress || []).filter((p) => (p.status || "").toLowerCase() === "completed");
      const ids = completed.map((p) => p.lesson_id).filter(Boolean);
      if (!ids.length) {
        setInsights(buildNarratives({ childName, recentLessons: [] }));
        setLoading(false);
        return;
      }

      const { data: lessons, error: lErr } = await supabase
        .from("lesson_editions")
        .select("id, title, topic, subject_id, year_level")
        .in("edition_id", ids);

      if (!mounted) return;
      if (lErr) { setError(lErr.message); setLoading(false); return; }

      // map by id, keep order of completion
      const map = new Map((lessons || []).map((l) => [l.id, l]));
      const recentLessons = completed
        .slice(0, 10)
        .map((p) => ({ ...map.get(p.lesson_id), when: p.updated_at }))
        .filter(Boolean);

      setRecent(recentLessons);
      setInsights(buildNarratives({ childName, recentLessons }));
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, [childId, childName]);

  return (
    <div className="space-y-4">
      <div className="skz-glass p-5 md:p-6 skz-border-animate skz-shine">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm text-slate-500">Parent insight feed</div>
            <div className="text-xl md:text-2xl font-semibold tracking-tight">
              Clear insights, not noisy analytics
            </div>
            <div className="mt-2 text-sm text-slate-700">
              Short, helpful notes that make it easy to support learning at home.
            </div>
          </div>
          <div className="skz-chip px-3 py-2 text-sm">✨ Premium</div>
        </div>
      </div>

      {error ? <div className="skz-card p-5 text-rose-700">{error}</div> : null}

      {loading ? (
        <div className="skz-card p-6 text-slate-600">Loading insights…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((it) => (
            <motion.div
              key={it.title}
              className="skz-card p-6 relative overflow-hidden skz-glow skz-shine"
              initial={variants.cardIn.initial}
              animate={variants.cardIn.animate}
              transition={transitions.card}
            >
              <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-indigo-400/10 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-rose-400/10 blur-3xl" />
              <div className="relative flex items-start gap-3">
                <div className="skz-chip w-12 h-12 flex items-center justify-center shadow-sm">
                  <span className="text-xl">{it.icon}</span>
                </div>
                <div>
                  <div className="text-lg font-semibold">{it.title}</div>
                  <div className="mt-2 text-sm text-slate-700 leading-relaxed">{it.body}</div>
                  <div className="mt-3 text-xs text-slate-500">{it.meta}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="skz-card p-6">
        <div className="text-sm font-semibold">Recently completed</div>
        <div className="mt-3 space-y-2">
          {recent.length ? recent.map((l) => (
            <div key={l.id} className="skz-glass p-4 flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">{l.title}</div>
                <div className="text-xs text-slate-500 mt-1">{niceSubject(l.subject_id)} · Year {l.year_level}</div>
                <div className="text-sm text-slate-700 mt-1">{l.topic}</div>
              </div>
              <div className="skz-chip px-3 py-2 text-xs">{formatDate(l.when)}</div>
            </div>
          )) : (
            <div className="text-sm text-slate-600">
              No completions yet. Once lessons are completed, you’ll see premium insights here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
