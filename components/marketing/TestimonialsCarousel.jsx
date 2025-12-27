"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

export default function TestimonialsCarousel({ items = [], intervalMs = 6000 }) {
  const data = useMemo(() => items.filter(Boolean), [items]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!data.length) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % data.length), intervalMs);
    return () => clearInterval(t);
  }, [data.length, intervalMs]);

  if (!data.length) return null;
  const current = data[idx];

  return (
    <div className="sk-card overflow-hidden">
      <div className="p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1 text-brand-spark">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="sk-btn-muted !px-3 !py-2"
              onClick={() => setIdx((i) => (i - 1 + data.length) % data.length)}
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="sk-btn-muted !px-3 !py-2"
              onClick={() => setIdx((i) => (i + 1) % data.length)}
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-5 relative min-h-[120px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <p className="text-lg sm:text-xl font-semibold text-slate-900 leading-snug">
                “{current.quote}”
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-brand-secondary/20 flex items-center justify-center font-bold text-slate-800">
                  {current.initials}
                </div>
                <div>
                  <div className="font-semibold text-slate-900">{current.name}</div>
                  <div className="text-sm text-slate-600">{current.meta}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-6 flex items-center gap-2">
          {data.map((t, i) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setIdx(i)}
              className={"h-2.5 rounded-full transition-all " + (i == idx ? "w-8 bg-brand-primary" : "w-2.5 bg-slate-200")}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}