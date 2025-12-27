"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Page as PageScaffold } from "@/components/ui/PageScaffold";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Star, Play, Globe } from "lucide-react";

// Robust mapping of URL slugs -> DB Subject IDs
const SUBJECT_MAP = {
  // Core
  math: "MATH",
  maths: "MATH",
  mathematics: "MATH",
  reading: "ENG",
  english: "ENG",
  literacy: "ENG",
  science: "SCI",
  
  // HASS
  hass: "HASS",
  history: "HASS", 
  geography: "HASS",
  
  // HPE
  hpe: "HPE",
  health: "HPE",
  pe: "HPE",
  
  // Arts (DB uses 'ART' in scripts, though 'ARTS' is common in labels)
  arts: "ART",
  art: "ART",
  thearts: "ART",
  
  // Tech
  tech: "TECH",
  technologies: "TECH",
  technology: "TECH",
  
  // Languages (Aggregate)
  lang: "LANG",
  languages: "LANG",
  lote: "LANG",
  
  // Specific Languages
  auslan: "AUS",
  indonesian: "IND",
  japanese: "JPN",
  chinese: "ZHO",
  mandarin: "ZHO",
  french: "FRA",
  spanish: "SPA",
  aboriginal: "ABL",
  aboriginallanguages: "ABL"
};

// Codes included in the "Languages" world view
const LANGUAGE_CODES = ["LANG", "AUS", "IND", "JPN", "ZHO", "FRA", "SPA", "ABL"];

const SUBJECT_LABELS = {
  MATH: "Mathematics",
  ENG: "English",
  SCI: "Science",
  HASS: "HASS",
  HPE: "Health & PE",
  ART: "The Arts",
  ARTS: "The Arts",
  TECH: "Technologies",
  LANG: "Languages",
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
        // 1. Determine Display Name
        if (mounted) {
          if (isLanguageWorld) {
            setSubjectName("Languages World");
          } else {
            // Try to fetch name, fallback to label map
            const { data } = await supabase.from("subjects").select("name").eq("id", worldId).maybeSingle();
            setSubjectName(data?.name || SUBJECT_LABELS[worldId] || worldId);
          }
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

  // Group lessons logic
  const groups = useMemo(() => {
    if (!lessons.length) return [];
    
    // For single subject worlds, put everything in one 'Lessons' group
    if (!isLanguageWorld) {
      return [{ id: worldId, title: "Lessons", lessons }];
    }

    // For Languages world, group by subject_id
    const grouped = {};
    for (const l of lessons) {
      const sid = l.subject_id || "LANG";
      if (!grouped[sid]) grouped[sid] = [];
      grouped[sid].push(l);
    }

    // Sort: Specific languages A-Z, generic LANG last or first? 
    // Let's sort by label.
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
      subtitle={isLanguageWorld ? "Explore languages, culture, and communication." : "Choose a mission to start learning."}
    >
      <div className="mb-8">
        <Link 
          href="/app/worlds" 
          className="inline-flex items-center gap-2 rounded-2xl bg-white/50 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-white hover:text-slate-900 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Worlds
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-40 rounded-3xl bg-white/40 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="p-6 rounded-3xl bg-rose-50 border border-rose-100 text-rose-800 font-semibold">
          {error}
        </div>
      ) : lessons.length === 0 ? (
        <div className="p-10 rounded-3xl bg-white/60 border border-white/50 text-center">
          <div className="text-4xl mb-3">📭</div>
          <div className="text-slate-900 font-bold text-lg">No lessons found</div>
          <div className="text-slate-600">Check back later for new content in this world.</div>
        </div>
      ) : (
        <div className="space-y-12">
          {groups.map((group) => (
            <section key={group.id} className="space-y-5">
              {/* Group Header (only if we have multiple groups or it's language world) */}
              {(isLanguageWorld || groups.length > 1) && (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm text-xl">
                    {group.id === "AUS" ? "👐" : 
                     group.id === "FRA" ? "🇫🇷" : 
                     group.id === "JPN" ? "🇯🇵" : 
                     group.id === "ZHO" ? "🇨🇳" : 
                     group.id === "SPA" ? "🇪🇸" : 
                     group.id === "IND" ? "🇮🇩" : 
                     group.id === "ABL" ? "🖤" : "🗣️"}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">{group.title}</h2>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {group.lessons.length} Lesson{group.lessons.length === 1 ? "" : "s"}
                    </div>
                  </div>
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
    <Link href={`/app/lesson/${encodeURIComponent(lesson.id)}`} className="group block h-full">
      <motion.div 
        whileHover={{ y: -4, scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="relative h-full flex flex-col overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-5 shadow-sm transition-all hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] hover:border-brand-primary/40 hover:bg-white"
      >
        {/* Top: Metadata */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <span className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-slate-500">
            Year {lesson.year_level}
          </span>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="w-3.5 h-3.5 fill-current" />
          </div>
        </div>

        {/* Middle: Title */}
        <div className="flex-1">
          <h3 className="text-lg font-extrabold text-slate-900 leading-snug group-hover:text-brand-secondary transition-colors">
            {lesson.title}
          </h3>
          {lesson.topic && (
            <p className="mt-1 text-sm font-medium text-slate-500 line-clamp-2">
              {lesson.topic}
            </p>
          )}
        </div>

        {/* Bottom: Rewards */}
        <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 group-hover:text-brand-primary transition-colors">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Open</span>
          </div>
          <div className="ml-auto flex items-center gap-1 text-xs font-black text-amber-400">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>+12</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}