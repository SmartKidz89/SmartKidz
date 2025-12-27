"use client";

export const TODAY_MISSIONS = ["reading", "writing", "maths"];

export function localDateISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function sessionKey(userId) {
  const uid = userId || "anon";
  return `smartkidz_today_${uid}_${localDateISO()}`;
}

function defaultSession() {
  return {
    date: localDateISO(),
    missions: {
      reading: { done: false, startedAt: null, completedAt: null },
      writing: { done: false, startedAt: null, completedAt: null },
      maths: { done: false, startedAt: null, completedAt: null },
    },
  };
}

export function getTodaySession(userId) {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(sessionKey(userId));
    if (!raw) return defaultSession();
    const parsed = JSON.parse(raw);
    if (!parsed?.missions) return defaultSession();
    return parsed;
  } catch {
    return defaultSession();
  }
}

export function saveTodaySession(userId, session) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(sessionKey(userId), JSON.stringify(session));
  } catch {}
}

export function markMissionStarted(userId, mission) {
  const s = getTodaySession(userId) || defaultSession();
  if (!s.missions?.[mission]) return s;
  if (!s.missions[mission].startedAt) s.missions[mission].startedAt = Date.now();
  saveTodaySession(userId, s);
  return s;
}

export function markMissionComplete(userId, mission) {
  const s = getTodaySession(userId) || defaultSession();
  if (!s.missions?.[mission]) return s;
  s.missions[mission].done = true;
  s.missions[mission].completedAt = Date.now();
  if (!s.missions[mission].startedAt) s.missions[mission].startedAt = Date.now();
  saveTodaySession(userId, s);
  return s;
}

export function progressCount(session) {
  if (!session?.missions) return 0;
  return TODAY_MISSIONS.reduce((acc, m) => acc + (session.missions[m]?.done ? 1 : 0), 0);
}

export function isComplete(session) {
  return progressCount(session) >= 3;
}
