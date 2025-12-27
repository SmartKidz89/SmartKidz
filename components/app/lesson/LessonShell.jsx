"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { HomeCloud } from "@/components/app/world/HomeCloud";
import { ProgressDots } from "@/components/ui/ProgressDots";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export function LessonShell({ title, steps }) {
  const [step, setStep] = useState(0);
  const current = useMemo(() => steps[step], [steps, step]);

  return (
    <div className="relative min-h-screen bg-[radial-gradient(900px_500px_at_20%_10%,rgba(56,189,248,0.25),transparent_60%),linear-gradient(to_bottom,#f0f9ff,#ffffff)]">
      <HomeCloud to="/app" label="World Map" />

      {/* Top bar */}
      <div className="sticky top-0 z-20 border-b border-white/60 bg-white/75 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-5 py-3">
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-600">Quest</div>
            <div className="truncate text-sm font-extrabold text-slate-900">{title}</div>
          </div>
          <ProgressDots total={steps.length} current={step + 1} />
        </div>
      </div>

      {/* Stage */}
      <div className="mx-auto max-w-4xl px-5 py-8">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <Card className="p-6">
            <div className="text-lg font-extrabold text-slate-900">{current.heading}</div>
            {current.sub && <div className="mt-1 text-sm font-semibold text-slate-600">{current.sub}</div>}
            <div className={cn("mt-5", current.stageClassName)}>{current.render({ setStep, step })}</div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <Button
                theme="kid"
                variant="secondary"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
              >
                Back
              </Button>
              <div className="flex items-center gap-2">
                {current.hint && (
                  <Button
                    theme="kid"
                    variant="ghost"
                    onClick={current.hint.onClick}
                  >
                    Hint
                  </Button>
                )}
                <Button
                  theme="kid"
                  onClick={() => {
                    if (current.onNext) {
                      const ok = current.onNext();
                      if (!ok) return;
                    }
                    setStep((s) => Math.min(steps.length - 1, s + 1));
                  }}
                  disabled={current.nextDisabled?.() ?? false}
                >
                  {step === steps.length - 1 ? "Finish" : "Next"}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
