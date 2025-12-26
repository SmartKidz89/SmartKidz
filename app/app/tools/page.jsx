"use client";

import { PageMotion } from "@/components/ui/PremiumMotion";

const TOOLS = [
  { href: "/app/tools/worksheet", label: "🧾 Worksheet builder" },
  { href: "/app/tools/homework", label: "📝 Homework generator" },
  { href: "/app/tools/dictionary", label: "📖 Dictionary" },
  { href: "/app/tools/lesson-builder", label: "🧠 Lesson builder" },
  { href: "/app/tools/storybook", label: "📘 Learning storybook" },
  { href: "/app/tools/curiosity", label: "🔎 Curiosity explorer" },
  { href: "/app/tools/focus", label: "🧘 Calm focus mode" },
  { href: "/app/tools/reflection", label: "🌱 Reflection & confidence" },
  { href: "/app/tools/timeline", label: "🧾 Achievement timeline" },
  { href: "/app/tools/world-explorer", label: "🌍 World explorer (3D map)" },
];

export default function ToolsIndex() {
  return (
    <PageMotion className="max-w-5xl mx-auto space-y-6">
      <div className="skz-glass p-6 md:p-8">
        <div className="text-sm text-slate-500">Tools</div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Learning tools</h1>
        <p className="mt-2 text-sm md:text-base text-slate-700">
          Pick a tool to practise, explore, or generate new learning activities.
        </p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-6 gap-4">
          {TOOLS.map((t) => (
            <a key={t.href} className="skz-card p-5 skz-press skz-glow" href={t.href}>
              {t.label}
            </a>
          ))}
        </div>
      </div>
    </PageMotion>
  );
}
