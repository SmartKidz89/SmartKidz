"use client";

/**
 * Convert raw telemetry + accuracy into actionable learning signals.
 * This is intentionally heuristic (transparent + tunable) rather than opaque.
 */

export function deriveLearningSignals({ accuracy = 1, summary } = {}) {
  const s = summary || {};
  const activeMs = Number(s.activeMs || 0);
  const attempts = Number(s.attempts || 0);
  const hints = Number(s.hints || 0);
  const totalKeyed = Number(s.totalKeyed || 0);

  // Normalize
  const acc = Math.max(0, Math.min(1, Number.isFinite(accuracy) ? accuracy : 1));
  const minutes = activeMs / 60000;

  // Confidence: accuracy weighted by attempts/hints density.
  const effortPenalty = Math.min(0.35, (attempts * 0.03) + (hints * 0.05));
  const confidence = Math.max(0, Math.min(1, acc - effortPenalty));

  // Frustration / boredom heuristics. Keep conservative to avoid mislabelling.
  const frustrated = (minutes >= 1.2 && attempts >= 4 && acc < 0.65) || (hints >= 3 && acc < 0.7);
  const bored = totalKeyed > 0 && minutes <= 0.35 && attempts <= 2 && acc >= 0.92;
  const inFlow = !frustrated && !bored;

  let state = "flow";
  if (frustrated) state = "frustrated";
  if (bored) state = "bored";

  // Coaching message (kid-safe, positive framing).
  let coachTitle = "Nice work!";
  let coachHint = "Keep going — you’re building skills every time you try.";
  if (state === "frustrated") {
    coachTitle = "You’re doing the hard part.";
    coachHint = "Try a hint, slow down, and do one step at a time. You’ve got this.";
  } else if (state === "bored") {
    coachTitle = "Too easy?";
    coachHint = "Want a bigger challenge? Try a harder lesson or Challenge Mode.";
  } else if (confidence >= 0.85) {
    coachTitle = "You’re on fire.";
    coachHint = "Ready for the next level? Let’s level up your streak.";
  }

  return {
    state,
    confidence,
    minutes,
    attempts,
    hints,
    accuracy: acc,
    coach: { title: coachTitle, hint: coachHint },
  };
}
