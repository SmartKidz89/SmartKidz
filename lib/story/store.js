"use client";

/**
 * Lightweight narrative continuity layer.
 * Keeps the platform feeling like a journey (not a checklist).
 */

const KEY = "skz_story_v1";

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function load() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || "null");
  } catch {
    return null;
  }
}

function save(v) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(v));
  } catch {}
}

export function getStoryState() {
  const base = load() || { chapter: 1, lastDay: null, streak: 0, lastNudgeAt: null };
  const t = todayKey();
  if (base.lastDay !== t) {
    base.streak = base.lastDay ? base.streak + 1 : 1;
    base.lastDay = t;
    save(base);
  }
  return base;
}

export function advanceChapter() {
  const st = getStoryState();
  st.chapter = Math.min(20, (st.chapter || 1) + 1);
  save(st);
  return st;
}

export function getDailyNarrative() {
  const st = getStoryState();
  const chapter = st.chapter || 1;
  const scenes = [
    { title: "Chapter 1: The Map Wakes Up", line: "Choose a world to explore — every lesson unlocks a new path." },
    { title: "Chapter 2: Coins of Courage", line: "Earn coins by learning, then spend them to make your avatar legendary." },
    { title: "Chapter 3: The Secret Summit", line: "Beat today’s quest to reveal a hidden trail." },
    { title: "Chapter 4: The Library Door", line: "Read one story today — it powers up your next challenge." },
    { title: "Chapter 5: The Lab Spark", line: "One good question can change everything. Try Science next." },
  ];
  const idx = (chapter - 1) % scenes.length;
  const scene = scenes[idx];
  return { ...scene, chapter, streak: st.streak || 0 };
}
