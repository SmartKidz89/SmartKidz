"use client";

import { useEffect, useState } from "react";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { useActiveChild } from "@/hooks/useActiveChild";
import { supabase } from "@/lib/supabase/client";

function formatDate(d) {
  try { return new Date(d).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }); }
  catch { return ""; }
}

export default function ParentReflectionsPage() {
  const { activeChild } = useActiveChild();
  const childId = activeChild?.id;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      setErr("");
      setLoading(true);
      if (!childId) { setItems([]); setLoading(false); return; }
      const { data, error } = await supabase
        .from("child_reflections")
        .select("id, mood, easy, tricky, proud, created_at")
        .eq("child_id", childId)
        .order("created_at", { ascending: false })
        .limit(60);
      if (!mounted) return;
      if (error) { setErr(error.message); setItems([]); setLoading(false); return; }
      setItems(data || []);
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, [childId]);

  return (
    <PageMotion className="max-w-6xl mx-auto space-y-6">
      <div className="skz-glass p-6 md:p-8 skz-border-animate skz-shine">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-sm text-slate-500">Family hub</div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Reflections</h1>
            <div className="mt-2 text-sm text-slate-700">
              A calm window into confidence and learning feelings — private to this child.
            </div>
          </div>
          <button className="skz-chip px-4 py-3 skz-press" onClick={() => history.back()}>Back</button>
        </div>
      </div>

      {err ? (
        <div className="skz-card p-5 text-rose-700">
          <div className="font-semibold">Couldn’t load reflections</div>
          <div className="mt-2 text-sm">{err}</div>
        </div>
      ) : null}

      <div className="skz-card p-6">
        <div className="text-sm font-semibold">
          {activeChild?.display_name || "Child"} · Reflections
        </div>
        <div className="mt-4 space-y-3">
          {loading ? (
            <div className="text-sm text-slate-600">Loading…</div>
          ) : items.length ? (
            items.map((it) => (
              <div key={it.id} className="skz-glass p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-sm font-semibold">Mood: {it.mood}</div>
                  <div className="text-xs text-slate-500">{formatDate(it.created_at)}</div>
                </div>
                <div className="mt-2 text-sm text-slate-700 space-y-1">
                  {it.easy ? <div><span className="text-slate-500">Easy:</span> {it.easy}</div> : null}
                  {it.tricky ? <div><span className="text-slate-500">Tricky:</span> {it.tricky}</div> : null}
                  {it.proud ? <div><span className="text-slate-500">Proud:</span> {it.proud}</div> : null}
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-slate-600">No reflections yet.</div>
          )}
        </div>
      </div>
    </PageMotion>
  );
}
