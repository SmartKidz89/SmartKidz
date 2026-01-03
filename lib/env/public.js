/**
 * Public (browser-safe) environment helpers.
 *
 * Policy:
 * - Production: required vars must be set.
 * - Non-production: allow localhost fallback for local Supabase.
 */

const LOCAL_SUPABASE_URL = "http://localhost:54321";
const LOCAL_SUPABASE_ANON = "public-anon-key";

function isProd() {
  return process.env.NODE_ENV === "production";
}

function shouldAllowLocalFallback() {
  return !isProd() || process.env.NEXT_PUBLIC_DEMO_MODE === "1";
}

/**
 * Returns Supabase public credentials for browser clients.
 */
export function getSupabasePublicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && anonKey) {
    return { url, anonKey, source: "env" };
  }

  if (shouldAllowLocalFallback()) {
    // Local development convenience. This avoids shipping a hard-coded remote Supabase project.
    if (typeof window !== "undefined") {
      // eslint-disable-next-line no-console
      console.warn(
        "[SmartKidz] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY not set. Falling back to local Supabase (http://localhost:54321)."
      );
    }
    return { url: LOCAL_SUPABASE_URL, anonKey: LOCAL_SUPABASE_ANON, source: "local" };
  }

  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY. Set them in .env.local (see .env.example)."
  );
}

/**
 * Returns the primary app origin used by marketing links.
 * Defaults to same-origin /app when not configured.
 */
export function getAppBase() {
  const origin = process.env.NEXT_PUBLIC_APP_ORIGIN || process.env.NEXT_PUBLIC_APP_URL || "";
  return origin ? origin.replace(/\/+$/g, "") : "/app";
}
