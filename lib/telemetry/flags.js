"use client";

import posthog from "posthog-js";
import { useEffect, useState } from "react";

/**
 * Feature flags via PostHog (optional).
 * Falls back to the provided default value when not available.
 */
export function useFlag(flagKey, defaultValue = false) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    try {
      if (!posthog?.__loaded) {
        setValue(defaultValue);
        return;
      }
      const v = posthog.isFeatureEnabled(flagKey);
      setValue(typeof v === "boolean" ? v : defaultValue);

      const handler = () => {
        const next = posthog.isFeatureEnabled(flagKey);
        setValue(typeof next === "boolean" ? next : defaultValue);
      };
      posthog.onFeatureFlags(handler);
      return () => {
        try { posthog.offFeatureFlags(handler); } catch {}
      };
    } catch {
      setValue(defaultValue);
    }
  }, [flagKey, defaultValue]);

  return value;
}
