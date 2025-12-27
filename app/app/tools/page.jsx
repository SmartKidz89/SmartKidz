"use client";

import Link from "next/link";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { Wrench, BookOpen, PenTool, Globe, Sparkles, Clock, ScanFace, Printer } from "lucide-react";

const TOOLS = [
  { 
    href: "/app/tools/lesson-builder", 
    title: "Lesson Builder", 
    desc: "Create custom lessons with AI.", 
    icon: Wrench, 
    color: "bg-fuchsia-100 text-fuchsia-700" 
  },
  { 
    href: "/app/tools/worksheet", 
    title: "Worksheet Maker", 
    desc: "Generate printable practice sheets.", 
    icon: Printer, 
    color: "bg-orange-100 text-orange-700" 
  },
  { 
    href: "/app/tools/storybook", 
    title: "Magic Storybook", 
    desc: "Write and download your own books.", 
    icon: BookOpen, 
    color: "bg-blue-100 text-blue-700" 
  },
  { 
    href: "/app/tools/world-explorer", 
    title: "World Explorer", 
    desc: "Spin the globe and discover.", 
    icon: Globe, 
    color: "bg-sky-100 text-sky-700" 
  },
  { 
    href: "/app/tools/curiosity", 
    title: "Wonder Box", 
    desc: "Ask big questions, get kid answers.", 
    icon: Sparkles, 
    color: "bg-purple-100 text-purple-700" 
  },
  { 
    href: "/app/tools/timeline", 
    title: "My Journey", 
    desc: "See your achievements and badges.", 
    icon: Clock, 
    color: "bg-amber-100 text-amber-700" 
  },
  { 
    href: "/app/tools/reflection", 
    title: "Daily Reflection", 
    desc: "Check in with how you feel.", 
    icon: ScanFace, 
    color: "bg-emerald-100 text-emerald-700" 
  },
  { 
    href: "/app/tools/dictionary", 
    title: "Visual Dictionary", 
    desc: "Look up words with examples.", 
    icon: BookOpen, 
    color: "bg-teal-100 text-teal-700" 
  },
];

export default function ToolsIndex() {
  return (
    <PageMotion className="max-w-6xl mx-auto pb-20">
      <div className="flex flex-col gap-2 mb-10">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <span className="h-10 w-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md transform -rotate-3">
            <Wrench className="w-5 h-5" />
          </span>
          Creative Tools
        </h1>
        <p className="text-slate-600 font-medium text-lg max-w-2xl">
          Build, explore, and create. These tools help you do more than just lessons.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {TOOLS.map((tool) => (
          <Link 
            key={tool.href} 
            href={tool.href}
            className="group relative flex flex-col p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-4 text-2xl shadow-sm ${tool.color} group-hover:scale-110 transition-transform`}>
              <tool.icon className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-1">{tool.title}</h3>
            <p className="text-sm font-medium text-slate-500">{tool.desc}</p>
            
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
               <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                 <span className="text-lg">→</span>
               </div>
            </div>
          </Link>
        ))}
      </div>
    </PageMotion>
  );
}