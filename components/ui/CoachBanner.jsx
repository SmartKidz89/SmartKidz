"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Sparkles, AlertCircle, Zap } from "lucide-react";
import { Card } from "./Card";

function iconFor(state) {
  if (state === "frustrated") return AlertCircle;
  if (state === "bored") return Zap;
  return Sparkles;
}

export default function CoachBanner({ signals }) {
  if (!signals) return null;
  const reduce = useReducedMotion();
  const Icon = iconFor(signals.state);

  const accent = signals.state === "frustrated" ? "border-amber-200 bg-amber-50" : signals.state === "bored" ? "border-sky-200 bg-sky-50" : "border-emerald-200 bg-emerald-50";

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={reduce ? false : { opacity: 1, y: 0 }}
      transition={reduce ? undefined : { type: "spring", stiffness: 260, damping: 22 }}
    >
      <Card className={`p-5 ${accent}`}
        data-testid="coach-banner"
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="font-extrabold text-lg">{signals.coach.title}</div>
            <div className="mt-1 text-slate-700">{signals.coach.hint}</div>
            <div className="mt-2 text-xs text-slate-600">
              Confidence: {Math.round((signals.confidence || 0) * 100)}% • Time: {signals.minutes.toFixed(1)} min
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
