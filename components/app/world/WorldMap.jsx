"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { WORLDS } from "@/data/worlds";
import { cn } from "@/lib/utils";

const TOOLS = [
  {
    id: "homework",
    name: "Homework Helper",
    icon: "📝",
    description: "Get help with homework",
    color: "bg-amber-100",
    accent: "bg-amber-500",
  },
  {
    id: "world-explorer",
    name: "World Explorer",
    icon: "🌍",
    description: "Explore places worldwide",
    color: "bg-blue-100",
    accent: "bg-blue-500",
  },
  {
    id: "dictionary",
    name: "Dictionary",
    icon: "📚",
    description: "Look up word meanings",
    color: "bg-purple-100",
    accent: "bg-purple-500",
  },
  {
    id: "storybook",
    name: "Storybook",
    icon: "📖",
    description: "Create your own stories",
    color: "bg-pink-100",
    accent: "bg-pink-500",
  },
];

function WorldTile({ world }) {
  const router = useRouter();

  const colors = {
    mountain: {
      bg: "bg-sky-100",
      accent: "bg-sky-500",
      chip: "bg-sky-500 text-white",
    },
    river: {
      bg: "bg-indigo-100",
      accent: "bg-indigo-500",
      chip: "bg-indigo-500 text-white",
    },
    forest: {
      bg: "bg-emerald-100",
      accent: "bg-emerald-500",
      chip: "bg-emerald-500 text-white",
    },
    garden: {
      bg: "bg-rose-100",
      accent: "bg-rose-500",
      chip: "bg-rose-500 text-white",
    },
  };

  const themeColors = colors[world.theme] || colors.mountain;

  return (
    <motion.button
      className={cn(
        "relative overflow-hidden rounded-2xl p-6 text-left",
        "border border-white/40 shadow-md",
        "transition-all duration-300",
        "hover:shadow-lg hover:scale-105",
        themeColors.bg
      )}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => router.push(`/app/world/${world.id}`)}
    >
      {/* Background gradient */}
      <div
        className={cn(
          "absolute inset-0 opacity-20 blur-2xl",
          themeColors.accent
        )}
      />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span
            className={cn(
              "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
              themeColors.chip
            )}
          >
            {world.name.split(" ")[0]}
          </span>
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-1">{world.name}</h3>
        <p className="text-sm font-medium text-slate-600 mb-4">{world.subtitle}</p>

        {/* Progress bar */}
        <div className="h-2.5 w-full rounded-full bg-white/60 overflow-hidden">
          <motion.div
            className={cn("h-full rounded-full", themeColors.accent)}
            initial={{ width: "0%" }}
            animate={{ width: "40%" }}
            transition={{ delay: 0.3, duration: 1 }}
          />
        </div>
      </div>
    </motion.button>
  );
}

function ToolTile({ tool }) {
  const router = useRouter();

  return (
    <motion.button
      className={cn(
        "relative overflow-hidden rounded-2xl p-6 text-left",
        "border border-white/40 shadow-md",
        "transition-all duration-300",
        "hover:shadow-lg hover:scale-105",
        tool.color
      )}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => router.push(`/app/tools/${tool.id}`)}
    >
      {/* Background gradient */}
      <div className={cn("absolute inset-0 opacity-20 blur-2xl", tool.accent)} />

      {/* Content */}
      <div className="relative z-10">
        <div className="text-4xl mb-3">{tool.icon}</div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">{tool.name}</h3>
        <p className="text-sm font-medium text-slate-600">{tool.description}</p>
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
