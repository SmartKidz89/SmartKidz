"use client";

import ParallaxCard from "@/components/ui/ParallaxCard";

import { useMemo, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { transitions, variants } from "@/lib/motion";
import ChildAvatar from "@/components/avatar/ChildAvatar";

/**
 * World Map Journey v2
 * - Feels like a game level-select: islands, collectibles, animated trail
 * - Still performant on mobile
 */
export default function WorldMapJourney({
  lessons,
  completedIds = new Set(),
  subjectId,
  yearLevel,
  childId,
  avatarConfig,
}) {
  const scrollRef = useRef(null);
  const reduce = useReducedMotion();

  const items = useMemo(() => {
    return (lessons || []).map((l, idx) => {
      const id = l.id || l.lesson_id || l.lessonId;
      const title = l.title || l.name || `Lesson ${idx + 1}`;
      const topic = l.topic || "";
      const done = completedIds?.has?.(id) ?? false;
      const href =
        `/app/lesson/${id}` +
        `?subject=${encodeURIComponent(subjectId)}` +
        `&year=${yearLevel}` +
        (childId ? `&child=${encodeURIComponent(childId)}` : "");
      return { id, title, topic, done, idx, href };
    });
  }, [lessons, completedIds, subjectId, yearLevel, childId]);

  const completedCount = useMemo(
    () => items.reduce((a, it) => a + (it.done ? 1 : 0), 0),
    [items]
  );
  const pct = items.length ? Math.round((completedCount / items.length) * 100) : 0;

  const collectIcon = (i, done) => {
    // rotate between a few “collectibles”
    const icons = ["⭐", "🏅", "🧩", "💎", "🌟", "🎖️", "🔮"];
    return done ? icons[i % icons.length] : "•";
  };

  return (
    <div className="relative">
      <div className="skz-glass p-4 md:p-6 overflow-hidden">
        {/* Ambient floating blobs */}
        <div className="pointer-events-none absolute -top-20 -left-20 w-72 h-72 rounded-full bg-indigo-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-rose-400/10 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full bg-emerald-400/6 blur-3xl" />

        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="text-sm text-slate-500">World Journey</div>
            <div className="text-xl md:text-2xl font-semibold tracking-tight">
              Choose any lesson. Collect rewards as you go.
            </div>
            <div className="mt-2 flex items-center gap-3">
              <span className="skz-chip px-3 py-1 text-sm text-slate-700">
                {completedCount} / {items.length} completed
              </span>
              <div className="flex items-center gap-2">
                <div className="w-40 h-2 rounded-full bg-slate-200 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-emerald-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={reduce ? { duration: 0 } : { ...transitions.card, duration: 0.7 }}
                  />
                </div>
                <span className="text-sm text-slate-600">{pct}%</span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex gap-2">
            <button
              className="skz-chip px-3 py-2 text-sm skz-press"
              onClick={() => scrollRef.current?.scrollBy({ top: -520, behavior: "smooth" })}
            >
              Up
            </button>
            <button
              className="skz-chip px-3 py-2 text-sm skz-press"
              onClick={() => scrollRef.current?.scrollBy({ top: 520, behavior: "smooth" })}
            >
              Down
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="relative max-h-[72vh] overflow-auto pr-2 md:pr-3 scroll-smooth"
        >
          {/* Center trail */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[4px] rounded-full bg-gradient-to-b from-indigo-400/45 via-fuchsia-400/35 to-emerald-400/35" />

          {/* Avatar marker at the top */}
          <div className="absolute left-1/2 -translate-x-1/2 top-4 z-20 skz-float">
            {avatarConfig ? (
              <div className="relative">
                <div className="absolute -inset-3 rounded-full bg-indigo-400/10 blur-xl" />
                <ChildAvatar config={avatarConfig} size={56} />
              </div>
            ) : (
              <div className="skz-chip w-12 h-12 flex items-center justify-center shadow">
                <span className="text-xl">🚀</span>
              </div>
            )}
          </div>

          <div className="relative z-10 space-y-6 py-10">
            {items.map((it) => {
              const side = it.idx % 2 === 0 ? "left" : "right";
              const islandHue =
                it.idx % 3 === 0 ? "from-indigo-500/14 to-indigo-600/8"
                : it.idx % 3 === 1 ? "from-rose-500/12 to-rose-600/8"
                : "from-emerald-500/12 to-emerald-600/8";

              return (
                <motion.div
                  key={it.id}
                  initial={variants.cardIn.initial}
                  animate={variants.cardIn.animate}
                  transition={transitions.card}
                  className={["relative flex", side === "left" ? "justify-start" : "justify-end"].join(" ")}
                >
                  {/* Node island */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-7 z-10">
                    <motion.div
                      className={[
                        "relative w-10 h-10 rounded-2xl border border-slate-200 bg-white shadow",
                        "flex items-center justify-center",
                      ].join(" ")}
                      whileHover={reduce ? undefined : { y: -2 }}
                      whileTap={reduce ? undefined : { scale: 0.98 }}
                      transition={transitions.micro}
                    >
                      <div className={["absolute inset-0 rounded-2xl bg-gradient-to-br", islandHue].join(" ")} />
                      <div className="relative z-10 text-lg">
                        {it.done ? "✅" : "🗺️"}
                      </div>

                      {/* collectible */}
                      <div className="absolute -right-3 -top-3 skz-chip w-8 h-8 flex items-center justify-center shadow">
                        <span className="text-sm">{collectIcon(it.idx, it.done)}</span>
                      </div>
                    </motion.div>
                  </div>

                  <ParallaxCard className={[
        "group w-[92%] md:w-[46%] skz-card p-4 md:p-5 skz-press skz-border-animate skz-shine",
        "relative overflow-hidden",
      ].join(" ")}>
      <Link href={it.href} className="block">
                    <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-indigo-400/10 blur-2xl" />
                    <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-rose-400/10 blur-2xl" />

                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs text-slate-500">
                          Level {String(it.idx + 1).padStart(3, "0")}
                        </div>
                        <div className="text-base md:text-lg font-semibold leading-tight">
                          {it.title}
                        </div>
                        {it.topic ? (
                          <div className="mt-1 text-sm text-slate-600 line-clamp-2">
                            {it.topic}
                          </div>
                        ) : null}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={[
                            "text-xs px-2 py-1 rounded-full border",
                            it.done
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-white/60 text-slate-700 border-slate-200",
                          ].join(" ")}
                        >
                          {it.done ? "Completed" : "Start"}
                        </span>
                        <span className="text-lg opacity-60 group-hover:opacity-100 transition-opacity">
                          →
                        </span>
                      </div>
                    </div>

                    {/* subtle footer */}
                    <div className="mt-4 skz-divider" />
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <span>15 min</span>
                      <span className="skz-chip px-2 py-1">Interactive</span>
                    </div>
                  </Link></ParallaxCard>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 skz-divider" />
        <div className="mt-4 text-sm text-slate-600">
          Premium tip: Let kids explore freely. Use rewards and streaks to keep momentum.
        </div>
      </div>
    </div>
  );
}
