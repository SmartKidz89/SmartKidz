"use client";

import { useMemo, useState } from "react";
import { LessonShell } from "@/components/app/lesson/LessonShell";
import { cn } from "@/lib/utils";

function Option({ label, selected, onClick }) {
  return (
    <button
      className={cn(
        "flex-1 rounded-[var(--radius-lg)] border-2 p-4 text-left transition",
        "shadow-[var(--shadow-e1)]",
        selected ? "border-sky-500 bg-sky-50" : "border-slate-200 bg-white hover:bg-slate-50"
      )}
      onClick={onClick}
    >
      <div className="text-sm font-extrabold text-slate-900">{label}</div>
      <div className="mt-2 h-16 w-full rounded-2xl bg-[linear-gradient(to_right,rgba(14,165,233,0.35),rgba(99,102,241,0.20))]" />
    </button>
  );
}

export function MathFractionBridgeLesson() {
  const [pick, setPick] = useState(null);
  const [tries, setTries] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const steps = useMemo(() => {
    return [
      {
        heading: "Fraction Bridge",
        sub: "Let’s fix the bridge to cross the canyon.",
        render: () => (
          <div>
            <div className="rounded-[var(--radius-lg)] bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-700">
                Pick the plank that means “one half”.
              </div>
              <div className="mt-3 h-28 w-full rounded-[var(--radius-lg)] bg-[radial-gradient(400px_160px_at_50%_0%,rgba(14,165,233,0.35),transparent_60%),linear-gradient(to_bottom,#e2e8f0,#f8fafc)]" />
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {["1/2", "1/3", "1/4"].map((v) => (
                <Option
                  key={v}
                  label={v}
                  selected={pick === v}
                  onClick={() => setPick(v)}
                />
              ))}
            </div>
            {showHint && (
              <div className="mt-4 rounded-[var(--radius-lg)] border border-sky-200 bg-sky-50 p-4 text-sm font-semibold text-sky-900">
                Hint: “Half” means the whole is split into 2 equal parts.
              </div>
            )}
          </div>
        ),
        nextDisabled: () => pick == null,
        hint: { onClick: () => setShowHint(true) },
        onNext: () => {
          if (pick === "1/2") return true;
          setTries((t) => t + 1);
          setShowHint(true);
          return false;
        },
      },
      {
        heading: "Build the bridge",
        sub: "Drag the right planks into the gaps.",
        render: ({}) => (
          <div className="rounded-[var(--radius-lg)] bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-700">
              (Prototype) In the full version, you’ll drag planks into place.
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="h-40 rounded-[var(--radius-lg)] bg-white border border-slate-200 shadow-[var(--shadow-e1)]" />
              <div className="h-40 rounded-[var(--radius-lg)] bg-white border border-slate-200 shadow-[var(--shadow-e1)]" />
            </div>
          </div>
        ),
      },
      {
        heading: "You did it!",
        sub: "Your bridge is fixed — let’s continue up the mountain.",
        render: () => (
          <div className="rounded-[var(--radius-lg)] border border-emerald-200 bg-emerald-50 p-5">
            <div className="text-sm font-semibold text-emerald-900">
              Skill unlocked: Fractions (Foundations)
            </div>
            <div className="mt-3 h-28 w-full rounded-[var(--radius-lg)] bg-[radial-gradient(400px_160px_at_50%_0%,rgba(16,185,129,0.35),transparent_60%),linear-gradient(to_bottom,#dcfce7,#ffffff)]" />
          </div>
        ),
      },
    ];
  }, [pick, showHint]);

  return <LessonShell title="Math Mountains · Fraction Bridge" steps={steps} />;
}
