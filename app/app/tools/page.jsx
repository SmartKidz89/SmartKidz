"use client";

import { PageMotion } from "@/components/ui/PremiumMotion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const TOOLS = [
  { href: "/app/tools/worksheet", label: "Worksheet Builder", icon: "🧾", desc: "Create & print custom practice.", color: "from-orange-400 to-amber-500" },
  { href: "/app/tools/homework", label: "Homework Generator", icon: "📝", desc: "Fresh questions from your lessons.", color: "from-blue-400 to-indigo-500" },
  { href: "/app/tools/dictionary", label: "Smart Dictionary", icon: "📖", desc: "Kid-friendly definitions.", color: "from-emerald-400 to-teal-500" },
  { href: "/app/tools/lesson-builder", label: "Lesson Builder", icon: "🧠", desc: "Design your own lessons.", color: "from-fuchsia-400 to-pink-500" },
  { href: "/app/tools/storybook", label: "Magic Storybook", icon: "📘", desc: "Write and illustrate stories.", color: "from-violet-400 to-purple-600" },
  { href: "/app/tools/curiosity", label: "Curiosity Explorer", icon: "🔎", desc: "Ask big questions.", color: "from-rose-400 to-red-500" },
  { href: "/app/tools/reflection", label: "Daily Reflection", icon: "🌱", desc: "Build confidence & gratitude.", color: "from-lime-400 to-green-500" },
  { href: "/app/tools/timeline", label: "Journey Timeline", icon: "⏳", desc: "See how far you've come.", color: "from-sky-400 to-cyan-500" },
  { href: "/app/tools/world-explorer", label: "World Explorer", icon: "🌍", desc: "Spin the globe.", color: "from-indigo-400 to-blue-600" },
];

export default function ToolsIndex() {
  return (
    <PageMotion className="max-w-6xl mx-auto pb-20">
      
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Creative Toolkit</h1>
        <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto">
          Tools to help you explore, create, and practice at your own pace.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {TOOLS.map((t, i) => (
          <Link 
            key={t.href} 
            href={t.href}
            className="group relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-100 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${t.color} opacity-10 rounded-bl-[4rem] transition-transform group-hover:scale-110`} />
            
            <div className="p-8">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${t.color} flex items-center justify-center text-3xl shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {t.icon}
              </div>
              
              <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:to-slate-700 transition-all">
                {t.label}
              </h3>
              <p className="text-slate-600 font-medium leading-relaxed mb-6">
                {t.desc}
              </p>
              
              <div className="flex items-center gap-2 text-sm font-bold text-slate-400 group-hover:text-slate-900 transition-colors uppercase tracking-wider">
                Open Tool <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </PageMotion>
  );
}