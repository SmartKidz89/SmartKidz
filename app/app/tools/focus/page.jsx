"use client";

import { PageMotion } from "@/components/ui/PremiumMotion";
import { useFocusMode } from "@/components/ui/FocusModeProvider";
import { playUISound, haptic } from "@/components/ui/sound";

export default function FocusToolPage() {
  const { focus, toggle } = useFocusMode();

  return (
    <PageMotion className="max-w-4xl mx-auto space-y-6">
      <div className="skz-glass p-6 md:p-8 skz-border-animate skz-shine">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-sm text-slate-500">Premium focus</div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Calm focus mode</h1>
            <p className="mt-2 text-sm md:text-base text-slate-700">
              A distraction-free experience for lessons. Great for younger learners and short practice sessions.
            </p>
          </div>
          <button className="skz-chip px-4 py-3 skz-press" onClick={() => history.back()}>Back</button>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="skz-card p-5">
            <div className="text-sm font-semibold">What it does</div>
            <ul className="mt-3 text-sm text-slate-700 list-disc pl-5 space-y-2">
              <li>Hides extra navigation and keeps the screen calm.</li>
              <li>Shows a single “Exit focus mode” button.</li>
              <li>Reduces background intensity and motion.</li>
            </ul>
          </div>
          <div className="skz-card p-5">
            <div className="text-sm font-semibold">Turn it on</div>
            <div className="mt-3 text-sm text-slate-700">
              Current status: <span className="font-semibold">{focus ? "On" : "Off"}</span>
            </div>
            <button
              className="mt-4 skz-glass skz-border-animate skz-shine px-5 py-3 skz-press"
              onClick={() => { try{ playUISound("tap"); haptic("light"); }catch{}; toggle(); }}
            >
              {focus ? "Exit focus mode" : "Enable focus mode"}
            </button>
            <div className="mt-3 text-xs text-slate-500">
              Tip: Focus mode is remembered on this device.
            </div>
          </div>
        </div>
      </div>
    </PageMotion>
  );
}
