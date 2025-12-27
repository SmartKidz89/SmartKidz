"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Page as PageScaffold } from "@/components/ui/PageScaffold";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Star, Play } from "lucide-react";

// Subject ID Aliases
// We query for *all* of these to be safe against inconsistent DB seeding
const SUBJECT_ALIASES = {
  MATH: ["MATH", "MAT", "MATHS"],
  ENG: ["ENG", "ENGLISH"],
  SCI: ["SCI", "SCIENCE"],
  HASS: ["HASS", "HUMANITIES", "HIST", "GEO"],
  HPE: ["HPE", "HEALTH", "PE"],
  ART: ["ART", "ARTS", "THEARTS", "MUS", "DRAMA"],
  TECH: ["TECH", "TECHNOLOGIES", "CODE"],
  LANG: ["LANG", "LOTE", "AUS", "IND", "JPN", "ZHO", "FRA", "SPA", "ABL"]
};

// Map URL slugs to Canonical Category Keys
const SLUG_MAP = {
  math: "MATH", maths: "MATH", mathematics: "MATH",
  reading: "ENG", english: "ENG", literacy: "ENG",
  science: "SCI",
  hass: "HASS", history: "HASS", geography: "HASS",
  hpe: "HPE", health: "HPE", pe: "HPE",
  arts: "ART", art: "ART", thearts: "ART",
  tech: "TECH", technologies: "TECH", technology: "TECH",
  lang: "LANG", languages: "LANG", lote: "LANG",
};

const SUBJECT_LABELS = {
  MATH: "Mathematics",
  ENG: "English",
  SCI: "Science",
  HASS: "HASS",
  HPE: "Health & PE",
  ART: "The Arts",
  TECH: "Technologies",
  LANG: "Languages",
};

const SUBJECT_IMAGES = {
  MATH: "/illustrations/subjects/world-maths.webp",
  ENG: "/illustrations/subjects/world-english.webp",
  SCI: "/illustrations/subjects/world-science.webp",
  HASS: "/illustrations/subjects/world-energy.webp",
  HPE: "/illustrations/subjects/world-health.webp",
  ART: "/illustrations/subjects/world-arts.webp",
  TECH: "/illustrations/subjects/world-energy.webp",
  LANG: "/illustrations/subjects/world-languages.webp",
};

export default function SubjectLessonsPage() {
  const params = useParams();
  const rawId = decodeURIComponent(params?.worldId || "").toLowerCase();
  
  // 1. Resolve URL slug to a canonical key (e.g. "maths" -> "MATH")
  // If not found in map, use uppercase raw slug as fallback key.
  const canonicalId = SLUG_MAP[rawId] || rawId.toUpperCase();
  
  // 2. Resolve target DB IDs (e.g. "MATH" -> ["MATH", "MAT"])
  // If no alias list exists, default to just the canonical ID.
  const targetIds = SUBJECT_ALIASES[canonicalId] || [canonicalId];

  const [subjectName, setSubjectName] = useState(SUBJECT_LABELS[canonicalId] || canonicalId);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        // Try to fetch real name from DB if possible, otherwise keep default
        // We just grab the first matching subject row to get a nice name
        const { data: subData } = await supabase
          .from("subjects")
          .select("name")
          .in("id", targetIds)
          .limit(1)
          .maybeSingle();
        
        if (mounted && subData?.name) {
          setSubjectName(subData.name);
        }

        // Fetch lessons matching ANY of the target IDs
        const { data: lessonData, error: lessonError } = await supabase
          .from("lessons")
          .select("id,title,year_level,topic,subject_id,curriculum_tags")
          .in("subject_id", targetIds)
          .order("year_level", { ascending: true })
          .order("title", { ascending: true });

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

    if (canonicalId) load();
    else {
      setLoading(false);
      setError("Unknown world.");
    }

    return () => { mounted = false; };
  }, [canonicalId, targetIds]);

  const groups = useMemo(() => {
    if (!lessons.length) return [];
    
    // For Languages, we might want to group by specific language code if mixed
    if (canonicalId === "LANG") {
      const grouped = {};
      for (const l of lessons) {
        const sid = l.subject_id;
        if (!grouped[sid]) grouped[sid] = [];
        grouped[sid].push(l);
      }
      return Object.keys(grouped)
        .sort()
        .map(sid => ({
          id: sid,
          title: sid === "LANG" ? "General Languages" : (SUBJECT_LABELS[sid] || sid),
          lessons: grouped[sid]
        }));
    }

    // Default: Group by Topic or just flat list
    // Let's group by Year Level for better navigation
    const byYear = {};
    for (const l of lessons) {
      const y = l.year_level || "General";
      if (!byYear[y]) byYear[y] = [];
      byYear[y].push(l);
    }

    return Object.keys(byYear)
      .sort((a,b) => {
        // numeric sort if possible
        const na = Number(a), nb = Number(b);
        if (!isNaN(na) && !isNaN(nb)) return na - nb;
        return a.localeCompare(b);
      })
      .map(y => ({
        id: y,
        title: y === "General" ? "General" : `Year ${y}`,
        lessons: byYear[y]
      }));

  }, [lessons, canonicalId]);

  const heroImage = SUBJECT_IMAGES[canonicalId] || SUBJECT_IMAGES.MATH;
  const subtitle = "Choose a lesson to start your adventure.";

  return (
    <PageScaffold title={null}>
      <div className="mb-6">
        <Link 
          href="/app/worlds" 
          className="inline-flex items-center gap-2 rounded-2xl bg-white/50 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-white hover:text-slate-900 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Worlds
        </Link>
      </div>

      <div className="relative mb-10 overflow-hidden rounded-4xl bg-white/60 border border-white/60 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
          <div className="relative h-28 w-28 shrink-0 rounded-3xl bg-white shadow-md overflow-hidden ring-4 ring-white/50">
            <Image 
              src={heroImage} 
              alt={subjectName || "Subject"} 
              fill 
              className="object-cover scale-110"
              priority 
            />
          </div>
          <div>
            <div className="text-xs font-extrabold tracking-wide text-slate-500 uppercase mb-1">World</div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              {subjectName || "Loading..."}
            </h1>
            <p className="mt-2 text-lg text-slate-600 font-medium max-w-2xl">
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-40 rounded-3xl bg-white/40 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 rounded-3xl bg-rose-50 border border-rose-100 text-rose-800 font-semibold text-center">
          {error}
        </div>
      ) : lessons.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white/60 border border-white/50 text-center">
          <div className="text-5xl mb-4 opacity-80">🗺️</div>
          <div className="text-slate-900 font-black text-xl">No lessons found</div>
          <div className="text-slate-600 mt-2 max-w-md mx-auto">
            We couldn't find any lessons for <strong>{canonicalId}</strong> (IDs checked: {targetIds.join(", ")}).
            <br/><br/>
            <span className="text-xs opacity-75">Tip for developers: Check your database <code>lessons</code> table to ensure <code>subject_id</code> matches one of these codes.</span>
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          {groups.map((group) => (
            <section key={group.id} className="space-y-5">
              {/* Group Header */}
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-xl font-black text-slate-900">{group.title}</h2>
                  <div className="h-1 w-12 bg-brand-primary rounded-full mt-1.5" />
                </div>
              </div>
              
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
        className="relative h-full flex flex-col overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-5 shadow-sm transition-all hover:shadow-[0_15px_30px_rgba(0,0,0,0.08)] hover:border-brand-primary/40 hover:bg-white"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-slate-500 group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-colors">
            Year {lesson.year_level}
          </span>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-300 group-hover:bg-brand-primary group-hover:text-white transition-all">
            <Play className="w-3.5 h-3.5 fill-current" />
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-extrabold text-slate-900 leading-snug group-hover:text-brand-secondary transition-colors">
            {lesson.title}
          </h3>
          {lesson.topic && (
            <p className="mt-1.5 text-sm font-medium text-slate-500 line-clamp-2">
              {lesson.topic}
            </p>
          )}
        </div>

        <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-3 opacity-80 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 group-hover:text-brand-primary transition-colors">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Start</span>
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