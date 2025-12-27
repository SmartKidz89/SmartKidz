"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const shots = [
  {
    id: "kids",
    title: "Kid dashboard",
    desc: "A colorful map with big, tappable lessons — kids choose what they want to learn.",
    src: "/illustrations/app/kids-dashboard-header.webp",
  },
  {
    id: "quiz",
    title: "Interactive quizzes",
    desc: "Short, fun questions with instant feedback to build confidence quickly.",
    src: "/illustrations/app/lesson-quiz.webp",
  },
  {
    id: "summary",
    title: "Rewards & progress",
    desc: "Clear milestones and celebrations that keep kids motivated.",
    src: "/illustrations/app/lesson-summary.webp",
  },
  {
    id: "parent",
    title: "Parent insights",
    desc: "See what’s improving, where help is needed, and what’s next.",
    src: "/illustrations/app/parent-analytics.webp",
  },
];

export default function ScreenshotsShowcase() {
  // Triple loop for smooth vertical scroll
  const loop = [...shots, ...shots, ...shots]; 

  return (
    <div className="grid lg:grid-cols-2 gap-10 items-center">
      
      {/* Left Column: Features List */}
      <div className="space-y-8">
        <div>
          <h3 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
            Feels like a game.<br/>
            <span className="text-indigo-600">Works like a tutor.</span>
          </h3>
          <p className="mt-4 text-lg text-slate-600 font-medium leading-relaxed">
            We've replaced boring worksheets with a vibrant world. 
            Everything is designed for kids to explore independently, while you stay in the loop.
          </p>
        </div>

        <div className="space-y-4">
          {shots.map((s, i) => (
            <div key={s.id} className="group flex items-start gap-4 p-4 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all">
              <div className="shrink-0 w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                {i + 1}
              </div>
              <div>
                <div className="font-bold text-slate-900 text-lg">{s.title}</div>
                <div className="text-slate-600 font-medium leading-snug">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Vertical Marquee */}
      <div className="relative h-[600px] rounded-[3rem] bg-slate-100 border border-slate-200 overflow-hidden shadow-2xl">
        {/* Gradients to mask edges */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-slate-100 to-transparent z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-100 to-transparent z-10 pointer-events-none" />

        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="flex flex-col gap-6 p-6"
            animate={{ y: ["0%", "-33.33%"] }}
            transition={{ duration: 40, ease: "linear", repeat: Infinity }}
          >
            {loop.map((s, idx) => (
              <div 
                key={`${s.id}-${idx}`}
                className="shrink-0 rounded-3xl overflow-hidden shadow-lg border border-slate-200 bg-white"
              >
                <div className="relative aspect-[16/10] w-full">
                  <Image
                    src={s.src}
                    alt={s.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  {/* Gloss */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent mix-blend-overlay" />
                </div>
                <div className="p-4 bg-white flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{s.title}</span>
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-rose-400" />
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

    </div>
  );
}