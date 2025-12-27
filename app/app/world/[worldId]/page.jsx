"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Page as PageScaffold } from "@/components/ui/PageScaffold";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Star, Play } from "lucide-react";

// Map URL slugs to Database Subject IDs
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

// Language subjects to aggregate under "LANG"
const LANGUAGE_CODES = ["LANG", "AUS", "IND", "JPN", "ZHO", "FRA", "SPA", "ABL"];

const SUBJECT_LABELS = {
  MATH: "Mathematics",
  ENG: "English",
  SCI: "Science",
  HASS: "HASS",
  HPE: "Health & PE",
  ARTS: "The Arts",
  TECH: "Technologies",
  LANG: "General Languages",
  AUS: "Auslan",
  IND: "Indonesian",
  JPN: "Japanese",
  ZHO: "Chinese (Mandarin)",
  FRA: "French",
  SPA: "Spanish",
  ABL: "Aboriginal Languages"
};

export default function SubjectLessonsPage() {
  const params = useParams();
  const rawId = decodeURIComponent(params?.worldId || "").toLowerCase();
  const worldId = SUBJECT_MAP[rawId] || (rawId.toUpperCase());
  const isLanguageWorld = worldId === "LANG";

  const [subjectName, setSubjectName] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        // 1. Fetch Subject Name (if single subject)
        if (!isLanguageWorld) {
          const { data: subjectData } = await supabase
            .from("subjects")
            .select("name")
            .eq("id", worldId)
            .maybeSingle();
          if (mounted) {
            setSubjectName(subjectData?.name || SUBJECT_LABELS[worldId] || worldId);
          }
        } else {
          if (mounted) setSubjectName("Languages");
        }

        // 2. Fetch Lessons
        let query = supabase
          .from("lessons")
          .select("id,title,year_level,topic,subject_id,curriculum_tags")
          .order("year_level", { ascending: true })
          .order("title", { ascending: true });

        if (isLanguageWorld) {
          query = query.in("subject_id", LANGUAGE_CODES);
        } else {
          query = query.eq("subject_id", worldId);
        }

        const { data: lessonData, error: lessonError } = await query;

        if (mounted) {
          if (lessonError) throw lessonError;
          setLessons(Array.isArray(lessonData) ? lessonData : []);
        }
      } catch (err) {
        if (mounted) {
          console.error("Load error:", err);
          setError("Could not load lessons.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (worldId) load();
    else {
      setLoading(false);
      setError("Unknown world.");
    }

    return () => { mounted = false; };
  }, [worldId, isLanguageWorld]);

  // Group lessons if we are in the Languages world
  const groups = useMemo(() => {
    if (!lessons.length) return [];
    
    // For single subject worlds, put everything in one group
    if (!isLanguageWorld) {
      return [{ id: worldId, title: "Lessons", lessons }];
    }

    // For Languages, group by subject_id
    const grouped = {};
    for (const l of lessons) {
      const sid = l.subject_id || "LANG";
      if (!grouped[sid]) grouped[sid] = [];
      grouped[sid].push(l);
    }

    // Sort groups based on our LANGUAGE_CODES order or alphabetical
    return Object.keys(grouped)
      .sort((a, b) => (SUBJECT_LABELS[a] || a).localeCompare(SUBJECT_LABELS[b] || b))
      .map(sid => ({
        id: sid,
        title: SUBJECT_LABELS[sid] || sid,
        lessons: grouped[sid]
      }));
  }, [lessons, isLanguageWorld, worldId]);

  return (
    <PageScaffold
      title={subjectName || "Loading..."}
      subtitle={isLanguageWorld ? "Explore languages from around the world." : "Choose a mission to start learning."}
    >
      <div className="mb-6">
        <Link 
          href="/app/worlds" 
          className="inline-flex items-center gap-2 rounded-2xl bg-white/50 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-white hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Worlds
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-32 rounded-3xl bg-white/40 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="p-6 rounded-3xl bg-rose-50 border border-rose-100 text-rose-800 font-semibold">
          {error}
        </div>
      ) : lessons.length === 0 ? (
        <div className="p-8 rounded-3xl bg-white/60 text-center text-slate-600 font-medium">
          No lessons found for this world yet. Check back soon!
        </div>
      ) : (
        <div className="space-y-10">
          {groups.map((group) => (
            <section key={group.id} className="space-y-4">
              {isLanguageWorld && (
                <div className="flex items-center gap-3 px-2">
                  <div className="h-8 w-1 rounded-full bg-brand-primary" />
                  <h2 className="text-xl font-black text-slate-900">{group.title}</h2>
                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                    {group.lessons.length}
                  </span>
                </div>
              )}
              
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {group.lessons.map((l) => (
                  <LessonCard key={l.id} lesson={l} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </PageScaffold>
  );
}

function LessonCard({ lesson }) {
  return (
    <Link href={`/app/lesson/${encodeURIComponent(lesson.id)}`} className="group block">
      <motion.div 
        whileHover={{ y: -4, scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="relative h-full overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-5 shadow-sm transition-all hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] hover:border-brand-primary/30"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-extrabold text-slate-500 mb-1">
              <span className="bg-slate-100 px-2 py-0.5 rounded-full">
                Year {lesson.year_level}
              </span>
              {lesson.topic && <span>• {lesson.topic}</span>}
            </div>
            <h3 className="text-base font-extrabold text-slate-900 leading-snug group-hover:text-brand-secondary transition-colors">
              {lesson.title}
            </h3>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-400 group-hover:bg-brand-primary group-hover:text-white transition-colors">
            <Play className="w-4 h-4 ml-0.5 fill-current" />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-500">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Lesson</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>+12 XP</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}