"use client";

import { useMemo } from "react";
import { BookOpen, Sparkles } from "lucide-react";
import { getDailyNarrative } from "@/lib/story/store";

export default function StoryRibbon() {
  const story = useMemo(() => getDailyNarrative(), []);
  return (
    <div className="pointer-events-none absolute left-1/2 top-24 z-10 -translate-x-1/2 w-[min(920px,92vw)]">
      <div className="rounded-[28px] border border-white/70 bg-white/70 backdrop-blur px-5 py-4 shadow-[var(--shadow-e1)]">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <Sparkles className="w-5 h-5 text-slate-800" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="font-extrabold text-slate-900">{story.title}</div>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 text-white text-xs font-semibold px-2 py-1">
                <BookOpen className="w-3.5 h-3.5" />
                Streak {story.streak}
              </span>
            </div>
            <div className="mt-1 text-sm font-semibold text-slate-700">{story.line}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
