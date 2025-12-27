"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Page as PageScaffold } from "@/components/ui/PageScaffold";
import { motion } from "framer-motion";
import { ArrowLeft, Languages as LanguagesIcon, ChevronRight, Zap, Play } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Configuration ---

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
  MATH: "Mathematics", ENG: "English", SCI: "Science",
  HASS: "HASS", HPE: "Health & PE", ART: "The Arts",
  TECH: "Technologies", LANG: "Languages",
};

const SUBJECT_IMAGES = {
  MATH: "/illustrations/subjects/world-maths.webp",
  ENG: "/illustrations/subjects/world-english.webp",
  SCI: "/illustrations/subjects/world-science.webp",
  HASS: "/illustrations/subjects/world-energy.webp",
  HPE: "/illustrations/subjects/world-health.webp",
  ART: "/illustrations/subjects/world-arts.webp",
  TECH: "/illustrations/subjects/world-energy.webp",
  LANG: "/illustrations/subjects/world-languages.webp"
};

const LANGUAGE_TILES = [
  { id: "AUS", title: "Auslan", flag: "👐", color: "bg-teal-500", desc: "Australian Sign Language" },
  { id: "FRA", title: "French", flag: "🇫🇷", color: "bg-blue-600", desc: "Bonjour!" },
  { id: "JPN", title: "Japanese", flag: "🇯🇵", color: "bg-rose-500", desc: "Konnichiwa!" },
  { id: "ZHO", title: "Chinese", flag: "🇨🇳", color: "bg-red-600", desc: "Ni Hao!" },
  { id: "IND", title: "Indonesian", flag: "🇮🇩", color: "bg-red-500", desc: "Apa Kabar?" },
  { id: "SPA", title: "Spanish", flag: "🇪🇸", color: "bg-amber-500", desc: "Hola!" },
  { id: "ABL", title: "First Nations", flag: "🌏", color: "bg-orange-600", desc: "Local Languages" },
];

const LEVELS = {
  Beginning: { label: "Beginner", color: "bg-emerald-100 text-emerald-700", icon: "🌱" },
  Intermediate: { label: "Intermediate", color: "bg-sky-100 text-sky-700", icon: "🚀" },
  Advanced: { label: "Advanced", color: "bg-purple-100 text-purple-700", icon: "🔥" },
  Default: { label: "Practice", color: "bg-slate-100 text-slate-700", icon: "⭐" }
};

function getDifficulty(title) {
  if (/beginning|beginner/i.test(title)) return LEVELS.Beginning;
  if (/intermediate|medium/i.test(title)) return LEVELS.Intermediate;
  if (/advanced|challenge|hard/i.test(title)) return LEVELS.Advanced;
  return LEVELS.Default;
}

export default function SubjectLessonsPage() {
  const params = useParams();
  const rawId = decodeURIComponent(params?.worldId || "").toLowerCase();
  const rawIdUpper = rawId.toUpperCase();
  
  // 1. Check if it's a known Lang code from our tile list
  const isLangCode = LANGUAGE_TILES.some(l => l.id === rawIdUpper);
  
  // 2. Resolve Canonical ID
  // If it's a known slug (math -> MATH), use that.
  // If it's a Lang Code (AUS), treat as LANG_SPECIFIC.
  // Otherwise, treat as an arbitrary subject ID (e.g. ABL).
  let canonicalId = SLUG_MAP[rawId];
  if (!canonicalId) {
      if (isLangCode) canonicalId = "LANG_SPECIFIC";
      else canonicalId = rawIdUpper; // Fallback to passing ID directly
  }

  // 3. Build Target IDs for Query
  // If we found a canonical alias list (e.g. MATH -> [MATH, MAT]), use it.
  // If it's LANG_SPECIFIC, just query that ID.
  // If it's arbitrary (ABL), just query that ID.
  const targetIds = (canonicalId === "LANG_SPECIFIC" || !SUBJECT_ALIASES[canonicalId])
    ? [rawIdUpper] 
    : SUBJECT_ALIASES[canonicalId];

  const [subjectName, setSubjectName] = useState(SUBJECT_LABELS[canonicalId] || rawIdUpper);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        if (canonicalId === "LANG") { 
          // Handled by render logic below (Language Hub)
          setLoading(false); 
          return; 
        }

        const { data: lessonData, error: lessonError } = await supabase
          .from("lessons")
          .select("id,title,year_level,topic,subject_id")
          .in("subject_id", targetIds)
          .order("year_level", { ascending: true })
          .order("title", { ascending: true });

        if (mounted) {
          if (lessonError) throw lessonError;
          setLessons(Array.isArray(lessonData) ? lessonData : []);
        }
      } catch (err) {
        console.error(err);
        if (mounted) setError("Could not load lessons.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [canonicalId, targetIds]);

  const groups = useMemo(() => {
    if (!lessons.length) return [];
    const byYear = {};
    for (const l of lessons) {
      const y = l.year_level || "General";
      if (!byYear[y]) byYear[y] = [];
      byYear[y].push(l);
    }
    return Object.keys(byYear).sort().map(y => ({
      id: y,
      title: y === "General" ? "General" : `Year ${y}`,
      lessons: byYear[y]
    }));
  }, [lessons]);

  const heroImage = SUBJECT_IMAGES[canonicalId] || SUBJECT_IMAGES.MATH;

  // --- RENDER: LANGUAGE HUB ---
  if (canonicalId === "LANG") {
    return (
      <PageScaffold title={null}>
        <div className="mb-6">
          <Link 
            href="/app/worlds" 
            className="inline-flex items-center gap-2 rounded-full bg-white/60 backdrop-blur px-4 py-2 text-sm font-bold text-slate-600 hover:bg-white hover:text-slate-900 transition-all shadow-sm ring-1 ring-slate-900/5"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Worlds
          </Link>
        </div>

        <div className="relative mb-10 overflow-hidden rounded-[2.5rem] bg-indigo-50 border border-indigo-100 p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            <div className="relative h-28 w-28 shrink-0 rounded-3xl bg-white text-indigo-600 flex items-center justify-center shadow-md ring-4 ring-white/50 text-5xl">
              <LanguagesIcon className="w-14 h-14" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Languages</h1>
              <p className="mt-2 text-lg text-slate-600 font-medium">Explore the world. Pick a flag to start learning.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {LANGUAGE_TILES.map((lang, idx) => (
            <Link key={lang.id} href={`/app/world/${lang.id}`}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative overflow-hidden rounded-[2rem] bg-white border border-slate-100 p-6 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 hover:border-brand-primary/40"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm ${lang.color} bg-opacity-10`}>
                    <span className="drop-shadow-sm">{lang.flag}</span>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
                
                <h3 className="text-xl font-black text-slate-900 group-hover:text-brand-primary transition-colors">
                  {lang.title}
                </h3>
                <p className="text-sm font-bold text-slate-400 mt-1">
                  {lang.desc}
                </p>
              </motion.div>
            </Link>
          ))}
        </div>
      </PageScaffold>
    );
  }

  // --- RENDER: SUBJECT LESSONS ---
  return (
    <PageScaffold title={null}>
      <div className="mb-6">
        <Link 
          href={canonicalId === "LANG_SPECIFIC" ? "/app/world/LANG" : "/app/worlds"}
          className="inline-flex items-center gap-2 rounded-full bg-white/60 backdrop-blur px-4 py-2 text-sm font-bold text-slate-600 hover:bg-white hover:text-slate-900 transition-all shadow-sm ring-1 ring-slate-900/5"
        >
          <ArrowLeft className="w-4 h-4" /> 
          {canonicalId === "LANG_SPECIFIC" ? "Back to Languages" : "Back to Worlds"}
        </Link>
      </div>

      <div className="relative mb-12 overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl">
        <div className="absolute inset-0">
           <Image src={heroImage} alt={subjectName} fill className="object-cover opacity-60" priority />
           <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent" />
        </div>
        <div className="relative z-10 p-8 md:p-12 text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-4 border border-white/20">
             World
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 drop-shadow-lg">
            {canonicalId === "LANG_SPECIFIC" ? rawId.toUpperCase() : subjectName}
          </h1>
          <p className="text-lg md:text-xl text-slate-200 font-medium max-w-2xl leading-relaxed">
            Choose your level. Master the skill. Earn the reward.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 rounded-[2rem] bg-slate-100 animate-pulse" />)}
        </div>
      ) : error ? (
        <div className="p-8 rounded-3xl bg-rose-50 border border-rose-100 text-rose-800 font-bold text-center">
          {error}
        </div>
      ) : lessons.length === 0 ? (
        <div className="p-16 rounded-[2.5rem] bg-white border-4 border-dashed border-slate-100 text-center">
          <div className="text-6xl mb-4 grayscale opacity-40">🗺️</div>
          <div className="text-xl font-black text-slate-900">No lessons yet</div>
          <p className="text-slate-500 mt-2">Check back soon for new adventures.</p>
        </div>
      ) : (
        <div className="space-y-16">
          {groups.map((group) => (
            <section key={group.id} className="relative">
              <div className="flex items-end gap-4 mb-6">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{group.title}</h2>
                <div className="h-px flex-1 bg-slate-200 mb-2.5" />
              </div>
              
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {group.lessons.map((l, i) => (
                  <LessonCard key={l.id} lesson={l} index={i} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </PageScaffold>
  );
}

function LessonCard({ lesson, index }) {
  const level = getDifficulty(lesson.title);
  
  return (
    <Link href={`/app/lesson/${encodeURIComponent(lesson.id)}`} className="group block h-full">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ y: -6, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative h-full flex flex-col rounded-[2rem] bg-white border border-slate-100 p-1 shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:border-brand-primary/30"
      >
        <div className="flex-1 p-5 pb-2">
           <div className="flex items-start justify-between mb-4">
              <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide", level.color)}>
                {level.icon} {level.label}
              </span>
              {/* Fake 'coins' reward badge */}
              <span className="text-[10px] font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-full flex items-center gap-1">
                 <Zap className="w-3 h-3 fill-current" /> +20
              </span>
           </div>
           
           <h3 className="text-lg font-black text-slate-900 leading-snug mb-2 group-hover:text-brand-primary transition-colors line-clamp-2">
             {lesson.title}
           </h3>
           
           {lesson.topic && (
             <p className="text-sm font-semibold text-slate-500 line-clamp-2">
               {lesson.topic}
             </p>
           )}
        </div>

        <div className="p-4 pt-2">
           <div className="w-full h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center px-4 group-hover:bg-slate-900 group-hover:text-white transition-colors duration-300">
              <span className="text-xs font-bold uppercase tracking-wider group-hover:text-white/90">Start</span>
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-slate-900 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                 <Play className="w-3 h-3 fill-current" />
              </div>
           </div>
        </div>
      </motion.div>
    </Link>
  );
}