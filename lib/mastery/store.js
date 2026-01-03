/**
 * Mastery store: client-side canonical store with optional server persistence.
 * - Always works (localStorage).
 * - If backend is configured, also syncs to /api/mastery (best effort).
 */
const KEY = "skz_mastery_v1";

function safeParse(raw, fallback) {
  try { return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
}

export function loadMastery() {
  if (typeof window === "undefined") return { updatedAt: 0, bySkill: {} };
  return safeParse(window.localStorage.getItem(KEY), { updatedAt: 0, bySkill: {} });
}

export function saveMastery(state) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(state));
}

export function getSkillMastery(skillId) {
  const st = loadMastery();
  return Number(st.bySkill?.[skillId] ?? 0);
}

export function applyMasteryDelta(skillIds, delta) {
  const st = loadMastery();
  const bySkill = { ...(st.bySkill || {}) };
  const d = Number(delta) || 0;

  for (const id of (skillIds || [])) {
    const cur = Number(bySkill[id] ?? 0);
    const next = Math.max(0, Math.min(100, cur + d));
    bySkill[id] = Math.round(next * 10) / 10;
  }

  const nextState = { updatedAt: Date.now(), bySkill };
  saveMastery(nextState);
  return nextState;
}

export async function syncMasteryToServer(childId, state) {
  try {
    const res = await fetch("/api/mastery", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ childId, state }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
