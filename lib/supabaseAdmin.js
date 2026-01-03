import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase admin client.
 * Works with BOTH:
 *  - legacy JWT `service_role` keys (3 JWT segments)
 *  - new `sb_secret_...` keys (NOT JWTs)
 */
export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY; // may actually be sb_secret_...

  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and/or SUPABASE_SERVICE_ROLE_KEY");
  }

  const customFetch = async (input, init = {}) => {
    const headers = new Headers(init.headers || {});
    const apikey = headers.get("apikey") || headers.get("x-api-key");
    const auth = headers.get("authorization");

    // Supabase docs: publishable/secret keys (sb_*) are not JWTs and must not be used as Authorization Bearer.
    // If a client/library sets Authorization: Bearer <apikey> for sb_* keys, remove it so the request works.
    if (apikey && auth) {
      const bearerPrefix = "bearer ";
      const authLower = auth.toLowerCase();
      const bearerValue = authLower.startsWith(bearerPrefix) ? auth.slice(bearerPrefix.length) : null;

      if (
        bearerValue &&
        bearerValue === apikey &&
        (apikey.startsWith("sb_secret_") || apikey.startsWith("sb_publishable_"))
      ) {
        headers.delete("authorization");
      }
    }

    return fetch(input, { ...init, headers });
  };

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: { fetch: customFetch },
  });
}

// Back-compat alias used by API routes
export function createAdminClient() {
  return getSupabaseAdmin();
}
