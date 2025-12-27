import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client (for Client Components).
 */
const DEMO = String(process.env.NEXT_PUBLIC_DEMO_MODE || "").toLowerCase() === "true";

// Default credentials if env vars are missing
const DEFAULT_URL = "https://yfszdhsevmiemvokfpae.supabase.co";
const DEFAULT_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlmc3pkaHNldm1pZW12b2tmcGFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNTI4NTAsImV4cCI6MjA4MTkyODg1MH0.o8umBbRnaQMo8RCqWsKyYv8_fWKX5tFpRPg_T0SQ9_c";

function missingSupabaseClient() {
  const err = new Error("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  return {
    __missing: true,
    error: err,
    auth: {
      getSession: async () => ({ data: { session: null }, error: err }),
      getUser: async () => ({ data: { user: null }, error: err }),
      signUp: async () => ({ data: { user: null, session: null }, error: err }),
      signInWithPassword: async () => ({ data: { user: null, session: null }, error: err }),
      signOut: async () => ({ error: null }),
      updateUser: async () => ({ data: { user: null }, error: err }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
    },
    from: () => ({
      select: async () => ({ data: [], error: err }),
      insert: async () => ({ data: null, error: err }),
      upsert: async () => ({ data: null, error: err }),
      update: async () => ({ data: null, error: err }),
      delete: async () => ({ data: null, error: err }),
      eq() { return this; },
      in() { return this; },
      order() { return this; },
      limit() { return this; },
      maybeSingle() { return this; },
      single() { return this; },
    }),
    rpc: async () => ({ data: null, error: err }),
  };
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY;

  if (url && anonKey) {
    return createBrowserClient(url, anonKey);
  }

  // Demo / no-keys mode
  return missingSupabaseClient();
}

/**
 * Expose the demo catalog for in-app recommendations and deterministic UAT.
 * Returns [] when not running in DEMO_MODE.
 */
export function getDemoLessonCatalog() {
  if (!DEMO) return [];
  return [
    { id: "demo-m-1", subject_id: "maths", year_level: 1, title: "Counting to 10", topic: "counting" },
    { id: "demo-m-2", subject_id: "maths", year_level: 1, title: "Basic addition", topic: "addition" },
    { id: "demo-e-1", subject_id: "english", year_level: 1, title: "Phonics practice", topic: "phonics" },
    { id: "demo-e-2", subject_id: "english", year_level: 1, title: "Short sentences", topic: "sentences" },
  ];
}

// Convenience export used throughout the app
export const supabase = createClient();