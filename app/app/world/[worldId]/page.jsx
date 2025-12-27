"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Page as PageScaffold } from "@/components/ui/PageScaffold";
import { motion } from "framer-motion";
import { ArrowLeft, Languages as LanguagesIcon, ChevronRight, Zap, Play, Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { useActiveChild } from "@/hooks/useActiveChild";

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
  const { activeChild, loading: childLoading } = useActiveChild();
  
  // Use child's country preference, default to AU
  const country = activeChild?.country || "AU";
  const childYear = activeChild?.year_level || 3;

  const rawId = decodeURIComponent(params?.worldId || "").toLowerCase();
  
  const isLangCode = LANGUAGE_TILES.some(l => l.id === rawId.toUpperCase());
  const canonicalId = isLangCode ? "LANG_SPECIFIC" : (SLUG_MAP[rawId] || rawId.toUpperCase());
  
  let targetIds = [];
  if (canonicalId === "LANG_SPECIFIC") {
    const code = rawId.toUpperCase();
    targetIds = [code, code.toLowerCase()];
  } else if (SUBJECT_ALIASES[canonicalId]) {
    targetIds = [...SUBJECT_ALIASES[canonicalId], ...SUBJECT_ALIASES[canonicalId].map(s => s.toLowerCase())];
  } else {
    targetIds = [canonicalId, canonicalId.toLowerCase(), rawId];
  }
  targetIds = [...new Set(targetIds)];

  const [subjectName, setSubjectName] = useState(SUBJECT_LABELS[canonicalId] || canonicalId);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filtering State
  const [selectedYear, setSelectedYear] = useState(null); // Defaults to child year on load
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Sync selectedYear with child's year once loaded
  useEffect(() => {
    if (!childLoading && activeChild && selectedYear === null) {
      setSelectedYear(activeChild.year_level);
    } else if (!childLoading && selectedYear === null) {
      setSelectedYear(3); // Fallback
    }
  }, [activeChild, childLoading, selectedYear]);

  // Debounce Search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Fetch Lessons
  useEffect(() => {
    let mounted = true;
    async function load() {
      if (canonicalId === "LANG") { setLoading(false); return; }
      if (selectedYear === null) return; // Wait for year init

      setLoading(true);
      setError("");
      
      try {
        let query = supabase
          .from("lessons")
          .select("id,title,year_level,topic,subject_id,country")
          .in("subject_id", targetIds)
          .eq("year_level", selectedYear) // Filter by year at DB level for speed
          .order("title", { ascending: true })
          .limit(400); // Safety limit per year/subject

        // Apply country filter if possible (legacy data support)
        // We'll filter strictly on country if column is populated
        if (country) {
           query = query.eq("country", country);
        }

        if (debouncedSearch) {
           query = query.ilike("title", `%${debouncedSearch}%`);
        }

        const { data: lessonData, error: lessonError } = await query;

        if (mounted) {
          if (lessonError) throw lessonError;
          setLessons(lessonData || []);
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
  }, [canonicalId, targetIds.join(","), country, selectedYear, debouncedSearch]);

  const groups = useMemo(() => {
    if (!lessons.length) return [];
    // Group by Topic for cleaner display
    const byTopic = {};
    for (const l of lessons) {
      const t = l.topic || "General Practice";
      if (!byTopic[t]) byTopic[t] = [];
      byTopic[t].push(l);
    }
    return Object.keys(byTopic).sort().map(t => ({
      id: t,
      title: t,
      lessons: byTopic[t]
    }));
  }, [lessons]);

  const heroImage = SUBJECT_IMAGES[canonicalId] || SUBJECT_IMAGES.MATH;

  if (canonicalId === "LANG") {
    // Language Portal (Unchanged)
    return (
      <PageScaffold title={null}>
        <div className="mb-6">
          <Link href="/app/worlds" className="inline-flex items-center gap-2 rounded-full bg-white/60 backdrop-blur px-4 py-2 text-sm font-bold text-slate-600 hover:bg-white transition-all shadow-sm">
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
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="group relative overflow-hidden rounded-[2rem] bg-white border border-slate-100 p-6 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 hover:border-brand-primary/40">
                <div className="flex items-start justify-between mb-4">
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm ${lang.color} bg-opacity-10`}><span className="drop-shadow-sm">{lang.flag}</span></div>
                  <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-colors"><ChevronRight className="w-5 h-5" /></div>
                </div>
                <h3 className="text-xl font-black text-slate-900 group-hover:text-brand-primary transition-colors">{lang.title}</h3>
                <p className="text-sm font-bold text-slate-400 mt-1">{lang.desc}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </PageScaffold>
    );
  }

  return (
    <PageScaffold title={null}>
      
      {/* 1. Navbar */}
      <div className="mb-6 flex justify-between items-center">
        <Link href={canonicalId === "LANG_SPECIFIC" ? "/app/world/LANG" : "/app/worlds"} className="inline-flex items-center gap-2 rounded-full bg-white/60 backdrop-blur px-4 py-2 text-sm font-bold text-slate-600 hover:bg-white transition-all shadow-sm">
          <ArrowLeft className="w-4 h-4" /> {canonicalId === "LANG_SPECIFIC" ? "Back to Languages" : "Back to Worlds"}
        </Link>
        <span className="text-xs font-bold bg-white px-3 py-1 rounded-full border border-slate-200 text-slate-500 flex items-center gap-2">
           <Globe className="w-3 h-3" /> {country === "NZ" ? "NZ Curriculum" : "Australian Curriculum"}
        </span>
      </div>

      {/* 2. Hero */}
      <div className="relative mb-8 overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl">
        <div className="absolute inset-0">
           <Image src={heroImage} alt={subjectName} fill className="object-cover opacity-60" priority />
           <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent" />
        </div>
        <div className="relative z-10 p-8 md:p-12 text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-4 border border-white/20">World</div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 drop-shadow-lg">{canonicalId === "LANG_SPECIFIC" ? rawId.toUpperCase() : subjectName}</h1>
          <p className="text-lg md:text-xl text-slate-200 font-medium max-w-2xl leading-relaxed">
             Select your year level to find your path.
          </p>
        </div>
      </div>

      {/* 3. Filters Toolbar */}
      <div className="sticky top-20 z-30 mb-8 p-2 rounded-[2rem] bg-white/80 backdrop-blur-xl border border-white/50 shadow-lg flex flex-col md:flex-row items-center gap-4">
        
        {/* Year Tabs */}
        <div className="flex p-1 bg-slate-100/80 rounded-full overflow-x-auto max-w-full">
           {[1, 2, 3, 4, 5, 6].map(y => (
             <button
               key={y}
               onClick={() => setSelectedYear(y)}
               className={cn(
                 "px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap",
                 selectedYear === y 
                   ? "bg-slate-900 text-white shadow-md" 
                   : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
               )}
             >
               Year {y}
             </button>
           ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-auto md:flex-1">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
           <input 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             placeholder={`Search ${subjectName}...`}
             className="w-full h-11 pl-10 pr-4 rounded-full bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/50 transition-all placeholder:font-medium"
           />
        </div>
      </div>

      {/* 4. Content Area */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 rounded-[2rem] bg-slate-100 animate-pulse" />)}
        </div>
      ) : error ? (
        <div className="p-8 rounded-3xl bg-rose-50 border border-rose-100 text-rose-800 font-bold text-center">{error}</div>
      ) : groups.length === 0 ? (
        <div className="p-16 rounded-[2.5rem] bg-white border-4 border-dashed border-slate-100 text-center">
          <div className="text-6xl mb-4 grayscale opacity-40">🗺️</div>
          <div className="text-xl font-black text-slate-900">No lessons found</div>
          <p className="text-slate-500 mt-2">
            We couldn't find lessons for Year {selectedYear} in this subject yet.
          </p>
          <button onClick={() => setSelectedYear(Math.max(1, selectedYear - 1))} className="mt-4 text-brand-primary font-bold hover:underline">
             Try Year {Math.max(1, selectedYear - 1)}
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          {groups.map((group) => (
            <section key={group.id} className="relative">
              <div className="flex items-end gap-4 mb-6">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="w-2 h-8 rounded-full bg-brand-primary" />
                  {group.title}
                </h2>
                <div className="h-px flex-1 bg-slate-200 mb-2.5 opacity-50" />
              </div>
              
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {group.lessons.map((l, i) => <LessonCard key={l.id} lesson={l} index={i} />)}
              </div>
            </section>
          ))}
        </div>
      )}
    </PageScaffold>
  );
}

function Globe({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function LessonCard({ lesson, index }) {
  const level = getDifficulty(lesson.title);
  return (
    <Link href={`/app/lesson/${encodeURIComponent(lesson.id)}`} className="group block h-full">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }} whileHover={{ y: -6, scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative h-full flex flex-col rounded-[2rem] bg-white border border-slate-100 p-1 shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:border-brand-primary/30">
        <div className="flex-1 p-5 pb-2">
           <div className="flex items-start justify-between mb-4">
              <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide", level.color)}>{level.icon} {level.label}</span>
              <span className="text-[10px] font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-full flex items-center gap-1"><Zap className="w-3 h-3 fill-current" /> +20</span>
           </div>
           <h3 className="text-lg font-black text-slate-900 leading-snug mb-2 group-hover:text-brand-primary transition-colors line-clamp-2">{lesson.title}</h3>
           {lesson.topic && <p className="text-sm font-semibold text-slate-500 line-clamp-2">{lesson.topic}</p>}
        </div>
        <div className="p-4 pt-2">
           <div className="w-full h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center px-4 group-hover:bg-slate-900 group-hover:text-white transition-colors duration-300">
              <span className="text-xs font-bold uppercase tracking-wider group-hover:text-white/90">Start</span>
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-slate-900 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0"><Play className="w-3 h-3 fill-current" /></div>
           </div>
        </div>
      </motion.div>
    </Link>
  );
}