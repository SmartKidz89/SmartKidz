"use client";

import { Button } from "../ui/Button";
import { Calculator, BookOpen, FlaskConical, ChevronRight } from "lucide-react";
import { MathWorldArt, EnglishWorldArt, ScienceWorldArt } from "./WorldIllustrations";
import MasteryRing from "../ui/MasteryRing";
import { motion, useReducedMotion } from "framer-motion";

const WORLDS = [
  { code: "MATH", title: "Math World", icon: Calculator, subtitle: "Confidence with numbers, patterns and puzzles.", art: MathWorldArt, tone: "from-yellow-200 via-white to-white" },
  { code: "ENG", title: "Reading World", icon: BookOpen, subtitle: "Stories, comprehension, vocabulary and writing.", art: EnglishWorldArt, tone: "from-pink-200 via-white to-white" },
  { code: "SCI", title: "Science Lab", icon: FlaskConical, subtitle: "Explore how things work with questions and experiments.", art: ScienceWorldArt, tone: "from-green-200 via-white to-white" },
];

export default function SubjectWorlds({ yearLevel, childId, progressBySubject }) {
  const reduceMotion = useReducedMotion();
  const tileHover = reduceMotion ? {} : { y: -6, scale: 1.01 };
  const tileTap = reduceMotion ? {} : { scale: 0.99 };
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {WORLDS.map(({ code, title, icon: Icon, subtitle, art: Art, tone }) => {
        const p = progressBySubject?.[code] ?? { total: 0, completed: 0 };
        const ratio = p.total ? p.completed / p.total : 0;

        return (
          <Card
            key={code}
            className="overflow-hidden p-0 ring-1 ring-slate-200 hover:-translate-y-[2px] hover:shadow-xl transition"
          >
            {/* Art / Header */}
            <div className={`relative h-44 bg-gradient-to-br ${tone}`}>
              <div className="absolute inset-0 opacity-70 pointer-events-none" />
              <div className="absolute left-5 top-5 flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-white/80 ring-1 ring-white/60 grid place-items-center shadow-soft">
                  <Icon className="h-6 w-6 text-slate-800" />
                </div>
                <div className="rounded-2xl bg-white/80 ring-1 ring-white/60 px-3 py-2 shadow-soft">
                  <div className="text-sm font-extrabold text-slate-900 leading-tight">{title}</div>
                  <div className="text-[11px] font-semibold text-slate-700">Year {yearLevel}</div>
                </div>
              </div>

              <div className="absolute right-5 top-5 rounded-2xl bg-white/80 ring-1 ring-white/60 px-3 py-2 shadow-soft flex items-center gap-3">
                <MasteryRing value={ratio} size={34} strokeWidth={6} />
                <div className="leading-tight">
                  <div className="text-[11px] font-extrabold text-slate-900">{Math.round(ratio * 100)}%</div>
                  <div className="text-[10px] font-semibold text-slate-700">complete</div>
                </div>
              </div>

              <div className="absolute inset-x-0 bottom-0 pointer-events-none">
                <Art className="h-28 w-full" />
              </div>
            </div>

            {/* Copy + CTA */}
            <div className="p-6">
              <p className="text-sm font-semibold text-slate-700">{subtitle}</p>

              <div className="mt-5 flex items-center justify-between gap-3">
                <div className="text-xs font-semibold text-slate-500">
                  {p.completed}/{p.total || "—"} lessons
                </div>

                <Button href={`/app/world?subject=${code}&year=${yearLevel}${childId ? `&child=${childId}` : ""}`}>
                  Explore <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
