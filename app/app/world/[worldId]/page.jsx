"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Page as PageScaffold, BentoGrid, BentoCard } from "@/components/ui/PageScaffold";

export default function SubjectLessonsPage() {
  const params = useParams();
  const worldId = decodeURIComponent(params?.worldId || "");

  const [subject, setSubject] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError("");

      // Query lessons table with correct schema columns: year_level, topic, etc.
      // Removed 'status' and 'order_index' filters/sorts as they don't exist in the current schema.
      const [{ data: subjectData, error: subjectError }, { data: lessonData, error: lessonError }] =
        await Promise.all([
          supabase.from("subjects").select("id,name").eq("id", worldId).maybeSingle(),
          supabase
            .from("lessons")
            .select("id,title,year_level,topic,subject_id")
            .eq("subject_id", worldId)
            .order("year_level", { ascending: true })
            .order("title", { ascending: true }),
        ]);

      if (!mounted) return;

      if (subjectError) {
        setError(subjectError.message || "Failed to load subject.");
        setSubject(null);
      } else {
        setSubject(subjectData || null);
      }

      if (lessonError) {
        setError((prev) => prev || lessonError.message || "Failed to load lessons.");
        setLessons([]);
      } else {
        setLessons(Array.isArray(lessonData) ? lessonData : []);
      }

      setLoading(false);
    }

    if (worldId) load();
    else {
      setLoading(false);
      setError("Missing subject id.");
    }

    return () => {
      mounted = false;
    };
  }, [worldId]);

  return (
    <PageScaffold
      title={subject?.name || "Lessons"}
      subtitle="Select a lesson to begin."
    >
      <div className="mb-4">
        <Link href="/app/worlds" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to subjects
        </Link>
      </div>

      {loading ? (
        <div className="p-6 text-sm text-muted-foreground">Loading lessons…</div>
      ) : error ? (
        <div className="p-6 text-sm text-red-600">{error}</div>
      ) : lessons.length === 0 ? (
        <div className="p-6 text-sm text-muted-foreground">
          No lessons found for this subject.
        </div>
      ) : (
        <BentoGrid className="mt-2">
          {lessons.map((l) => (
            <BentoCard key={l.id} className="col-span-12 md:col-span-6 lg:col-span-4">
              <Link
                href={`/app/lesson/${encodeURIComponent(l.id)}`}
                className="group flex h-full w-full flex-col gap-2 rounded-2xl p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="text-base font-semibold leading-snug">{l.title}</div>
                  <div className="text-xs text-muted-foreground group-hover:text-foreground">
                    Open
                  </div>
                </div>

                <div className="mt-1 text-xs text-muted-foreground">
                  {l.year_level ? `Year ${l.year_level}` : "Lesson"}
                  {l.topic ? ` • ${l.topic}` : ""}
                </div>

                <div className="flex-1" />

                <div className="text-xs text-muted-foreground">View lesson content</div>
              </Link>
            </BentoCard>
          ))}
        </BentoGrid>
      )}
    </PageScaffold>
  );
}