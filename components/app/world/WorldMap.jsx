"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRouter } from "next/navigation";
import { WORLDS } from "@/data/worlds";
import { cn } from "@/lib/utils";
import StoryRibbon from "@/components/app/StoryRibbon";

function WorldPin({ world }) {
  const router = useRouter();
  const tone = world.theme;

  const chip =
    tone === "mountain"
      ? "bg-sky-500 text-white"
      : tone === "river"
      ? "bg-indigo-500 text-white"
      : tone === "forest"
      ? "bg-emerald-500 text-white"
      : "bg-rose-500 text-white";

  return (
    <motion.button
      className={cn(
        "absolute -translate-x-1/2 -translate-y-1/2",
        "rounded-[var(--radius-lg)] px-4 py-3 shadow-[var(--shadow-e1)]",
        "backdrop-blur bg-white/85 border border-white/60",
        "text-left"
      )}
      style={{ left: `${world.mapPos.x}%`, top: `${world.mapPos.y}%` }}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => router.push(`/app/world/${world.id}`)}
      aria-label={world.name}
    >
      <div className="flex items-center gap-2">
        <span className={cn("inline-flex rounded-full px-2 py-1 text-xs font-semibold", chip)}>
          {world.name.split(" ")[0]}
        </span>
        <div className="text-sm font-extrabold text-slate-900">{world.name}</div>
      </div>
      <div className="mt-1 text-xs font-semibold text-slate-600">{world.subtitle}</div>
      <div className="mt-2 h-2 w-full rounded-full bg-slate-200 overflow-hidden">
        <div className="h-full w-2/5 rounded-full bg-sky-500" />
      </div>
    </motion.button>
  );
}

export function WorldMap() {
  const router = useRouter();
  // Gentle parallax based on mouse position.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 70, damping: 14 });
  const sy = useSpring(my, { stiffness: 70, damping: 14 });

  return (
    <div
      className="relative h-screen w-screen overflow-hidden"
      onMouseMove={(e) => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        mx.set((e.clientX - cx) / 60);
        my.set((e.clientY - cy) / 60);
      }}
    >      {/* Sky */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_15%_0%,rgba(59,130,246,.22),transparent_60%),radial-gradient(900px_520px_at_92%_10%,rgba(16,185,129,.18),transparent_60%),radial-gradient(900px_520px_at_55%_105%,rgba(245,158,11,.16),transparent_62%),linear-gradient(to_bottom,#f8fafc,#ffffff)]" />
        <div className="absolute inset-0 opacity-60 [mask-image:radial-gradient(700px_320px_at_50%_0%,black,transparent_70%)] bg-[url('/textures/noise.png')] bg-repeat" />
        <motion.div
          aria-hidden
          className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, 18, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute -bottom-28 -right-28 h-80 w-80 rounded-full bg-emerald-200/35 blur-3xl"
          animate={{ x: [0, -26, 0], y: [0, -14, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Floating island layer */}
      <motion.div
        className="absolute inset-0"
        style={{ x: sx, y: sy }}
        aria-hidden="true"
      >
        <div className="absolute left-1/2 top-1/2 h-[900px] w-[1100px] -translate-x-1/2 -translate-y-1/2 rounded-[48px] bg-white/35 blur-[2px]" />
        <div className="absolute left-1/2 top-1/2 h-[860px] w-[1060px] -translate-x-1/2 -translate-y-1/2 rounded-[46px] bg-white/45 shadow-[var(--shadow-e1)] border border-white/60" />

        {/* Decorative terrain blobs */}
        <div className="absolute left-[18%] top-[28%] h-44 w-72 rounded-[999px] bg-emerald-200/60 blur-[1px]" />
        <div className="absolute left-[62%] top-[22%] h-40 w-64 rounded-[999px] bg-emerald-200/55 blur-[1px]" />
        <div className="absolute left-[24%] top-[56%] h-28 w-80 rounded-[999px] bg-indigo-200/55 blur-[1px]" />
        <div className="absolute left-[58%] top-[62%] h-32 w-72 rounded-[999px] bg-rose-200/55 blur-[1px]" />

        {/* Trails */}
        <div className="absolute left-[26%] top-[52%] h-1 w-56 rotate-[12deg] rounded-full bg-white/70" />
        <div className="absolute left-[44%] top-[40%] h-1 w-64 rotate-[-8deg] rounded-full bg-white/70" />
        <div className="absolute left-[52%] top-[26%] h-1 w-44 rotate-[18deg] rounded-full bg-white/70" />
      </motion.div>

      {/* Title */}
      <div className="pointer-events-none absolute left-1/2 top-8 z-10 -translate-x-1/2 text-center">
        <div className="text-sm font-semibold text-slate-700">Your Learning World</div>
        <div className="text-2xl font-extrabold text-slate-900">Where to next?</div>
      </div>

      <StoryRibbon />

      {/* Pins */}
      <div className="absolute inset-0 z-20">
        {WORLDS.map((w) => (
          <WorldPin key={w.id} world={w} />
        ))}
      </div>

      {/* Helper */}
      <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-full bg-white/80 px-5 py-2 text-xs font-semibold text-slate-700 shadow-[var(--shadow-e1)] backdrop-blur">
        Tip: Tap a world to travel. Your path will grow as you learn.
      </div>
</div>
  );
}
