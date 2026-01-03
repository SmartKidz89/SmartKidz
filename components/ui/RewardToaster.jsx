"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { transitions } from "@/lib/motion";
import SparkleBurst from "./SparkleBurst";
import { cn } from "@/lib/utils";

function ToneIcon({ tone }) {
  if (tone === "badge") return <span aria-hidden>🏅</span>;
  if (tone === "streak") return <span aria-hidden>🔥</span>;
  if (tone === "info") return <span aria-hidden>✨</span>;
  return <span aria-hidden>✅</span>;
}

export default function RewardToaster({ toasts }) {
  const reduce = useReducedMotion();
  return (
    <div className="fixed top-4 left-0 right-0 z-50 px-4 pointer-events-none skz-glass">
      <div className="mx-auto max-w-lg space-y-3">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.98 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.98 }}
              transition={transitions.micro}
              className={cn(
                "pointer-events-none rounded-3xl border border-white/20 bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl shadow-elevated",
                "px-4 py-3 flex items-start gap-3"
              )}
            >
              <div className="mt-0.5 text-xl">
                <ToneIcon tone={t.tone} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-extrabold text-slate-900 leading-tight">{t.title || "Nice!"}</div>
                {t.message ? (
                  <div className="text-sm text-slate-700 mt-0.5 leading-snug">{t.message}</div>
                ) : null}
                {t.meta ? (
                  <div className="text-xs text-slate-600 mt-1">{t.meta}</div>
                ) : null}
              </div>
              {!reduce ? <SparkleBurst className="absolute -top-3 -right-3 opacity-80" /> : null}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
