"use client";

import { useMemo, useState } from "react";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { useActiveChild } from "@/hooks/useActiveChild";
import { playUISound, haptic } from "@/components/ui/sound";

const WORLDS = [
  { id: "MAT", label: "Maths" },
  { id: "ENG", label: "English" },
  { id: "SCI", label: "Science" },
  { id: "HASS", label: "HASS" },
  { id: "HPE", label: "HPE" },
  { id: "ARTS", label: "The Arts" },
  { id: "TECH", label: "Technologies" },
  { id: "LANG", label: "Languages" },
];

function buildWorksheet({ world, year }) {
  // Premium but lightweight: generates structured content that can be printed.
  const titleMap = { MAT: "Maths Practice", ENG: "English Practice", SCI: "Science Practice", HASS: "HASS Practice", HPE: "HPE Practice", ARTS: "The Arts Practice", TECH: "Technologies Practice", LANG: "Languages Practice" };
  const title = `${titleMap[world] || "Practice"} — Year ${year ?? "?"}`;
  const instructions = year <= 1
    ? "Say the questions out loud. Point to pictures or numbers. Try your best."
    : "Read each question. Show your thinking. Try the bonus challenge.";

  const items = [];
  for (let i = 1; i <= 10; i++) {
    items.push({
      q: world === "MAT"
        ? `Question ${i}: Circle the biggest number: ${i+2}, ${i+5}, ${i+1}`
        : world === "ENG"
        ? `Question ${i}: Read the sentence and choose the best word: "I can ___ the ball." (kick / kicks)`
        : `Question ${i}: Explain in one sentence: What is something you can observe?`,
      a: world === "MAT" ? `${i+5}` : world === "ENG" ? "kick" : "Any sensible observation (e.g., 'I can observe a plant growing')."
    });
  }

  const bonus = world === "MAT"
    ? "Bonus: Make your own number story using 5 + 3."
    : world === "ENG"
    ? "Bonus: Write (or say) a sentence using the word: 'because'."
    : "Bonus: Draw a picture of what you learned and label 3 parts.";

  return { title, instructions, items, bonus };
}

export default function WorksheetBuilderPage() {
  const { activeChild } = useActiveChild();
  const [world, setWorld] = useState("MAT");
  const year = typeof activeChild?.year_level === "number" ? activeChild.year_level : 2;

  const sheet = useMemo(() => buildWorksheet({ world, year }), [world, year]);

  function printNow() {
    try { playUISound("tap"); haptic("light"); } catch {}
    window.print();
  }

  return (
    <PageMotion className="max-w-5xl mx-auto space-y-6">
      <div className="skz-glass p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <div className="text-sm text-slate-500">Practice tool</div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Interactive worksheet builder</h1>
            <p className="mt-2 text-sm md:text-base text-slate-700">
              Generate a quick practice sheet. You can complete it on screen or print it.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="skz-chip px-4 py-3 skz-press" onClick={() => history.back()}>Back</button>
            <button className="skz-glass skz-border-animate skz-shine px-5 py-3 skz-press" onClick={printNow}>
              Print
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="skz-card p-4">
            <div className="text-xs text-slate-500">Child</div>
            <div className="text-lg font-semibold">{activeChild?.display_name || "Your child"}</div>
            <div className="text-sm text-slate-600">Year {year}</div>
          </div>
          <div className="skz-card p-4 md:col-span-2">
            <div className="text-xs text-slate-500 mb-2">Choose a world</div>
            <div className="flex flex-wrap gap-2">
              {WORLDS.map((w) => (
                <button
                  key={w.id}
                  className={`skz-chip px-3 py-2 skz-press text-sm ${world === w.id ? "ring-2 ring-indigo-400/60" : ""}`}
                  onClick={() => { try{ playUISound("tap"); }catch{}; setWorld(w.id); }}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Printable area */}
      <div className="skz-card p-6 md:p-8 skz-shine">
        <div className="text-xs text-slate-500">Worksheet</div>
        <h2 className="text-2xl font-semibold mt-1">{sheet.title}</h2>
        <p className="text-sm text-slate-700 mt-2">{sheet.instructions}</p>

        <div className="mt-6 space-y-4">
          {sheet.items.map((it, idx) => (
            <div key={idx} className="skz-glass p-4">
              <div className="font-semibold text-slate-800">{it.q}</div>
              <details className="mt-2">
                <summary className="text-sm text-slate-600 cursor-pointer">Show answer</summary>
                <div className="mt-2 text-sm text-slate-700">{it.a}</div>
              </details>
            </div>
          ))}
        </div>

        <div className="mt-6 skz-glass p-4">
          <div className="text-sm font-semibold">Bonus challenge</div>
          <div className="text-sm text-slate-700 mt-1">{sheet.bonus}</div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          header, nav, .no-print { display: none !important; }
          body { background: white !important; }
          .skz-glass, .skz-card { box-shadow: none !important; }
        }
      `}</style>
    </PageMotion>
  );
}
