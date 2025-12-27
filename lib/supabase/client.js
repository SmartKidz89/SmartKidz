import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client (for Client Components).
 */
const DEMO = String(process.env.NEXT_PUBLIC_DEMO_MODE || "").toLowerCase() === "true";

// Project credentials from context
const PROJECT_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://yfszdhsevmiemvokfpae.supabase.co";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlmc3pkaHNldm1pZW12b2tmcGFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNTI4NTAsImV4cCI6MjA4MTkyODg1MH0.o8umBbRnaQMo8RCqWsKyYv8_fWKX5tFpRPg_T0SQ9_c";

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
    }),
    rpc: async () => ({ data: null, error: err }),
  };
}

export function createClient() {
  if (PROJECT_URL && ANON_KEY) {
    return createBrowserClient(PROJECT_URL, ANON_KEY);
  }

  // Demo / no-keys mode
  if (DEMO) return missingSupabaseClient();

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