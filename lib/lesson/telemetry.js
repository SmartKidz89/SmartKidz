"use client";

/**
 * Lesson telemetry is intentionally lightweight and privacy-safe.
 * It records interaction timing and correctness signals locally for:
 * - mastery weighting
 * - recommendations
 * - parent outcome reporting
 *
 * Storage: localStorage (always). Server sync can be added later.
 */
// v2 adds hint usage counters. Backwards compatible with v1.
const LS_PREFIX = "skz_lesson_telem_v2";

function keyFor({ childId, lessonId }) {
  return `${LS_PREFIX}:${childId || "anon"}:${lessonId}`;
}

function now() {
  return Date.now();
}

function loadRaw(k) {
  try {
    if (typeof window === "undefined") return null;
    return JSON.parse(window.localStorage.getItem(k) || "null");
  } catch {
    return null;
  }
}

function saveRaw(k, v) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(k, JSON.stringify(v));
  } catch {}
}

function defaultState() {
  return {
    version: 2,
    startedAt: now(),
    lastEventAt: now(),
    // Per-question stats keyed by qKey
    questions: {},
    // Session-level aggregates
    summary: {
      activeMs: 0,
      attempts: 0,
      hints: 0,
      correct: 0,
      totalKeyed: 0,
    },
  };
}

function getQ(state, qKey) {
  if (!state.questions[qKey]) {
    state.questions[qKey] = {
      firstSeenAt: null,
      firstInteractAt: null,
      lastInteractAt: null,
      activeMs: 0,
      attempts: 0,
      hints: 0,
      correct: 0,
      totalKeyed: 0,
      type: null,
    };
  }
  return state.questions[qKey];
}

function migrateIfNeeded(state) {
  if (!state || typeof state !== "object") return defaultState();
  if (!state.summary) state.summary = {};
  if (state.summary.hints == null) state.summary.hints = 0;
  if (!state.questions) state.questions = {};
  for (const q of Object.values(state.questions)) {
    if (q && q.hints == null) q.hints = 0;
  }
  state.version = 2;
  return state;
}

export const lessonTelemetry = {
  startSession({ childId, lessonId }) {
    const k = keyFor({ childId, lessonId });
    const state = migrateIfNeeded(loadRaw(k) || defaultState());

    function touchActive(q, t) {
      if (!q.firstInteractAt) q.firstInteractAt = t;
      if (q.lastInteractAt) q.activeMs += Math.max(0, t - q.lastInteractAt);
      q.lastInteractAt = t;
    }

    return {
      recordView({ qKey, type }) {
        const t = now();
        const q = getQ(state, qKey);
        if (!q.firstSeenAt) q.firstSeenAt = t;
        if (type && !q.type) q.type = type;
        state.lastEventAt = t;
        saveRaw(k, state);
      },

      recordAttempt({ qKey, type, correct }) {
        const t = now();
        const q = getQ(state, qKey);
        if (!q.firstSeenAt) q.firstSeenAt = t;
        if (type) q.type = type;

        touchActive(q, t);

        q.attempts += 1;
        state.summary.attempts += 1;

        if (correct !== null && correct !== undefined) {
          q.totalKeyed += 1;
          state.summary.totalKeyed += 1;
          if (correct) {
            q.correct += 1;
            state.summary.correct += 1;
          }
        }

        state.lastEventAt = t;
        saveRaw(k, state);
      },

      recordHint({ qKey, type } = {}) {
        const t = now();
        const q = getQ(state, qKey || "__session__");
        if (type) q.type = type;
        touchActive(q, t);
        q.hints += 1;
        state.summary.hints += 1;
        state.lastEventAt = t;
        saveRaw(k, state);
      },

      finalize({ accuracy } = {}) {
        // Convert per-question activeMs into session activeMs.
        let activeMs = 0;
        for (const q of Object.values(state.questions)) activeMs += q.activeMs || 0;
        state.summary.activeMs = activeMs;

        if (typeof accuracy === "number") state.summary.accuracy = accuracy;

        saveRaw(k, state);
        return state;
      },

      summary() {
        const s = loadRaw(k);
        return s?.summary || null;
      },
    };
  },
};
