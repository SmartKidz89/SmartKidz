"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { useActiveChild } from "@/hooks/useActiveChild";
import { getGeoConfig } from "@/lib/marketing/geoConfig";

function fmtPct(n) {
  if (n == null || Number.isNaN(n)) return "—";
  return `${Math.round(Number(n) * 100)}%`;
}

export default function ParentInsightsDashboard() {
  const { kids, activeChildId, setActiveChild } = useActiveChild();
  const [selectedId, setSelectedId] = useState(activeChildId || null);
  const [loading, setLoading] = useState(true);
  
  // Data state
  const [summary, setSummary] = useState([]);
  const [badges, setBadges] = useState([]);
  const [streak, setStreak] = useState({ current: 0 });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedId && kids?.length) setSelectedId(kids[0].id);
  }, [kids, selectedId]);

  useEffect(() => {
    if (!activeChildId) return;
    setSelectedId((prev) => prev || activeChildId);
  }, [activeChildId]);

  useEffect(() => {
    let mounted = true;
    async function run() {
      setLoading(true);
      setError(null);
      const supabase = getSupabaseClient();
      
      if (!supabase || !selectedId) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        // 1. Fetch Lesson Progress directly
        const { data: progressData, error: progErr } = await supabase
          .from("lesson_progress")
          .select("lesson_id, status, mastery_score, updated_at")
          .eq("child_id", selectedId);

        if (progErr) throw progErr;

        // 2. Fetch Lessons to map subjects (Optimization: could be cached)
        const completedIds = progressData?.filter(p => p.status === 'completed').map(p => p.lesson_id) || [];
        
        let lessonsMap = {};
        if (completedIds.length > 0) {
            const { data: lData } = await supabase
                .from("lessons")
                .select("id, subject_id")
                .in("id", completedIds);
            (lData || []).forEach(l => { lessonsMap[l.id] = l.subject_id; });
        }

        // 3. Aggregate Summary
        const agg = {};
        (progressData || []).forEach(p => {
           if (p.status !== 'completed') return;
           const subj = lessonsMap[p.lesson_id] || 'Other';
           if (!agg[subj]) agg[subj] = { count: 0, sumMastery: 0 };
           agg[subj].count++;
           agg[subj].sumMastery += (p.mastery_score || 0);
        });

        const summaryArray = Object.entries(agg).map(([subject_id, val]) => ({
            subject_id,
            lessons_completed: val.count,
            avg_mastery: val.count ? val.sumMastery / val.count : 0
        }));

        // 4. Fetch Badges directly
        const { data: badgeData } = await supabase
           .from("child_badges")
           .select("badge_id, awarded_at")
           .eq("child_id", selectedId);

        if (mounted) {
           setSummary(summaryArray);
           setBadges(badgeData || []);
           // Mock streak for now as it requires complex query, or fetch from child_daily_activity if exists
           setStreak({ current: 0 }); // Placeholder
        }

      } catch (e) {
        console.warn("Dashboard fetch failed:", e);
        if (mounted) setError(e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    run();
    return () => { mounted = false; };
  }, [selectedId]);

  const selectedKid = useMemo(() => kids?.find((k) => k.id === selectedId) || null, [kids, selectedId]);
  const geo = getGeoConfig(selectedKid?.country || "AU");

  const SUBJECT_LABELS = {
    MAT: geo.mathTerm,
    MATH: geo.mathTerm,
    ENG: "English",
    SCI: "Science",
    HASS: geo.hassTerm,
    HPE: geo.code === "US" ? "Health & PE" : "HPE",
    ARTS: "Arts",
    ART: "Arts",
    TECH: "Technologies",
    LANG: "Languages",
  };

  return (
    <section className="rounded-4xl border border-slate-200 bg-white/60 shadow-soft p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-extrabold tracking-wide text-slate-500">INSIGHTS</div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {selectedKid ? `How ${selectedKid.display_name} is going` : "Learning insights"}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {kids?.map((k) => {
            const active = k.id === selectedId;
            return (
              <button
                key={k.id}
                onClick={() => {
                  setSelectedId(k.id);
                  setActiveChild(k.id);
                }}
                className={
                  "rounded-2xl px-3 py-2 text-sm font-extrabold border transition " +
                  (active
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white/80 text-slate-800 border-slate-200 hover:bg-white")
                }
              >
                {k.display_name}
              </button>
            );
          })}
        </div>
      </div>

      {error ? (
        <div className="mt-6 p-4 rounded-3xl bg-rose-50 border border-rose-100 text-center">
           <div className="text-rose-700 font-bold text-sm mb-1">Could not load dashboard data</div>
           <div className="text-rose-500 text-xs font-mono">{error}</div>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="rounded-3xl border border-slate-200 bg-white/75 p-4 shadow-soft">
            <div className="text-xs font-extrabold text-slate-500">Current streak</div>
            <div className="mt-1 text-2xl font-black text-slate-900">
              {streak ? `${streak.current} day${streak.current === 1 ? "" : "s"}` : "0 days"}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white/75 p-4 shadow-soft">
            <div className="text-xs font-extrabold text-slate-500">Subjects started</div>
            <div className="mt-1 text-2xl font-black text-slate-900">{summary.length}</div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white/75 p-4 shadow-soft">
            <div className="text-xs font-extrabold text-slate-500">Badges earned</div>
            <div className="mt-1 text-2xl font-black text-slate-900">{badges.length}</div>
          </div>
        </div>
      )}

      {summary.length === 0 && !loading && !error && (
        <div className="mt-6 p-6 rounded-3xl bg-slate-50 border border-slate-200 text-center">
           <div className="text-slate-500 font-medium">No activity recorded yet.</div>
           <div className="text-sm text-slate-400 mt-1">Complete a lesson to see stats here!</div>
        </div>
      )}

      {summary.length > 0 && (
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-3xl border border-slate-200 bg-white/75 p-4 shadow-soft">
            <div className="text-sm font-black text-slate-900 mb-3">Progress by subject</div>
            <div className="space-y-2">
              {summary.map((s) => (
                <div key={s.subject_id} className="flex items-center justify-between rounded-2xl bg-slate-50 border border-slate-200 px-3 py-2">
                  <div>
                    <div className="text-sm font-extrabold text-slate-800">
                      {SUBJECT_LABELS[s.subject_id] || s.subject_id}
                    </div>
                    <div className="text-xs font-semibold text-slate-600">
                      {s.lessons_completed ?? 0} completed
                    </div>
                  </div>
                  <div className="text-xs font-black text-slate-900">{fmtPct(s.avg_mastery)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}