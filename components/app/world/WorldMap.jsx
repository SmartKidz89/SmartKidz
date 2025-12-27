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

const DASHBOARD_CARDS = [
  {
    id: "continue-learning",
    title: "Continue Learning",
    icon: "📚",
    description: "Jump back into your lessons",
    href: "/app/worlds",
    color: "from-blue-50 to-indigo-50",
    accent: "text-blue-600",
  },
  {
    id: "daily-quests",
    title: "Today's Quests",
    icon: "⭐",
    description: "Complete daily challenges",
    href: "/app/today",
    color: "from-amber-50 to-orange-50",
    accent: "text-amber-600",
  },
  {
    id: "rewards",
    title: "My Rewards",
    icon: "🏆",
    description: "Check your achievements",
    href: "/app/rewards",
    color: "from-emerald-50 to-teal-50",
    accent: "text-emerald-600",
  },
  {
    id: "world-explorer",
    title: "World Explorer",
    icon: "🌍",
    description: "Explore places worldwide",
    href: "/app/tools/world-explorer",
    color: "from-pink-50 to-rose-50",
    accent: "text-pink-600",
  },
];

export function WorldMap() {
  const router = useRouter();

  return (
    <div className="w-full bg-white">
      {/* Hero / Welcome Section */}
      <section className="mb-12">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900">
            Welcome Back!
          </h1>
          <p className="text-lg text-slate-600">
            Ready to explore and learn something amazing today?
          </p>
        </div>
      </section>

      {/* Quick Stats Section */}
      <section className="grid grid-cols-3 gap-4 mb-12">
        <motion.div
          className="rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 p-5 border border-blue-200/50"
          whileHover={{ y: -2 }}
        >
          <div className="text-3xl font-black text-blue-600 mb-1">42</div>
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wide">
            Lessons Complete
          </div>
        </motion.div>

        <motion.div
          className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-5 border border-amber-200/50"
          whileHover={{ y: -2 }}
        >
          <div className="text-3xl font-black text-amber-600 mb-1">1,240</div>
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wide">
            XP Earned
          </div>
        </motion.div>

        <motion.div
          className="rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 p-5 border border-emerald-200/50"
          whileHover={{ y: -2 }}
        >
          <div className="text-3xl font-black text-emerald-600 mb-1">8</div>
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wide">
            Day Streak
          </div>
        </motion.div>
      </section>

      {/* Main Navigation Cards */}
      <section className="mb-16">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Quick Actions</h2>
          <p className="text-sm text-slate-600 mt-1">Jump to what you need</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {DASHBOARD_CARDS.map((card) => (
            <motion.button
              key={card.id}
              onClick={() => router.push(card.href)}
              className={cn(
                "relative overflow-hidden rounded-2xl p-6 text-left",
                "border border-slate-200 shadow-sm",
                "transition-all duration-300",
                "hover:shadow-md hover:border-slate-300",
                `bg-gradient-to-br ${card.color}`
              )}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute top-3 right-3 text-3xl opacity-20">
                {card.icon}
              </div>

              <div className="relative z-10">
                <div className={cn("text-3xl mb-3", card.accent)}>
                  {card.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  {card.title}
                </h3>
                <p className="text-sm text-slate-600">{card.description}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Learning Worlds Section */}
      <section className="mb-16">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Learning Worlds</h2>
          <p className="text-sm text-slate-600 mt-1">
            Explore different subjects and build your skills
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {WORLDS.map((world) => (
            <WorldTile key={world.id} world={world} />
          ))}
        </div>
      </section>

      {/* Tools & Resources Section */}
      <section className="mb-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Tools & Resources</h2>
          <p className="text-sm text-slate-600 mt-1">
            Extra tools to support your learning
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TOOLS.map((tool) => (
            <ToolTile key={tool.id} tool={tool} />
          ))}
        </div>
      </section>
    </div>
  );
}
