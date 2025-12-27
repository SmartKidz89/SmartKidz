"use client";

import { useEffect, useMemo, useState } from "react";
import { useActiveChild } from "@/hooks/useActiveChild";
import { getGradeLabel, getGeoConfig } from "@/lib/marketing/geoConfig";

function normalizeYearLevel(yearLevel) {
  // year_level in DB might be numeric (e.g., 5) or string.
  if (yearLevel === null || yearLevel === undefined) return "3";
  const v = String(yearLevel).toLowerCase();
  if (v === "0" || v === "prep" || v === "foundation") return "0";
  // clamp
  const n = parseInt(v, 10);
  if (!Number.isNaN(n)) {
    if (n < 0) return "0";
    if (n > 6) return "6";
    return String(n);
  }
  return "3";
}

export default function YearSelector({ className = "" }) {
  const { activeChild } = useActiveChild();
  const childId = activeChild?.id;
  const country = activeChild?.country || "AU";
  const geo = getGeoConfig(country);

  const storageKey = useMemo(() => {
    return childId ? `sk_year_${childId}` : "sk_year";
  }, [childId]);

  const [year, setYear] = useState("3");

  const options = useMemo(() => {
    return [0, 1, 2, 3, 4, 5, 6].map(y => ({
      value: String(y),
      label: getGradeLabel(y, country)
    }));
  }, [country]);

  useEffect(() => {
    // Prefer per-child saved year, else use DB year_level.
    let saved = null;
    if (typeof window !== "undefined") {
       saved = window.localStorage.getItem(storageKey);
    }
    
    if (saved && options.some((y) => y.value === saved)) {
      setYear(saved);
      return;
    }
    const fromDb = normalizeYearLevel(activeChild?.year_level);
    setYear(fromDb);
  }, [storageKey, activeChild?.year_level, options]);

  const onChange = (e) => {
    const v = e.target.value;
    setYear(v);
    try {
      window.localStorage.setItem(storageKey, v);
    } catch {}
  };

  return (
    <div className={["flex items-center gap-2", className].join(" ")}>
      <div className="hidden sm:block text-xs font-extrabold text-slate-500">{geo.gradeTerm}</div>
      <select
        value={year}
        onChange={onChange}
        className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-extrabold text-slate-900 shadow-sm focus:outline-none focus:ring-4 focus:ring-brand-primary/20 cursor-pointer"
        aria-label={`Select ${geo.gradeTerm}`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}