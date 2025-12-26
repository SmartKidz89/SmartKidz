
import { createClient } from "./supabase/client";

/**
 * @deprecated Use `createClient` from "@/lib/supabase/client" directly in Client Components.
 * This wrapper is kept for backward compatibility with existing code.
 */
export function getSupabaseClient() {
  return createClient();
}
