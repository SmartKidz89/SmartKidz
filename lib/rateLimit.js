/**
 * Lightweight in-memory rate limiter for Node.js runtime.
 * NOTE: In-memory limits reset on deploy / cold start and do not coordinate across regions.
 * This is still valuable for basic abuse prevention and UAT safety.
 */

const buckets = new Map();

export function rateLimit(key, { windowMs = 60_000, max = 60 } = {}) {
  const now = Date.now();
  const entry = buckets.get(key) || { start: now, count: 0 };

  if (now - entry.start > windowMs) {
    entry.start = now;
    entry.count = 0;
  }

  entry.count += 1;
  buckets.set(key, entry);

  const remaining = Math.max(0, max - entry.count);
  const resetInMs = windowMs - (now - entry.start);

  return {
    allowed: entry.count <= max,
    remaining,
    resetInMs,
  };
}
