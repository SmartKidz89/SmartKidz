import { createClient } from "@supabase/supabase-js";

function decodeJwtRoleMaybe(key) {
  // Supabase "service_role" keys have historically been JWTs (3 segments).
  // Newer "secret" keys are not necessarily JWTs; in that case we cannot decode.
  const parts = String(key || "").split(".");
  if (parts.length !== 3) return { isJwt: false, role: null };
  try {
    // base64url -> base64
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "===".slice((b64.length + 3) % 4);
    const json = Buffer.from(padded, "base64").toString("utf8");
    const payload = JSON.parse(json);
    return { isJwt: true, role: payload?.role || null };
  } catch {
    return { isJwt: true, role: null };
  }
}

/**
 * Server-side Supabase admin client for webhook tasks ONLY.
 * Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
 */
export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Missing SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY");
  }

  // Guardrails: if someone accidentally sets the anon key here, RLS will block reads and
  // the admin login will always fail with "Invalid credentials".
  const { isJwt, role } = decodeJwtRoleMaybe(serviceKey);
  if (isJwt && role && role !== "service_role") {
    throw new Error(
      `SUPABASE_SERVICE_ROLE_KEY is misconfigured (JWT role=${role}). Set it to the Supabase service_role key.`
    );
  }

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        // RLS evaluation depends on the Authorization header. Pin this client to the service key.
        Authorization: `Bearer ${serviceKey}`,
      },
    },
  });
}


// Back-compat alias used by API routes
export function createAdminClient() {
  return getSupabaseAdmin();
}
