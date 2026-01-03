/**
 * Environment helpers with safe, explicit error messaging.
 * Never import this module in client components.
 */

export function requireServerEnv(names, { hint } = {}) {
  const missing = names.filter((n) => !process.env[n]);
  if (missing.length) {
    const msg =
      `Missing required server env var(s): ${missing.join(", ")}.` +
      (hint ? ` ${hint}` : "");
    const err = new Error(msg);
    err.code = "MISSING_ENV";
    throw err;
  }
}

export function optionalEnv(name, fallback = undefined) {
  return process.env[name] ?? fallback;
}

export function publicEnv(name, fallback = undefined) {
  return process.env[name] ?? process.env[`NEXT_PUBLIC_${name}`] ?? fallback;
}


export const env = {
  // Public / browser-safe env accessors
  public(name, fallback = undefined) {
    return process.env[name] ?? process.env[`NEXT_PUBLIC_${name}`] ?? fallback;
  },
  // Server-only strict accessor
  require(names, opts) {
    return requireServerEnv(names, opts);
  },
  optional(name, fallback = undefined) {
    return optionalEnv(name, fallback);
  },
};
