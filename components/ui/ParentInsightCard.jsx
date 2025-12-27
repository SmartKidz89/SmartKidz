"use client";

import { motion } from "framer-motion";
import { transitions, variants } from "@/lib/motion";

export default function ParentInsightCard({
  childName = "your child",
  minutesThisWeek = 45,
  lessonsCompleted = 6,
  strongest = "Mathematics",
  suggestion = "Try a short lesson each day to build a streak.",
}) {
  return (
    <motion.div
      className="skz-card p-5 md:p-6 relative overflow-hidden skz-breathe"
      initial={variants.cardIn.initial}
      animate={variants.cardIn.animate}
      transition={transitions.card}
    >
      <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-indigo-400/10 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-rose-400/10 blur-3xl" />

      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-slate-500">This week’s learning insight</div>
          <div className="text-lg md:text-xl font-semibold tracking-tight">
            {childName} is building momentum
          </div>
          <div className="mt-2 text-sm text-slate-600">
            A quick summary to help you guide learning at home.
          </div>
        </div>
        <div className="skz-chip px-3 py-2 text-sm">✨ Premium</div>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="skz-glass p-4">
          <div className="text-xs text-slate-500">Time learning</div>
          <div className="text-2xl font-semibold">{minutesThisWeek} min</div>
          <div className="text-xs text-slate-600 mt-1">This week</div>
        </div>
        <div className="skz-glass p-4">
          <div className="text-xs text-slate-500">Lessons completed</div>
          <div className="text-2xl font-semibold">{lessonsCompleted}</div>
          <div className="text-xs text-slate-600 mt-1">Completed</div>
        </div>
        <div className="skz-glass p-4">
          <div className="text-xs text-slate-500">Most confident area</div>
          <div className="text-2xl font-semibold">{strongest}</div>
          <div className="text-xs text-slate-600 mt-1">Strongest</div>
        </div>
      </div>

      <div className="mt-5 skz-glass p-4">
        <div className="text-xs text-slate-500">Suggested next step</div>
        <div className="text-sm text-slate-700 mt-1">{suggestion}</div>
      </div>
    </motion.div>
  );
}
