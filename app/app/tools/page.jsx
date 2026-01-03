"use client";

import { PageMotion } from "@/components/ui/PremiumMotion";
import Link from "next/link";
import { ArrowRight, Palette, Scissors, Grid, MessageSquare, Activity, Volume2, Type, BookOpen, Globe2, Clock, Mic, Wind, Music, Flag, Smile, Cloud, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

// 17 Tools Total
const TOOLS = [
  { href: "/app/tools/teachme", label: "Teach Me", emoji: "🎓", desc: "AI Tutor", gradient: "from-violet-400 to-indigo-600", icon: null },
  { href: "/app/tools/spelling-bee", label: "Spelling Bee", emoji: "🐝", desc: "Listen & Spell", gradient: "from-amber-300 to-orange-500", icon: Volume2 },
  { href: "/app/tools/world-explorer", label: "Explorer", emoji: "🌏", desc: "World Map", gradient: "from-sky-400 to-blue-600", icon: Globe2 },
  { href: "/app/tools/grammar", label: "Grammar Gym", emoji: "✍️", desc: "Fix Sentences", gradient: "from-emerald-400 to-teal-600", icon: Type },
  { href: "/app/tools/dictionary", label: "Dictionary", emoji: "📖", desc: "Word Lookup", gradient: "from-cyan-400 to-blue-500", icon: BookOpen },
  { href: "/app/tools/timeline", label: "Timeline", emoji: "🕰️", desc: "History", gradient: "from-blue-400 to-indigo-500", icon: Clock },
  { href: "/app/tools/debate", label: "Debate Club", emoji: "🎤", desc: "Speak Up", gradient: "from-rose-400 to-pink-600", icon: Mic },
  { href: "/app/tools/zen", label: "Zen Zone", emoji: "🧘", desc: "Breathe", gradient: "from-teal-300 to-emerald-500", icon: Wind },
  { href: "/app/tools/music-maker", label: "Music Maker", emoji: "🎵", desc: "Make Beats", gradient: "from-pink-400 to-rose-600", icon: Music },
  { href: "/app/tools/pixel-art", title: "Pixel Art", emoji: "🎨", desc: "Draw blocks", gradient: "from-pink-100 to-pink-300", icon: Palette },
  { href: "/app/tools/origami", label: "Origami", emoji: "🦢", desc: "Paper Folding", gradient: "from-orange-300 to-red-400", icon: Scissors },
  { href: "/app/tools/color-lab", label: "Color Lab", emoji: "🌈", desc: "Mix & Match", gradient: "from-purple-400 to-fuchsia-600", icon: Palette },
  { href: "/app/tools/pattern-maker", label: "Patterns", emoji: "❄️", desc: "Symmetry", gradient: "from-indigo-400 to-cyan-500", icon: Grid },
  { href: "/app/tools/comic-creator", label: "Comic Maker", emoji: "💬", desc: "Tell Stories", gradient: "from-yellow-400 to-orange-500", icon: MessageSquare },
  { href: "/app/tools/sound-lab", label: "Sound Lab", emoji: "🔊", desc: "Visualizer", gradient: "from-lime-400 to-green-600", icon: Activity },
  // New 5
  { href: "/app/tools/flag-designer", label: "Flag Designer", emoji: "🏳️", desc: "Design Flags", gradient: "from-red-400 to-blue-600", icon: Flag },
  { href: "/app/tools/emoji-kitchen", label: "Emoji Kitchen", emoji: "😀", desc: "Mix Emojis", gradient: "from-yellow-300 to-amber-500", icon: Smile },
  { href: "/app/tools/drum-kit", label: "Drum Kit", emoji: "🥁", desc: "Play Drums", gradient: "from-slate-600 to-slate-800", icon: Activity },
  { href: "/app/tools/sky-writer", label: "Sky Writer", emoji: "☁️", desc: "Write in Clouds", gradient: "from-sky-300 to-blue-400", icon: Cloud },
  { href: "/app/tools/card-creator", label: "Card Creator", emoji: "💌", desc: "Make Cards", gradient: "from-rose-300 to-pink-500", icon: Mail },
];

export default function ToolsIndex() {
  return (
    <PageMotion className="max-w-7xl mx-auto pb-24">
      
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Creative Tools</h1>
          <p className="text-slate-600 font-medium mt-1">Build, explore, and create.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {TOOLS.map((t) => {
          const Icon = t.icon;
          return (
            <Link 
              key={t.href} 
              href={t.href}
              className="group relative flex flex-col items-center p-4 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-16 bg-slate-50 group-hover:bg-slate-100 transition-colors -z-10" />
              
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 mb-3",
                "bg-gradient-to-br", t.gradient
              )}>
                 <div className="drop-shadow-md">{Icon ? <Icon className="w-8 h-8 text-white" /> : t.emoji}</div>
              </div>
              
              <h3 className="font-extrabold text-slate-900 text-sm text-center leading-tight mb-0.5">
                {t.label || t.title}
              </h3>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide text-center">
                {t.desc}
              </p>

              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                 <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-md">
                    <ArrowRight className="w-3 h-3" />
                 </div>
              </div>
            </Link>
          );
        })}
      </div>
    </PageMotion>
  );
}