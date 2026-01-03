"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const shots = [
  {
    id: "parent-dash",
    title: "For Parents",
    desc: "See exactly what they're learning, where they need help, and how they are progressing.",
    src: "/illustrations/app/parent-analytics.webp",
  },
  {
    id: "summary",
    title: "Progress Tracking",
    desc: "Clear milestones and weekly reports that keep you in the loop without the nagging.",
    src: "/illustrations/app/lesson-summary.webp",
  },
  {
    id: "quiz",
    title: "Support, not Replace",
    desc: "Built to support school learning with aligned practice, not just distract them with games.",
    src: "/illustrations/app/lesson-quiz.webp",
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
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 mb-4 backdrop-blur-md">
            For Parents
          </div>
          <h3 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
            See their growth.<br/>
            <span className="text-indigo-600">Support their journey.</span>
          </h3>
          <p className="mt-4 text-lg text-slate-600 font-medium leading-relaxed">
            We built SmartKidz to be a partner in your child's education. 
            You get total visibility into their progress, so you can celebrate the wins and help where it counts.
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