"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

/**
 * Minimal replay viewer for writing attempts.
 * Expects `attempt` rows with response_json.
 */
export default function AttemptReplay({ attempt, className = "" }) {
  const payload = useMemo(() => {
    const raw = attempt?.response_json ?? attempt?.response ?? attempt ?? null;
    try {
      if (typeof raw === "string") return JSON.parse(raw);
      return raw;
    } catch {
      return raw;
    }
  }, [attempt]);

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-900">Attempt Replay</div>
          <div className="text-xs text-slate-600 truncate">
            {attempt?.activity_id ? `Activity: ${attempt.activity_id}` : "Selected attempt"}
          </div>
        </div>
      </div>

      <pre className="mt-3 max-h-[420px] overflow-auto rounded-xl bg-slate-950 p-3 text-xs text-slate-100">
{JSON.stringify(payload, null, 2)}
      </pre>
    </Card>
  );
}
