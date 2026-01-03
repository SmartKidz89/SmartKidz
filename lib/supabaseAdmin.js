import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase admin client (service role) for server routes ONLY.
 * Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
 */
function assertServiceRoleKey(serviceKey) {
  // Supabase API keys are often JWTs. If this is a JWT, validate the role claim.
  const parts = String(serviceKey || "").split(".");
  if (parts.length !== 3) return; // Non-JWT (e.g., new secret keys) - nothing to assert here.
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf8"));
    if (payload?.role && payload.role !== "service_role") {
      throw new Error(`SUPABASE_SERVICE_ROLE_KEY is not a service_role key (role=${payload.role})`);
    }
  } catch (e) {
    // If decoding fails, don't block; still allow runtime errors from Supabase to surface.
  }
}

export function getSupabaseAdmin() {
  // Prefer NEXT_PUBLIC_SUPABASE_URL to avoid mismatches when SUPABASE_URL is set incorrectly in deployment.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL/SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY");
  }

  assertServiceRoleKey(serviceKey);

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      // RLS enforcement in PostgREST is based on Authorization; pin it to the service key.
      headers: { Authorization: `Bearer ${serviceKey}` },
    },
  });
}

// Back-compat alias used by API routes
export function createAdminClient() {
  return getSupabaseAdmin();
}
