"use client";

import { useMemo, useState } from "react";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { useActiveChild } from "@/hooks/useActiveChild";
import { playUISound, haptic } from "@/components/ui/sound";

const BLURBS = [
  { year: 0, title: "Prep / Foundation", idea: "Make a lesson about shapes you can find at home.", example: "‘Find 5 circles and 3 squares. What do you notice?’" },
  { year: 1, title: "Year 1", idea: "Make a lesson about reading a short sentence and choosing the right word.", example: "‘I can ___ to the park. (walk / walks)’" },
  { year: 2, title: "Year 2", idea: "Make a lesson about telling time or counting money.", example: "‘Show 3 different ways to make 50 cents.’" },
  { year: 3, title: "Year 3", idea: "Make a lesson about habitats or simple fractions.", example: "‘Draw a pizza split into 4 equal parts. Eat 1 part. What fraction is left?’" },
  { year: 4, title: "Year 4", idea: "Make a lesson about persuasive writing or area and perimeter.", example: "‘Write 3 reasons your school should have more sport time.’" },
  { year: 5, title: "Year 5", idea: "Make a lesson about decimals or comparing sources in HASS.", example: "‘Explain why 0.5 is the same as 1/2 with a picture.’" },
  { year: 6, title: "Year 6", idea: "Make a lesson about ratios, energy systems, or argument writing.", example: "‘Plan a healthy lunch and explain why it’s balanced.’" },
];

function makeLessonPrompt({ year, topic, world, style }) {
  const y = typeof year === "number" ? year : 2;
  const voice = y <= 1
    ? "Use very simple spoken instructions. Assume the child may not read fluently. Include audio prompts."
    : "Use simple, clear language. Include real-world examples and short quizzes.";

  return [
    `Create a 15-minute lesson for Australian Curriculum aligned learning.`,
    `Year level: ${y}. World/subject: ${world}. Topic: ${topic}.`,
    `Style: ${style}.`,
    voice,
    `Structure: 1) What is it? 2) Real-world example 3) Guided practice 4) Mini-quiz (5 questions) 5) Summary + remember tips.`,
    `Include: multiple problems, at least 2 scenarios, and answers.`
  ].join("\n");
}

export default function LessonBuilderPage() {
  const { activeChild } = useActiveChild();
  const year = typeof activeChild?.year_level === "number" ? activeChild.year_level : 2;
  const [world, setWorld] = useState("Maths");
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState("Fun and calm");
  const prompt = useMemo(() => makeLessonPrompt({ year, topic: topic || "Choose a topic", world, style }), [year, topic, world, style]);

  const blurb = useMemo(() => BLURBS.find((b) => b.year === year) || BLURBS[2], [year]);

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt);
      playUISound("complete"); haptic("light");
    } catch {}
  }

  return (
    <PageMotion className="max-w-5xl mx-auto space-y-6">
      <div className="skz-glass p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <div className="text-sm text-slate-500">Create tool</div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Lesson builder</h1>
            <p className="mt-2 text-sm md:text-base text-slate-700">
              Prompt-based lesson creation. Parents can help, or kids can create with guidance.
            </p>
          </div>
          <button className="skz-chip px-4 py-3 skz-press" onClick={() => history.back()}>Back</button>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="skz-card p-5">
            <div className="text-xs text-slate-500">Year level guide</div>
            <div className="mt-1 text-lg font-semibold">{blurb.title}</div>
            <div className="mt-2 text-sm text-slate-700">{blurb.idea}</div>
            <div className="mt-3 text-sm text-slate-600 italic">Example: {blurb.example}</div>
          </div>

          <div className="skz-card p-5 md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <div className="text-xs text-slate-500">World</div>
                <input value={world} onChange={(e) => setWorld(e.target.value)} className="mt-2 w-full skz-glass p-3 outline-none" placeholder="Maths" />
              </div>
              <div>
                <div className="text-xs text-slate-500">Topic</div>
                <input value={topic} onChange={(e) => setTopic(e.target.value)} className="mt-2 w-full skz-glass p-3 outline-none" placeholder="e.g., Fractions" />
              </div>
              <div>
                <div className="text-xs text-slate-500">Tone</div>
                <input value={style} onChange={(e) => setStyle(e.target.value)} className="mt-2 w-full skz-glass p-3 outline-none" placeholder="Fun and calm" />
              </div>
            </div>

            <div className="mt-4 skz-divider" />

            <div className="mt-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Prompt</div>
                <div className="text-xs text-slate-500">Copy this into your lesson creator (or the parent can help).</div>
              </div>
              <button className="skz-glass skz-border-animate skz-shine px-4 py-2 skz-press text-sm" onClick={copyPrompt}>
                Copy prompt
              </button>
            </div>

            <pre className="mt-3 skz-glass p-4 text-xs md:text-sm whitespace-pre-wrap text-slate-700">
              {prompt}
            </pre>

            <div className="mt-4 skz-glass p-4">
              <div className="text-sm font-semibold">Good lesson ideas for Year {year}</div>
              <ul className="mt-2 text-sm text-slate-700 list-disc pl-5 space-y-1">
                <li>Use real things at home (toys, coins, food, plants).</li>
                <li>Include 2 short scenarios (“What would you do if…?”).</li>
                <li>Finish with a mini-quiz and a simple summary.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-4 text-xs text-slate-500">
          For {activeChild?.display_name || "your child"} · Year {year}
        </div>
      </div>
    </PageMotion>
  );
}
