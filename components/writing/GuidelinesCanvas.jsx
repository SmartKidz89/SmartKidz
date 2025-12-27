"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

/**
 * Placeholder implementation.
 * The app expects a handwriting canvas-like component; for production,
 * replace with an actual stroke-capture canvas. This version preserves
 * the API surface so builds and basic flows work.
 */
export default function GuidelinesCanvas({
  preset,
  lineSpacing = 34,
  traceText = "",
  traceOpacity = 0.35,
  dashedTrace = false,
  onChange,
  onMeta,
  className = "",
}) {
  const [text, setText] = useState("");

  const meta = useMemo(() => {
    return {
      preset: preset || null,
      lineSpacing,
      traceText,
      traceOpacity,
      dashedTrace,
      mode: "fallback-text",
    };
  }, [preset, lineSpacing, traceText, traceOpacity, dashedTrace]);

  useEffect(() => {
    onMeta?.(meta);
  }, [meta, onMeta]);

  useEffect(() => {
    // Represent a "stroke set" as a simple array containing the typed text.
    onChange?.([{ type: "text", value: text }]);
  }, [text, onChange]);

  return (
    <Card className={cn("p-4", className)}>
      <div className="text-sm font-semibold text-slate-900">Writing Pad</div>
      <div className="mt-1 text-xs text-slate-600">
        Canvas module not present; using a text fallback to keep the learning flow functional.
      </div>

      {traceText ? (
        <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-700">
          <div className="text-[11px] uppercase tracking-wide text-slate-500">Trace</div>
          <div className="mt-1 whitespace-pre-wrap">{traceText}</div>
        </div>
      ) : null}

      <textarea
        className="mt-3 min-h-[180px] w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:ring-2 focus:ring-slate-400"
        placeholder="Type your answer here…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
    </Card>
  );
}
