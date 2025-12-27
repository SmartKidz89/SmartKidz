"use client";

import { useEffect, useMemo, useState } from "react";
import { useActiveChild } from "@/hooks/useActiveChild";

const YEAR_OPTIONS = [
  { label: "Prep", value: "prep" },
  { label: "Year 1", value: "1" },
  { label: "Year 2", value: "2" },
  { label: "Year 3", value: "3" },
  { label: "Year 4", value: "4" },
  { label: "Year 5", value: "5" },
  { label: "Year 6", value: "6" },
];

function normalizeYearLevel(yearLevel) {
  // year_level in DB might be numeric (e.g., 5) or string.
  if (yearLevel === null || yearLevel === undefined) return "3";
  const v = String(yearLevel).toLowerCase();
  if (v === "0" || v === "prep" || v === "foundation") return "prep";
  if (YEAR_OPTIONS.some((y) => y.value === v)) return v;
  // clamp
  const n = parseInt(v, 10);
  if (!Number.isNaN(n)) {
    if (n < 1) return "prep";
    if (n > 6) return "6";
    return String(n);
  }
  return "3";
}

export default function YearSelector({ className = "" }) {
  const { activeChild } = useActiveChild();
  const childId = activeChild?.id;

  const storageKey = useMemo(() => {
    return childId ? `sk_year_${childId}` : "sk_year";
  }, [childId]);

  const [year, setYear] = useState("3");

  useEffect(() => {
    // Prefer per-child saved year, else use DB year_level.
    const saved = typeof window !== "undefined" ? window.localStorage.getItem(storageKey) : null;
    if (saved && YEAR_OPTIONS.some((y) => y.value === saved)) {
      setYear(saved);
      return;
    }
    const fromDb = normalizeYearLevel(activeChild?.year_level);
    setYear(fromDb);
  }, [storageKey, activeChild?.year_level]);

  const onChange = (e) => {
    const v = e.target.value;
    setYear(v);
    try {
      window.localStorage.setItem(storageKey, v);
    } catch {}
  };

  return (
    <div className={["flex items-center gap-2", className].join(" ")}>
      <div className="hidden sm:block text-xs font-extrabold text-slate-500">Year</div>
      <select
        value={year}
        onChange={onChange}
        className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-extrabold text-slate-900 shadow-sm focus:outline-none focus:ring-4 focus:ring-brand-primary/20"
        aria-label="Select year level"
      >
        {YEAR_OPTIONS.map((y) => (
          <option key={y.value} value={y.value}>
            {y.label}
          </option>
        ))}
      </select>
    </div>
  );
}
