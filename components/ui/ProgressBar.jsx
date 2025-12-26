import { cn } from "@/lib/utils";

/**
 * Lightweight progress bar: value 0..1 or 0..100.
 */
export function ProgressBar({ value = 0, className = "", barClassName = "" }) {
  const v = Number(value);
  const pct = Number.isFinite(v) ? (v <= 1 ? v * 100 : v) : 0;
  const clamped = Math.max(0, Math.min(100, pct));

  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-slate-200", className)}>
      <div
        className={cn("h-full rounded-full bg-slate-900 transition-[width] duration-300", barClassName)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
