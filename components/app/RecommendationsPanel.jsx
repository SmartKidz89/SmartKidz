"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useActiveChild } from "@/hooks/useActiveChild";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { Pill } from "@/components/ui/Pill";
import { Button } from "@/components/ui/Button";
import { Sparkles, ArrowRight } from "lucide-react";

export default function RecommendationsPanel() {
  const { activeChild } = useActiveChild();
  const [rec, setRec] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!activeChild?.id) return;
      setLoading(true);
      
      const supabase = getSupabaseClient();
      
      try {
        // 1. Get completed lessons for this child
        const { data: progress } = await supabase
          .from("lesson_progress")
          .select("edition_id,title,country_code,lesson_templates!inner(subject_id,year_level,topic)")
          .eq("child_id", activeChild.id)
          .eq("status", "completed");
          
        const completedIds = (progress || []).map(p => p.lesson_id);

        // 2. Find next available lesson in their year level
        // (Ordering by ID as a proxy for sequence)
        let query = supabase
          .from("lesson_editions")
          .select("id, title, topic, subject_id, year_level")
          .eq("lesson_templates.year_level", activeChild.year_level)
          .order("edition_id", { ascending: true })
          .limit(10);
        
        // Exclude completed if not empty
        if (completedIds.length > 0) {
           query = query.not("id", "in", `(${completedIds.join(',')})`);
        }

        const { data: lessons, error } = await query;
        
        if (mounted) {
           if (lessons && lessons.length > 0) {
             const l = lessons[0];
             setRec({
                lesson_id: l.id,
                title: l.title,
                topic: l.topic,
                reason: "Next in your year level"
             });
           } else {
             setRec(null);
           }
           setLoading(false);
        }
      } catch (e) {
        console.error("Rec load failed", e);
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [activeChild?.id, activeChild?.year_level]);

  if (!activeChild) {
    return <div className="text-sm opacity-80 p-4">Select a child profile to get personalised recommendations.</div>;
  }

  if (loading) {
    return (
      <div className="p-6 space-y-3 animate-pulse">
        <div className="h-4 w-24 bg-slate-200 rounded-full" />
        <div className="h-6 w-3/4 bg-slate-200 rounded-lg" />
        <div className="h-10 w-32 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  if (!rec) {
    return (
      <div className="p-6 text-center">
        <div className="text-lg font-bold text-slate-800">All caught up!</div>
        <p className="text-slate-600 text-sm mt-1 mb-4">You have completed all recommended lessons.</p>
        <Link href="/app/worlds">
          <Button variant="secondary" className="w-full">Browse Worlds</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Pill className="bg-indigo-100 text-indigo-700">
          <Sparkles className="w-3 h-3 mr-1 inline" /> Next up
        </Pill>
        <Pill tone="muted" className="bg-slate-100 text-slate-600">
          {rec.topic || "General"}
        </Pill>
      </div>

      <div>
        <div className="text-xl font-extrabold text-slate-900 leading-tight">
          {rec.title}
        </div>
        <div className="text-sm font-medium text-slate-500 mt-1">
          {rec.reason}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Link href={`/app/lesson/${encodeURIComponent(rec.lesson_id)}`} className="flex-1">
          <Button className="w-full shadow-lg hover:scale-105 transition-transform">
            Start Lesson <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
}