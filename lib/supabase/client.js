import { createBrowserClient } from "@supabase/ssr";

const DEFAULT_URL = "https://yfszdhsevmiemvokfpae.supabase.co";
const DEFAULT_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlmc3pkaHNldm1pZW12b2tmcGFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNTI4NTAsImV4cCI6MjA4MTkyODg1MH0.o8umBbRnaQMo8RCqWsKyYv8_fWKX5tFpRPg_T0SQ9_c";

/**
 * Browser-side Supabase client (for Client Components).
 *
 * Uses environment variables if available, otherwise falls back to a safe demo project.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY;

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

export const supabase = createClient();