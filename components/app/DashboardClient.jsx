"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Page as PageScaffold } from "@/components/ui/PageScaffold";
import TodayModule from "@/components/today/TodayModule";
import RecommendationsPanel from "@/components/app/RecommendationsPanel";
import { useActiveChild } from "@/hooks/useActiveChild";
import { useFocusMode } from "@/components/ui/FocusModeProvider";
import { 
  Calculator, BookOpen, FlaskConical, Globe, Palette, Cpu, Activity, Languages, 
  Wrench, Star, ArrowRight, Zap, Map, Trophy, Sparkles, Moon
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Configuration ---

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
  { href: "/app/tools/curiosity", title: "Wonder Box", icon: "🔎", color: "bg-purple-100 text-purple-700" },
  { href: "/app/tools/timeline", title: "Timeline", icon: "⏳", color: "bg-amber-100 text-amber-700" },
  { href: "/app/tools/reflection", title: "Reflection", icon: "🌱", color: "bg-teal-100 text-teal-700" },
];

// --- Components ---

function Greeting({ name }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  
  return (
    <div className="flex flex-col">
      <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
        {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">{name}</span>!
      </h1>
      <p className="text-slate-600 font-medium mt-1">Ready to discover something new?</p>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, colorClass, delay = 0 }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="flex items-center gap-4 rounded-3xl bg-white/70 border border-white/60 p-4 shadow-sm backdrop-blur-md transition-transform hover:scale-[1.02]"
    >
      <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm", colorClass)}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</div>
        <div className="text-xl font-black text-slate-900">{value}</div>
      </div>
    </motion.div>
  );
}

export default function DashboardClient() {
  const { activeChild } = useActiveChild();
  const { focus, toggle: toggleFocus } = useFocusMode();
  const name = activeChild?.display_name?.split(" ")[0] || "Explorer";

  return (
    <PageScaffold title={null} className="pb-20">
      
      {/* 1. Hero / Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <Greeting name={name} />
        <div className="flex items-center gap-3">
           <button
             onClick={toggleFocus}
             className={cn(
               "flex items-center gap-2 px-4 py-2 rounded-2xl font-bold transition-all border",
               focus 
                 ? "bg-teal-100 text-teal-800 border-teal-200 shadow-inner"
                 : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 shadow-sm"
             )}
           >
             <Moon className="w-4 h-4" />
             <span className="text-sm">{focus ? "Focus On" : "Focus Mode"}</span>
           </button>
           <div className="hidden md:flex gap-3">
             <StatCard label="Streak" value="3 Days" icon={Zap} colorClass="bg-amber-400" delay={0.1} />
             <StatCard label="Weekly XP" value="450 XP" icon={Star} colorClass="bg-brand-primary" delay={0.2} />
           </div>
        </div>
      </div>

      {/* 2. Main Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
        
        {/* Large: Today's Mission */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-8 relative overflow-hidden rounded-[2.5rem] bg-white shadow-xl border border-slate-100 p-1"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-sky-50 opacity-50" />
          <TodayModule /> 
        </motion.div>

        {/* Side: Quick Actions / Recommendations */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Recommendations */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1 rounded-[2.5rem] bg-white/80 border border-white/60 backdrop-blur-xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-fuchsia-500" />
              <h3 className="font-extrabold text-slate-900">For You</h3>
            </div>
            <RecommendationsPanel />
          </motion.div>

          {/* Rewards Link */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link href="/app/rewards" className="group block rounded-[2.5rem] bg-gradient-to-r from-amber-300 to-orange-400 p-[2px] shadow-lg transition-transform hover:-translate-y-1">
              <div className="flex items-center justify-between rounded-[2.4rem] bg-white px-6 py-4 h-full">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                    <Trophy className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <div className="font-black text-slate-900 text-lg">Rewards</div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">View Progress</div>
                  </div>
                </div>
                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* 3. Worlds Grid */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md transform -rotate-3">
              <Map className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Your Worlds</h2>
          </div>
          <Link href="/app/worlds" className="text-sm font-bold bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm text-slate-600 hover:text-brand-primary hover:border-brand-primary transition-all">
            See All
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SUBJECTS.map((sub, idx) => (
            <WorldCard key={sub.id} subject={sub} index={idx} />
          ))}
        </div>
      </section>

      {/* 4. Tools Grid */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-2xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center shadow-sm transform rotate-3">
            <Wrench className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Creative Tools</h2>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
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
    <Link href={`/app/world/${subject.id}`} className="group relative block h-56 w-full cursor-pointer">
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
        transition={{ delay: 0.3 + (index * 0.05) }}
        className="flex flex-col items-center gap-3 rounded-[2rem] border border-white/60 bg-white/60 p-4 text-center shadow-sm backdrop-blur-md transition-all hover:bg-white hover:shadow-xl hover:-translate-y-2"
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