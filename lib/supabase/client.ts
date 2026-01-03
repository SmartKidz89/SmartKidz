import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "@/lib/env/public";

const { url, anonKey } = getSupabasePublicConfig();
export const supabase = createClient(url, anonKey);
