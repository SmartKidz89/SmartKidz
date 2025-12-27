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
  Wrench 
} from "lucide-react";

// Subject Configuration
const SUBJECTS = [
  { 
    id: "MATH", 
    title: "Mathematics", 
    icon: Calculator, 
    gradient: "from-sky-400 via-blue-500 to-indigo-600", 
    img: "/illustrations/subjects/world-maths.webp", 
    desc: "Numbers, patterns & logic" 
  },
  { 
    id: "ENG", 
    title: "English", 
    icon: BookOpen, 
    gradient: "from-violet-400 via-purple-500 to-fuchsia-600", 
    img: "/illustrations/subjects/world-english.webp", 
    desc: "Reading, writing & stories" 
  },
  { 
    id: "SCI", 
    title: "Science", 
    icon: FlaskConical, 
    gradient: "from-emerald-400 via-teal-500 to-cyan-600", 
    img: "/illustrations/subjects/world-science.webp", 
    desc: "Discovery & experiments" 
  },
  { 
    id: "HASS", 
    title: "HASS", 
    icon: Globe, 
    gradient: "from-amber-400 via-orange-500 to-red-600", 
    img: "/illustrations/subjects/world-energy.webp", 
    desc: "History & geography" 
  },
  { 
    id: "ART", 
    title: "The Arts", 
    icon: Palette, 
    gradient: "from-pink-400 via-rose-500 to-red-500", 
    img: "/illustrations/subjects/world-arts.webp", 
    desc: "Creativity & expression" 
  },
  { 
    id: "TECH", 
    title: "Technologies", 
    icon: Cpu, 
    gradient: "from-slate-400 via-slate-500 to-slate-600", 
    img: "/illustrations/subjects/world-energy.webp", 
    desc: "Design & digital skills" 
  },
  { 
    id: "HPE", 
    title: "Health & PE", 
    icon: Activity, 
    gradient: "from-lime-400 via-green-500 to-emerald-600", 
    img: "/illustrations/subjects/world-health.webp", 
    desc: "Movement & wellbeing" 
  },
  { 
    id: "LANG", 
    title: "Languages", 
    icon: Languages, 
    gradient: "from-indigo-400 via-blue-500 to-cyan-500", 
    img: "/illustrations/subjects/world-languages.webp", 
    desc: "Communication & culture" 
  },
];

const TOOLS = [
  { href: "/app/tools/lesson-builder", title: "Lesson Builder", icon: "🧠", desc: "Create custom lessons" },
  { href: "/app/tools/worksheet", title: "Worksheet Maker", icon: "🧾", desc: "Printable practice sheets" },
  { href: "/app/tools/world-explorer", title: "World Explorer", icon: "🌍", desc: "3D Globe adventure" },
  { href: "/app/tools/dictionary", title: "Kid Dictionary", icon: "📖", desc: "Simple definitions" },
  { href: "/app/tools/storybook", title: "My Storybook", icon: "📘", desc: "Your learning journal" },
  { href: "/app/tools/curiosity", title: "Curiosity", icon: "🔎", desc: "Ask & discover" },
  { href: "/app/tools/focus", title: "Focus Mode", icon: "🧘", desc: "Calm distraction-free view" },
  { href: "/app/tools/timeline", title: "Timeline", icon: "⏳", desc: "Your achievements" },
];

export default function WorldsIndexPage() {
  return (
    <PageScaffold title="Explore" subtitle="Jump into a world or use a creative tool.">
      <div className="space-y-12 pb-10">
        
        {/* Learning Worlds Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Learning Worlds</h2>
              <p className="text-sm font-medium text-slate-600">Choose a subject to start your journey.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SUBJECTS.map((sub, idx) => (
              <WorldCard key={sub.id} subject={sub} index={idx} />
            ))}
          </div>
        </section>

        {/* Tools Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-2xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center shadow-sm">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Creative Tools</h2>
              <p className="text-sm font-medium text-slate-600">Build, explore, and practise.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
    <Link href={`/app/world/${subject.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.4 }}
        className="group relative h-64 overflow-hidden rounded-[2.5rem] bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
      >
        {/* Background Image & Gradient */}
        <div className="absolute inset-0">
          <Image 
            src={subject.img} 
            alt={subject.title} 
            fill 
            className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-90"
          />
          <div className={`absolute inset-0 bg-gradient-to-t ${subject.gradient} opacity-80 mix-blend-multiply transition-opacity group-hover:opacity-70`} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60" />
        </div>

        {/* Content */}
        <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
          <div className="flex justify-between items-start">
            <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-inner">
              <subject.icon className="w-6 h-6 text-white" />
            </div>
            <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 duration-300">
              <ArrowRight className="w-4 h-4 text-white" />
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-black tracking-tight leading-tight mb-1">{subject.title}</h3>
            <p className="text-sm font-medium text-white/90 leading-snug">{subject.desc}</p>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function ToolCard({ tool, index }) {
  return (
    <Link href={tool.href}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 + (index * 0.03), duration: 0.3 }}
        className="group h-full bg-white/60 border border-white/60 hover:bg-white hover:border-white p-4 rounded-3xl transition-all shadow-sm hover:shadow-lg backdrop-blur-md flex flex-col items-start gap-3"
      >
        <div className="text-3xl bg-white rounded-2xl w-12 h-12 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
          {tool.icon}
        </div>
        <div>
          <div className="font-bold text-slate-900 group-hover:text-brand-primary transition-colors">
            {tool.title}
          </div>
          <div className="text-xs font-semibold text-slate-500 leading-snug mt-0.5">
            {tool.desc}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}