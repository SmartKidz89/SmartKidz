import { createClient } from "@supabase/supabase-js";

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

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}


// Back-compat alias used by API routes
export function createAdminClient() {
  return getSupabaseAdmin();
}
