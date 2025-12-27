"use client";

const KEY = "skz_daily_quests_v1";

/**
 * LocalStorage fallback. Server persistence is optional via /api/quests.
 */
export function getLocalDailyQuests(childId, dateISO) {
  if (typeof window === "undefined") return null;
  try {
    const all = JSON.parse(localStorage.getItem(KEY) || "{}");
    return all?.[childId]?.[dateISO] || null;
  } catch {
    return null;
  }
}

export function setLocalDailyQuests(childId, dateISO, quests) {
  if (typeof window === "undefined") return;
  try {
    const all = JSON.parse(localStorage.getItem(KEY) || "{}");
    all[childId] = all[childId] || {};
    all[childId][dateISO] = quests;
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {}
}
