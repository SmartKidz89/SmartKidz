"use client";

import { PageMotion } from "@/components/ui/PremiumMotion";
import { useActiveChild } from "@/hooks/useActiveChild";

export default function ParentTimelinePage() {
  const { activeChild } = useActiveChild();
  return (
    <PageMotion className="max-w-6xl mx-auto space-y-6">
      <div className="skz-glass p-6 md:p-8 skz-border-animate skz-shine">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-sm text-slate-500">Family hub</div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Achievement timeline</h1>
            <div className="mt-2 text-sm text-slate-700">
              A printable view of milestones and growth.
            </div>
          </div>
          <button className="skz-chip px-4 py-3 skz-press" onClick={() => history.back()}>Back</button>
        </div>
      </div>

      <div className="skz-card p-6">
        <div className="text-sm text-slate-700">
          Timeline features are being rebuilt to align with the streamlined learning experience.
        </div>
        <div className="mt-3 text-sm text-slate-500">
          Check back soon for a printable view of milestones and progress for <span className="font-semibold">{activeChild?.display_name || "your child"}</span>.
        </div>
      </div>
    </PageMotion>
  );
}
