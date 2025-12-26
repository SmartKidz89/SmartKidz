"use client";
import { PageMotion } from "@/components/ui/PremiumMotion";

export default function ToolsIndex() {
  return (
    <PageMotion className="max-w-5xl mx-auto space-y-6">
      <div className="skz-glass p-6 md:p-8">
        <div className="text-sm text-slate-500">Tools</div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Learning tools</h1>
        <p className="mt-2 text-sm md:text-base text-slate-700">
          Choose a tool: worksheet builder, dictionary, or lesson builder.
        </p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-6 gap-4">
          <a className="skz-card p-5 skz-press skz-glow" href="/app/tools/worksheet">🧾 Worksheet builder</a>
          <a className="skz-card p-5 skz-press skz-glow" href="/app/tools/dictionary">📖 Dictionary</a>
          <a className="skz-card p-5 skz-press skz-glow" href="/app/tools/lesson-builder">🧠 Lesson builder</a>
                  <a className="skz-card p-5 skz-press skz-glow" href="/app/tools/storybook">📘 Learning storybook</a>
                  <a className="skz-card p-5 skz-press skz-glow" href="/app/tools/curiosity">🔎 Curiosity explorer</a>
                  <a className="skz-card p-5 skz-press skz-glow" href="/app/tools/focus">🧘 Calm focus mode</a>
                  <a className="skz-card p-5 skz-press skz-glow" href="/app/tools/reflection">🌱 Reflection & confidence</a>
                  <a className="skz-card p-5 skz-press skz-glow" href="/app/tools/timeline">🧾 Achievement timeline</a>
        </div>
      </div>
    </PageMotion>
  );
}
