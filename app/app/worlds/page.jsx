"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Page as PageScaffold } from "@/components/ui/PageScaffold";
import { 
  ArrowRight, Calculator, BookOpen, FlaskConical, Globe, Palette, Cpu, Activity, Languages, 
  Wrench, Compass, PenTool, Sparkles, Clock, Globe2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useActiveChild } from "@/hooks/useActiveChild";
import { getGeoConfig } from "@/lib/marketing/geoConfig";

// --- Configuration ---

function getSubjects(geo) {
  return [
    { 
      id: "MATH", 
      title: geo.mathTerm, 
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
      title: geo.hassTerm, // Localized
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
      title: geo.code === "US" ? "Health & PE" : "HPE", 
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
}

const TOOLS = [
  { href: "/app/tools/pixel-art", title: "Pixel Art", icon: Palette, color: "bg-pink-500", desc: "Draw in blocks" },
  { href: "/app/tools/world-explorer", title: "Explorer", icon: Globe2, color: "bg-sky-500", desc: "Spin the globe" },
  { href: "/app/tools/dictionary", title: "Dictionary", icon: BookOpen, color: "bg-emerald-500", desc: "Look it up" },
  { href: "/app/tools/storybook", title: "Storybook", icon: PenTool, color: "bg-violet-500", desc: "Write stories" },
  { href: "/app/tools/curiosity", title: "Curiosity", icon: Compass, color: "bg-rose-500", desc: "Ask why?" },
  { href: "/app/tools/focus", title: "Focus Mode", icon: Sparkles, color: "bg-teal-500", desc: "Zero distractions" },
  { href: "/app/tools/timeline", title: "Timeline", icon: Clock, color: "bg-amber-500", desc: "Your history" },
];

export default function WorldsIndexPage() {
  const { activeChild } = useActiveChild();
  const geo = getGeoConfig(activeChild?.country || "AU");
  const SUBJECTS = getSubjects(geo);

  return (
    <PageScaffold title={null} className="pb-32">
      
      {/* Header */}
      <div className="flex flex-col gap-2 mb-12 text-center sm:text-left">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight flex items-center justify-center sm:justify-start gap-4">
          <span className="h-14 w-14 rounded-3xl bg-slate-900 text-white flex items-center justify-center shadow-xl transform -rotate-3">
            <Globe className="w-8 h-8" />
          </span>
          Explore Worlds
        </h1>
        <p className="text-slate-600 font-medium text-xl max-w-2xl mx-auto sm:mx-0 leading-relaxed">
          Jump into a subject to start your adventure, or grab a tool to build something new.
        </p>
      </div>

      {/* Learning Worlds Grid */}
      <section className="mb-20">
        <div className="flex items-center gap-3 mb-8">
          <h2 className="text-2xl font-black text-slate-900">Learning Worlds</h2>
          <div className="h-1.5 w-16 bg-slate-200 rounded-full" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SUBJECTS.map((sub, idx) => (
            <WorldCard key={sub.id} subject={sub} index={idx} />
          ))}
        </div>
      </section>

      {/* Tools Grid */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-2xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center shadow-sm transform rotate-3">
            <Wrench className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Creative Toolkit</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {TOOLS.map((tool, idx) => (
            <ToolTile key={tool.href} tool={tool} index={idx} />
          ))}
        </div>
      </section>

    </PageScaffold>
  );
}

function WorldCard({ subject, index }) {
  return (
    <Link href={`/app/world/${subject.id}`} className="group relative block h-72 w-full cursor-pointer">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.4 }}
        className="relative h-full w-full overflow-hidden rounded-[2.5rem] bg-white shadow-lg transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ring-1 ring-black/5"
      >
        {/* Background Image & Gradient */}
        <div className="absolute inset-0">
          <Image 
            src={subject.img} 
            alt={subject.title} 
            fill 
            className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-95" 
          />
          <div className={`absolute inset-0 bg-gradient-to-br ${subject.gradient} opacity-60 mix-blend-multiply transition-opacity group-hover:opacity-70`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />
        </div>
        
        {/* Content */}
        <div className="absolute inset-0 p-8 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="h-14 w-14 rounded-3xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              <subject.icon className="w-7 h-7 text-white" />
            </div>
            <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
              <ArrowRight className="w-5 h-5 text-white" />
            </div>
          </div>
          
          <div>
            <h3 className="text-3xl font-black text-white leading-none tracking-tight mb-2 drop-shadow-md">
              {subject.title}
            </h3>
            <p className="text-base font-bold text-white/80">{subject.subtitle}</p>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function ToolTile({ tool, index }) {
  const Icon = tool.icon;
  return (
    <Link href={tool.href} className="group block">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 + (index * 0.05) }}
        className="relative overflow-hidden rounded-[2rem] bg-white p-6 shadow-sm border border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1 hover:border-slate-200 group-hover:ring-2 ring-offset-2 ring-transparent group-hover:ring-slate-200"
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className={cn(
            "w-16 h-16 rounded-[1.2rem] flex items-center justify-center text-white shadow-lg transform transition-transform group-hover:scale-110 group-hover:rotate-3",
            tool.color
          )}>
            <Icon className="w-8 h-8" strokeWidth={2.5} />
          </div>
          
          <div>
            <div className="font-black text-slate-900 text-lg mb-1">{tool.title}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">{tool.desc}</div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}