"use client";

/**
 * Shared progress log used for parent insights and general outcome reporting.
 * Always stored locally (localStorage). Server sync can be layered later.
 */
const KEY = "skz_progress_log";

function safeParse(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function readProgressLog() {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(KEY), []);
}

export function appendProgress(entry) {
  if (typeof window === "undefined") return;
  const existing = readProgressLog();
  existing.unshift({ ts: Date.now(), ...entry });
  window.localStorage.setItem(KEY, JSON.stringify(existing.slice(0, 400)));
}

