import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicConfig } from "@/lib/env/public";

/**
 * Browser-side Supabase client (for Client Components).
 *
 * Uses environment variables if available, otherwise falls back to a safe demo project.
 */
export function createClient() {
  const { url, anonKey } = getSupabasePublicConfig();
  return createBrowserClient(url, anonKey);
}

/**
 * Minimal local catalog used by recommendations when the lesson table
 * is not yet populated. This is not a runtime demo mode and does not
 * bypass Supabase.
 */
export function getDemoLessonCatalog() {
  return [
    { id: "demo-m-1", subject_id: "maths", year_level: 1, title: "Counting to 10", topic: "counting" },
    { id: "demo-m-2", subject_id: "maths", year_level: 1, title: "Basic addition", topic: "addition" },
  ];
}

// NOTE: This is intentionally eagerly created because most UI paths depend on it.
// In production, missing credentials should fail fast. In local/demo, we fall back to localhost.
export const supabase = createClient();