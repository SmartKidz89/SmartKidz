"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Page as PageScaffold } from "@/components/ui/PageScaffold";
import { 
  ArrowRight, 
  Calculator, 
  BookOpen, 
  FlaskConical, 
  Globe, 
  Palette, 
  Cpu, 
  Activity, 
  Languages, 
  Wrench,
  Map as MapIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

// Consistent Subject Config (matches Dashboard)
const SUBJECTS = [
  { 
    id: "MATH", 
    title: "Mathematics", 
    subtitle: "Numbers & Logic",
    icon: Calculator, 
    color: "text-sky-600",
    bg: "bg-sky-50",
    gradient: "from-sky-400 to-blue-600", 
    img: "/illustrations/subjects/world-maths.webp", 
  },
  { 
    id: "ENG", 
    title: "English", 
    subtitle: "Reading & Writing",
    icon: BookOpen, 
    color: "text-violet-600",
    bg: "bg-violet-50",
    gradient: "from-violet-400 to-fuchsia-600", 
    img: "/illustrations/subjects/world-english.webp", 
  },
  { 
    id: "SCI", 
    title: "Science", 
    subtitle: "Discovery Lab",
    icon: FlaskConical, 
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    gradient: "from-emerald-400 to-teal-600", 
    img: "/illustrations/subjects/world-science.webp", 
  },
  { 
    id: "HASS", 
    title: "HASS", 
    subtitle: "History & World",
    icon: Globe, 
    color: "text-amber-600",
    bg: "bg-amber-50",
    gradient: "from-amber-400 to-orange-600", 
    img: "/illustrations/subjects/world-energy.webp", 
  },
  { 
    id: "ART", 
    title: "The Arts", 
    subtitle: "Create & Express",
    icon: Palette, 
    color: "text-pink-600",
    bg: "bg-pink-50",
    gradient: "from-pink-400 to-rose-600", 
    img: "/illustrations/subjects/world-arts.webp", 
  },
  { 
    id: "TECH", 
    title: "Technologies", 
    subtitle: "Design & Code",
    icon: Cpu, 
    color: "text-slate-600",
    bg: "bg-slate-50",
    gradient: "from-slate-400 to-slate-600", 
    img: "/illustrations/subjects/world-energy.webp", 
  },
  { 
    id: "HPE", 
    title: "Health & PE", 
    subtitle: "Active Bodies",
    icon: Activity, 
    color: "text-lime-600",
    bg: "bg-lime-50",
    gradient: "from-lime-400 to-green-600", 
    img: "/illustrations/subjects/world-health.webp", 
  },
  { 
    id: "LANG", 
    title: "Languages", 
    subtitle: "Global Talk",
    icon: Languages, 
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    gradient: "from-indigo-400 to-cyan-600", 
    img: "/illustrations/subjects/world-languages.webp", 
  },
];

const TOOLS = [
  { href: "/app/tools/lesson-builder", title: "Lesson Builder", icon: "🧠", color: "bg-fuchsia-100 text-fuchsia-700" },
  { href: "/app/tools/worksheet", title: "Worksheets", icon: "🧾", color: "bg-orange-100 text-orange-700" },
  { href: "/app/tools/world-explorer", title: "Explorer", icon: "🌍", color: "bg-sky-100 text-sky-700" },
  { href: "/app/tools/dictionary", title: "Dictionary", icon: "📖", color: "bg-emerald-100 text-emerald-700" },
  { href: "/app/tools/storybook", title: "Storybook", icon: "📘", color: "bg-blue-100 text-blue-700" },
  { href: "/app/tools/curiosity", title: "Curiosity", icon: "🔎", color: "bg-purple-100 text-purple-700" },
  { href: "/app/tools/focus", title: "Focus Mode", icon: "🧘", color: "bg-teal-100 text-teal-700" },
  { href: "/app/tools/timeline", title: "Timeline", icon: "⏳", color: "bg-amber-100 text-amber-700" },
];

export default function WorldsIndexPage() {
  return (
    <PageScaffold title={null} className="pb-20">
      
      {/* Header */}
      <div className="flex flex-col gap-2 mb-10">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <span className="h-10 w-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md transform -rotate-3">
            <MapIcon className="w-5 h-5" />
          </span>
          Explore Worlds
        </h1>
        <p className="text-slate-600 font-medium text-lg max-w-2xl">
          Pick a subject to start your adventure, or grab a creative tool to build something new.
        </p>
      </div>

      {/* Learning Worlds Grid */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-black text-slate-900">Learning Worlds</h2>
          <div className="h-1 w-12 bg-slate-200 rounded-full" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SUBJECTS.map((sub, idx) => (
            <WorldCard key={sub.id} subject={sub} index={idx} />
          ))}
        </div>
      </section>

      {/* Tools Grid */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-2xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center shadow-sm transform rotate-3">
            <Wrench className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Creative Tools</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4">
          {TOOLS.map((tool, idx) => (
            <ToolCard key={tool.href} tool={tool} index={idx} />
          ))}
        </div>
      </section>

    </PageScaffold>
  );
}

function WorldCard({ subject, index }) {
  return (
    <Link href={`/app/world/${subject.id}`} className="group relative block h-64 w-full cursor-pointer">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.4 }}
        className="relative h-full w-full overflow-hidden rounded-[2.5rem] bg-white shadow-md transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
      >
        {/* Background Image & Gradient */}
        <div className="absolute inset-0">
          <Image 
            src={subject.img} 
            alt={subject.title} 
            fill 
            className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-95" 
          />
          <div className={`absolute inset-0 bg-gradient-to-br ${subject.gradient} opacity-60 mix-blend-multiply transition-opacity group-hover:opacity-50`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
        </div>
        
        {/* Content */}
        <div className="absolute inset-0 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-inner">
              <subject.icon className="w-6 h-6 text-white" />
            </div>
            <div className="h-8 w-8 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
              <ArrowRight className="w-4 h-4 text-white" />
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-black text-white leading-none tracking-tight mb-1 drop-shadow-sm">
              {subject.title}
            </h3>
            <p className="text-sm font-medium text-white/90">{subject.subtitle}</p>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function ToolCard({ tool, index }) {
  return (
    <Link href={tool.href} className="group block">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 + (index * 0.05) }}
        className="flex flex-col items-center gap-3 rounded-[2rem] border border-white/60 bg-white/60 p-4 text-center shadow-sm backdrop-blur-md transition-all hover:bg-white hover:shadow-xl hover:-translate-y-2 h-full justify-center"
      >
        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-transform group-hover:scale-110 ${tool.color}`}>
          {tool.icon}
        </div>
        <div className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors line-clamp-1">
          {tool.title}
        </div>
      </motion.div>
    </Link>
  );
}