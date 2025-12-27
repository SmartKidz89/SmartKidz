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

export function WorldsAndToolsGrid() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="border-b border-slate-200/60 bg-white/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-slate-900">Your Learning World</h1>
          <p className="text-sm text-slate-600">Choose a world to explore or use a tool</p>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Worlds Section */}
        <section className="mb-16">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900">Learning Worlds</h2>
            <p className="text-sm text-slate-600 mt-1">
              Tap a world to explore lessons and unlock new skills
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {WORLDS.map((world) => (
              <WorldTile key={world.id} world={world} />
            ))}
          </div>
        </section>

        {/* Tools Section */}
        <section>
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900">Tools & Resources</h2>
            <p className="text-sm text-slate-600 mt-1">
              Use these tools to help with learning and exploration
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TOOLS.map((tool) => (
              <ToolTile key={tool.id} tool={tool} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
