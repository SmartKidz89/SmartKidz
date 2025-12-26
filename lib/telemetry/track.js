"use client";

import posthog from "posthog-js";

/**
 * Safe client-side tracking wrapper.
 * - No-ops when analytics is not configured.
 * - Designed to be called from anywhere in UI.
 */
export function track(event, properties = {}) {
  try {
    if (typeof window === "undefined") return;
    // posthog-js may not be initialized if env vars absent
    if (!posthog?.__loaded) return;
    posthog.capture(event, properties);
  } catch {
    // ignore
  }
}

export function identify(userId, traits = {}) {
  try {
    if (typeof window === "undefined") return;
    if (!posthog?.__loaded) return;
    posthog.identify(userId, traits);
  } catch {}
}

export function setGroup(type, key, traits = {}) {
  try {
    if (typeof window === "undefined") return;
    if (!posthog?.__loaded) return;
    posthog.group(type, key, traits);
  } catch {}
}
