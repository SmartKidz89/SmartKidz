"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Page as PageScaffold } from "@/components/ui/PageScaffold";
import TodayModule from "@/components/today/TodayModule";
import RecommendationsPanel from "@/components/app/RecommendationsPanel";
import { useActiveChild } from "@/hooks/useActiveChild";
import { 
  Calculator, BookOpen, FlaskConical, Globe, Palette, Cpu, Activity, Languages, 
  Wrench, Star, Play, Sparkles, Map, Smile
} from "lucide-react";

// Subject Configuration (Synced with Worlds Page)
const SUBJECTS = [
  { 
    id: "MATH", 
    title: "Mathematics", 
    icon: Calculator, 
    color: "bg-sky-500",
    gradient: "from-sky-400 to-blue-600", 
    img: "/illustrations/subjects/world-maths.webp", 
  },
  { 
    id: "ENG", 
    title: "English", 
    icon: BookOpen, 
    color: "bg-violet-500",
    gradient: "from-violet-400 to-fuchsia-600", 
    img: "/illustrations/subjects/world-english.webp", 
  },
  { 
    id: "SCI", 
    title: "Science", 
    icon: FlaskConical, 
    color: "bg-emerald-500",
    gradient: "from-emerald-400 to-teal-600", 
    img: "/illustrations/subjects/world-science.webp", 
  },
  { 
    id: "HASS", 
    title: "HASS", 
    icon: Globe, 
    color: "bg-amber-500",
    gradient: "from-amber-400 to-orange-600", 
    img: "/illustrations/subjects/world-energy.webp", 
  },
  { 
    id: "ART", 
    title: "The Arts", 
    icon: Palette, 
    color: "bg-pink-500",
    gradient: "from-pink-400 to-rose-600", 
    img: "/illustrations/subjects/world-arts.webp", 
  },
  { 
    id: "TECH", 
    title: "Technologies", 
    icon: Cpu, 
    color: "bg-slate-500",
    gradient: "from-slate-400 to-slate-600", 
    img: "/illustrations/subjects/world-energy.webp", 
  },
  { 
    id: "HPE", 
    title: "Health & PE", 
    icon: Activity, 
    color: "bg-lime-500",
    gradient: "from-lime-400 to-green-600", 
    img: "/illustrations/subjects/world-health.webp", 
  },
  { 
    id: "LANG", 
    title: "Languages", 
    icon: Languages, 
    color: "bg-indigo-500",
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

export default function DashboardClient() {
  const { activeChild } = useActiveChild();
  const name = activeChild?.display_name?.split(" ")[0] || "Friend";

  return (
    <PageScaffold 
      title={`Hi, ${name}! 👋`} 
      subtitle="Ready to learn something new today?"
    >
      <div className="space-y-8 pb-10">
        
        {/* Top Row: Today's Mission & Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <TodayModule />
          </div>
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="flex-1 rounded-3xl border border-white/60 bg-white/60 backdrop-blur p-5 shadow-sm">
              <RecommendationsPanel />
            </div>
            <Link href="/app/rewards" className="group rounded-3xl border border-white/60 bg-white/60 backdrop-blur p-5 shadow-sm hover:bg-white transition-colors flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Your Rewards</div>
                  <div className="text-xs font-semibold text-slate-500">View badges & streak</div>
                </div>
              </div>
              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </div>

        {/* Subjects Grid */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Map className="w-5 h-5 text-slate-500" /> My Worlds
            </h2>
            <Link href="/app/worlds" className="text-sm font-bold text-brand-primary hover:text-brand-secondary transition-colors">
              View All
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SUBJECTS.map((sub, idx) => (
              <WorldCard key={sub.id} subject={sub} index={idx} />
            ))}
          </div>
        </section>

        {/* Tools Grid */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-slate-500" /> My Tools
            </h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {TOOLS.map((tool, idx) => (
              <ToolCard key={tool.href} tool={tool} index={idx} />
            ))}
          </div>
        </section>

      </div>
    </PageScaffold>
  );
}

function WorldCard({ subject, index }) {
  return (
    <Link href={`/app/world/${subject.id}`} className="group relative block h-40 overflow-hidden rounded-[2rem] bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
      <div className="absolute inset-0">
        <Image 
          src={subject.img} 
          alt={subject.title} 
          fill 
          className="object-cover opacity-90 transition-transform duration-500 group-hover:scale-110" 
        />
        <div className={`absolute inset-0 bg-gradient-to-br ${subject.gradient} opacity-80 mix-blend-multiply transition-opacity group-hover:opacity-70`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>
      
      <div className="absolute inset-0 p-5 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className={`h-10 w-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30`}>
            <subject.icon className="w-5 h-5 text-white" />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-black text-white leading-tight">{subject.title}</h3>
          <div className="flex items-center gap-1 text-[10px] font-bold text-white/80 uppercase tracking-wide mt-1">
            <span>Enter</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </Link>
  );
}

function ToolCard({ tool, index }) {
  return (
    <Link href={tool.href} className="group block">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.05 }}
        className="flex flex-col items-center gap-3 rounded-3xl border border-white/60 bg-white/60 p-4 text-center shadow-sm backdrop-blur transition-all hover:bg-white hover:shadow-md hover:-translate-y-1"
      >
        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${tool.color}`}>
          {tool.icon}
        </div>
        <div className="text-xs font-bold text-slate-700 group-hover:text-slate-900 line-clamp-1">
          {tool.title}
        </div>
      </motion.div>
    </Link>
  );
}