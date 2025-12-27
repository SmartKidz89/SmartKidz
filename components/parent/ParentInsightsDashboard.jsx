"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { useActiveChild } from "@/hooks/useActiveChild";

const SUBJECT_LABELS = {
  MAT: "Maths",
  ENG: "English",
  SCI: "Science",
  HASS: "HASS",
  HPE: "HPE",
  ARTS: "Arts",
  TECH: "Technologies",
  LANG: "Languages",
  AUS: "Auslan",
  IND: "Hindi",
  JPN: "Japanese",
  ZHO: "Chinese",
  FRA: "French",
  SPA: "Spanish",
  ABL: "Aboriginal Languages",
};

function fmtPct(n) {
  if (n == null || Number.isNaN(n)) return "—";
  // mastery_score is 0..1
  return `${Math.round(Number(n) * 100)}%`;
}

export default function ParentInsightsDashboard() {
  const { kids, activeChildId, setActiveChild } = useActiveChild();
  const [selectedId, setSelectedId] = useState(activeChildId || null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [dash, setDash] = useState(null);

  useEffect(() => {
    if (!selectedId && kids?.length) setSelectedId(kids[0].id);
  }, [kids, selectedId]);

  useEffect(() => {
    if (!activeChildId) return;
    setSelectedId((prev) => prev || activeChildId);
  }, [activeChildId]);

  useEffect(() => {
    async function run() {
      setLoading(true);
      setErr(null);

      const supabase = getSupabaseClient();
      if (!supabase || !selectedId) {
        setLoading(false);
        return;
      }

      try {
        // Preferred: use your RPC so the parent dashboard is consistent with RLS.
        const { data, error } = await supabase.rpc("get_child_dashboard", {
          p_child_id: selectedId,
          p_subject_id: null,
        });

        if (error) throw error;
        setDash(data);
      } catch (e) {
        // Keep the page usable even if the RPC hasn't been deployed yet.
        setDash(null);
        setErr(e?.message || "Failed to load parent insights");
      } finally {
        setLoading(false);
      }
    }

    run();
  }, [selectedId]);

  const selectedKid = useMemo(() => kids?.find((k) => k.id === selectedId) || null, [kids, selectedId]);
  const summary = dash?.summary || [];
  const badges = dash?.badges || [];
  const streak = dash?.streak || null;

  return (
    <section className="rounded-4xl border border-slate-200 bg-white/60 shadow-soft p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-extrabold tracking-wide text-slate-500">INSIGHTS</div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {selectedKid ? `How ${selectedKid.display_name} is going` : "Learning insights"}
          </div>
          <div className="mt-1 text-sm font-semibold text-slate-600">
            Progress, streaks, and rewards — updated as they learn.
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

      {err && (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          {err}
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-3xl border border-slate-200 bg-white/75 p-4 shadow-soft">
          <div className="text-xs font-extrabold text-slate-500">Current streak</div>
          <div className="mt-1 text-2xl font-black text-slate-900">
            {streak ? `${streak.current} day${streak.current === 1 ? "" : "s"}` : "—"}
          </div>
          <div className="mt-1 text-xs font-semibold text-slate-600">Best: {streak ? streak.best : "—"}</div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white/75 p-4 shadow-soft">
          <div className="text-xs font-extrabold text-slate-500">Subjects started</div>
          <div className="mt-1 text-2xl font-black text-slate-900">{summary.length}</div>
          <div className="mt-1 text-xs font-semibold text-slate-600">Any activity recorded</div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white/75 p-4 shadow-soft">
          <div className="text-xs font-extrabold text-slate-500">Badges earned</div>
          <div className="mt-1 text-2xl font-black text-slate-900">{badges.length}</div>
          <div className="mt-1 text-xs font-semibold text-slate-600">Rewards unlocked</div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-3xl border border-slate-200 bg-white/75 p-4 shadow-soft">
          <div className="text-sm font-black text-slate-900">Progress by subject</div>
          <div className="text-xs font-semibold text-slate-600">Completed lessons and mastery</div>

          {loading ? (
            <div className="mt-3 text-sm font-semibold text-slate-600">Loading…</div>
          ) : summary.length === 0 ? (
            <div className="mt-3 text-sm font-semibold text-slate-600">No progress yet.</div>
          ) : (
            <div className="mt-3 space-y-2">
              {summary.map((s) => (
                <div
                  key={s.subject_id}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 border border-slate-200 px-3 py-2"
                >
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
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white/75 p-4 shadow-soft">
          <div className="text-sm font-black text-slate-900">Badges</div>
          <div className="text-xs font-semibold text-slate-600">What they’ve earned so far</div>

          {loading ? (
            <div className="mt-3 text-sm font-semibold text-slate-600">Loading…</div>
          ) : badges.length === 0 ? (
            <div className="mt-3 text-sm font-semibold text-slate-600">No badges earned yet.</div>
          ) : (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {badges.slice(0, 8).map((b) => (
                <div key={b.id} className="rounded-2xl bg-white border border-slate-200 p-3">
                  <div className="text-sm font-extrabold text-slate-900">{b.name}</div>
                  <div className="text-xs font-semibold text-slate-600">{b.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
