"use client";

import { cn } from "@/lib/utils";

export function ProgressDots({ total = 5, current = 1, className }) {
  return (
    <div className={cn("flex items-center gap-1", className)} aria-label="Lesson progress">
      {Array.from({ length: total }).map((_, i) => {
        const active = i < current;
        return (
          <span
            key={i}
            className={cn(
              "h-2 w-2 rounded-full transition",
              active ? "bg-sky-500" : "bg-slate-200"
            )}
          />
        );
      })}
    </div>
  );
}
