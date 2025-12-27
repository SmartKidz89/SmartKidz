"use client";

export default function TodayProgress({ value = 0 }) {
  const pct = Math.max(0, Math.min(100, (value / 3) * 100));
  return (
    <div className="w-full">
      <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
        <div className="h-2 rounded-full bg-slate-900" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-2 text-xs text-slate-600">{value}/3 complete</div>
    </div>
  );
}
