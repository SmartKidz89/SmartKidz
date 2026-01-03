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
        // 1. Fetch Lesson Progress
        const { data: attemptsDataData, error: progErr } = await supabase
          .from("attempts")
          .select("edition_id,title,country_code,lesson_templates(subject_id,year_level,topic)")
          .eq("child_id", selectedId);

        if (progErr) throw progErr;

        // 2. Fetch Lessons
        const completedIds = progressData?.filter(p => p.status === 'completed').map(p => p.lesson_id) || [];
        
        let lessonsMap = {};
        if (completedIds.length > 0) {
            const { data: lData } = await supabase
                .from("lesson_editions")
                .select("id, subject_id")
                .in("edition_id", completedIds);
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

        // 4. Fetch Badges
        const { data: badgeData } = await supabase
           .from("child_badges")
           .select("badge_id")
           .eq("child_id", selectedId);

        if (mounted) {
           setSummary(summaryArray);
           setBadges(badgeData || []);
           setStreak({ current: 0 }); // Placeholder
        }

      } catch (e) {
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
    ART: "Arts",
    TECH: "Tech",
    LANG: "Languages",
  };

  return (
    <section className="rounded-[2.5rem] border border-slate-200 bg-white/60 shadow-lg p-6 sm:p-8">
      
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div>
          <div className="text-xs font-extrabold tracking-wide text-slate-400 uppercase mb-1">PARENT INSIGHTS</div>
          <div className="text-2xl font-black text-slate-900 leading-tight">
            {selectedKid ? `${selectedKid.display_name}'s Progress` : "Overview"}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {kids?.map((k) => {
            const active = k.id === selectedId;
            return (
              <button
                key={k.id}
                onClick={() => { setSelectedId(k.id); setActiveChild(k.id); }}
                className={
                  "rounded-full px-4 py-2 text-xs font-bold border transition-all " +
                  (active
                    ? "bg-slate-900 text-white border-slate-900 shadow-md"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-400")
                }
              >
                {k.display_name}
              </button>
            );
          })}
        </div>
      </div>

      {error ? (
        <div className="p-6 rounded-3xl bg-rose-50 border border-rose-100 text-center text-rose-600 font-medium">
           Could not load data.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Main Stat Cards */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-bold uppercase text-slate-400">Total Lessons</div>
            <div className="mt-2 text-3xl font-black text-indigo-600">
               {summary.reduce((a, b) => a + b.lessons_completed, 0)}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-bold uppercase text-slate-400">Badges Earned</div>
            <div className="mt-2 text-3xl font-black text-amber-500">{badges.length}</div>
          </div>
          
          {/* Detailed Subject Breakdown */}
          <div className="sm:col-span-2 lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
             <div className="text-xs font-bold uppercase text-slate-400 mb-4">Focus Areas</div>
             
             {summary.length === 0 ? (
                <div className="text-sm text-slate-500 italic">No lessons completed yet.</div>
             ) : (
                <div className="space-y-4">
                   {summary.map(s => {
                      const total = summary.reduce((a,b) => a + b.lessons_completed, 0);
                      const pct = Math.round((s.lessons_completed / total) * 100);
                      return (
                        <div key={s.subject_id} className="flex items-center gap-3">
                           <div className="w-24 text-sm font-bold text-slate-700 truncate">
                              {SUBJECT_LABELS[s.subject_id] || s.subject_id}
                           </div>
                           <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                           </div>
                           <div className="text-xs font-bold text-slate-500 w-8 text-right">{s.lessons_completed}</div>
                        </div>
                      );
                   })}
                </div>
             )}
          </div>

        </div>
      )}
    </section>
  );
}