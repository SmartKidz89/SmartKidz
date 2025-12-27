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
  const loop = [...shots, ...shots];
  return (
    <div className="grid lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-5 space-y-4">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          A platform that feels like a game — but teaches real skills.
        </h3>
        <p className="text-slate-600">
          Everything is designed for kids to explore independently, while parents stay informed and in control.
        </p>

        <div className="space-y-3">
          {shots.map((s) => (
            <div key={s.id} className="sk-card p-4">
              <div className="font-semibold text-slate-900">{s.title}</div>
              <div className="text-sm text-slate-600 mt-1">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-7">
        <div className="relative overflow-hidden rounded-4xl border border-slate-200 bg-white/60 shadow-elevated">
          {/* edge fades */}
          <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-14 bg-gradient-to-r from-white/90 to-transparent" />
          <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-white/90 to-transparent" />

          <div className="p-5">
            <div className="text-sm font-semibold text-slate-700">Peek inside the app</div>
            <div className="text-xs text-slate-500 mt-1">Hover to pause • scrolls automatically</div>
          </div>

          {/* marquee */}
          <div className="marquee" aria-label="SmartKidz app screenshots">
            <div className="marquee-track">
              {loop.map((s, idx) => (
                <motion.div
                  key={`${s.id}-${idx}`}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.45, delay: (idx % shots.length) * 0.03 }}
                  className="marquee-item sk-card overflow-hidden"
                >
                  <div className="relative aspect-[16/10]">
                    <Image
                      src={s.src}
                      alt={s.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 90vw, 420px"
                      priority={idx === 0}
                    />
                  </div>
                  <div className="p-4">
                    <div className="font-semibold text-slate-900">{s.title}</div>
                    <div className="text-sm text-slate-600 mt-1">{s.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}