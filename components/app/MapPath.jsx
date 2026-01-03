"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { useActiveChild } from "@/hooks/useActiveChild";

function subjectFromWorld(world) {
  const w = (world || "").toLowerCase();
  if (w === "reading") return "reading";
  if (w === "science") return "science";
  if (w === "energy") return "energy";
  // accept /math, /maths, or anything else as maths
  return "maths";
}

function getSelectedYear(childId, fallbackYearLevel) {
  if (typeof window === "undefined") return fallbackYearLevel ?? 1;
  if (!childId) return fallbackYearLevel ?? 1;
  const raw = localStorage.getItem(`sk_year_${childId}`);
  if (!raw) return fallbackYearLevel ?? 1;
  if (raw === "prep") return 0;
  const n = Number(raw);
  return Number.isFinite(n) ? n : (fallbackYearLevel ?? 1);
}

export default function MapPath({ world = "maths", title = "Math World" }) {
  const supabase = getSupabaseClient();
  const { activeChildId, activeChild, loading: childLoading } = useActiveChild();

  const subject = useMemo(() => subjectFromWorld(world), [world]);

  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      if (childLoading) return;
      if (!supabase) return;
      if (!activeChildId) {
        setLoading(false);
        setNodes([]);
        return;
      }

      setLoading(true);
      setError(null);

      const yearLevel = getSelectedYear(activeChildId, activeChild?.year_level);

      const { data: catalog, error: cErr } = await supabase
        .from("lesson_catalog")
        .select("id,title,topic,subject_id,year_level,updated_at")
        .eq("subject_id", subject)
        .eq("year_level", yearLevel)
        .order("id", { ascending: true });

      if (!alive) return;

      if (cErr) {
        setError(cErr.message || "Could not load lessons for this world.");
        setNodes([]);
        setLoading(false);
        return;
      }

      const lessonIds = (catalog || []).map((l) => l.id);

      let progressByLesson = {};
      if (lessonIds.length) {
        const { data: prog } = await supabase
          .from("lesson_progress")
          .select("lesson_id,status,mastery_score")
          .eq("child_id", activeChildId)
          .in("lesson_id", lessonIds);

        (prog || []).forEach((p) => {
          progressByLesson[p.lesson_id] = p;
        });
      }

      const merged = (catalog || []).map((l) => {
        const p = progressByLesson[l.id];
        return {
          id: l.id,
          title: l.title || l.topic || `Lesson ${l.id}`,
          status: p?.status || "not_started",
          mastery_score: p?.mastery_score ?? 0,
          locked: false, // unlocked flow
        };
      });

      setNodes(merged);
      setLoading(false);
    }

    load();
    return () => {
      alive = false
    }
  }, [supabase, activeChildId, activeChild?.year_level, childLoading, subject]);

  if (childLoading) return <div className="p-6">Loading…</div>;

  if (!activeChildId) {
    return (
      <div className="p-6">
        <div className="rounded-3xl bg-white/80 ring-1 ring-slate-200 p-5">
          <div className="text-lg font-extrabold text-slate-900">Pick a child to start</div>
          <div className="mt-1 text-sm text-slate-600">Go back to the parent dashboard and select a child.</div>
          <Link href="/app/parent" className="mt-4 inline-flex rounded-2xl bg-brand-primary px-4 py-2 text-white font-bold">
            Back to Parent Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-2xl font-black text-slate-900">{title}</div>
            <div className="text-sm text-slate-600">Choose any lesson to start learning.</div>
          </div>
          <Link href="/app/world" className="text-sm font-semibold text-brand-primary hover:underline">
            All Worlds
          </Link>
        </div>

        {error ? (
          <div className="mt-6 rounded-3xl bg-white/80 ring-1 ring-rose-200 p-5 text-rose-700">{error}</div>
        ) : null}

        {loading ? (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-28 rounded-3xl bg-white/70 ring-1 ring-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {nodes.map((n) => {
              const done = n.status === "completed";
              return (
                <Link
                  key={n.id}
                  href={`/app/lesson/${encodeURIComponent(n.id)}`}
                  className="group rounded-3xl bg-white/85 ring-1 ring-slate-200 p-4 hover:-translate-y-0.5 hover:shadow-lg transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-base font-extrabold text-slate-900 truncate">{n.title}</div>
                      <div className="mt-1 text-xs text-slate-600">
                        {done ? "Completed" : n.status === "in_progress" ? "In progress" : "Not started"}
                      </div>
                    </div>
                    <div className={`h-10 w-10 rounded-2xl grid place-items-center font-black ${
                      done ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"
                    }`}>
                      {done ? "✓" : "▶"}
                    </div>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-brand-mint"
                      style={{ width: `${Math.max(0, Math.min(100, (Number(n.mastery_score) || 0) * 100))}%` }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
