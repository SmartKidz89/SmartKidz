MATH) to ensure database queries work correctly">
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Page as PageScaffold, BentoGrid, BentoCard } from "@/components/ui/PageScaffold";

// Map URL slugs (from data/worlds.js) to Database Subject IDs
const SUBJECT_MAP = {
  math: "MATH",
  maths: "MATH",
  reading: "ENG",
  english: "ENG",
  science: "SCI",
  hass: "HASS",
  hpe: "HPE",
  arts: "ARTS",
  tech: "TECH",
  technologies: "TECH",
  lang: "LANG",
  languages: "LANG"
};

export default function SubjectLessonsPage() {
  const params = useParams();
  const rawId = decodeURIComponent(params?.worldId || "").toLowerCase();
  // Use the mapped ID if available, otherwise fall back to the raw ID (e.g. for exact matches)
  const worldId = SUBJECT_MAP[rawId] || (rawId.toUpperCase());

  const [subject, setSubject] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError("");

      // 1. Fetch Subject Details
      const { data: subjectData, error: subjectError } = await supabase
        .from("subjects")
        .select("id,name")
        .eq("id", worldId)
        .maybeSingle();

      if (!mounted) return;

      if (subjectError) {
        console.error("Subject load error:", subjectError);
        setError("Could not load subject details.");
      } else {
        setSubject(subjectData || { name: rawId.charAt(0).toUpperCase() + rawId.slice(1) });
      }

      // 2. Fetch Lessons
      // We perform this even if subject lookup fails, in case the ID is valid for lessons but missing in subjects table
      const { data: lessonData, error: lessonError } = await supabase
        .from("lessons")
        .select("id,title,year_level,topic,subject_id")
        .eq("subject_id", worldId)
        .order("year_level", { ascending: true })
        .order("title", { ascending: true });

      if (!mounted) return;

      if (lessonError) {
        console.error("Lesson load error:", lessonError);
        setError("Could not load lessons.");
        setLessons([]);
      } else {
        setLessons(Array.isArray(lessonData) ? lessonData : []);
      }

      setLoading(false);
    }

    if (worldId) load();
    else {
      setLoading(false);
      setError("Missing subject ID.");
    }

    return () => {
      mounted = false;
    };
  }, [worldId, rawId]);

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
          No lessons found for {subject?.name || worldId}.
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