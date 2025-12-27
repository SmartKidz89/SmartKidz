"use client";

import { useEffect, useMemo, useState } from "react";
import { useActiveChild } from "@/hooks/useActiveChild";

const DEFAULT_YEAR = "3";

/**
 * Returns the currently selected year level for the active child.
 * Source of truth: localStorage key sk_year_<childId>, with fallback to child's DB year_level.
 */
export function useSelectedYear() {
  const { activeChild } = useActiveChild();
  const childId = activeChild?.id;

  const storageKey = useMemo(() => (childId ? `sk_year_${childId}` : "sk_year"), [childId]);
  const [year, setYear] = useState(DEFAULT_YEAR);

  useEffect(() => {
    const normalize = (yearLevel) => {
      if (yearLevel === null || yearLevel === undefined) return DEFAULT_YEAR;
      const v = String(yearLevel).toLowerCase();
      if (v === "0" || v === "prep" || v === "foundation") return "prep";
      const n = parseInt(v, 10);
      if (!Number.isNaN(n)) {
        if (n < 1) return "prep";
        if (n > 6) return "6";
        return String(n);
      }
      if (["1","2","3","4","5","6"].includes(v)) return v;
      return DEFAULT_YEAR;
    };

    let saved = null;
    try {
      saved = typeof window !== "undefined" ? window.localStorage.getItem(storageKey) : null;
    } catch {}

    if (saved) {
      setYear(saved);
      return;
    }
    setYear(normalize(activeChild?.year_level));
  }, [storageKey, activeChild?.year_level]);

  const updateYear = (nextYear) => {
    setYear(nextYear);
    try {
      window.localStorage.setItem(storageKey, nextYear);
    } catch {}
  };

  return { year, setYear: updateYear };
}
