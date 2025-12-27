import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client (for Client Components).
 *
 * This repo supports an optional DEMO_MODE for smoke tests / UAT.
 * When DEMO_MODE is enabled and Supabase keys are not present, we return a very small
 * in-memory facade so pages can render without hard failing.
 */
const DEMO = String(process.env.NEXT_PUBLIC_DEMO_MODE || "").toLowerCase() === "true";

function missingSupabaseClient() {
  const err = new Error("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  
  // A "Thenable" builder that allows chaining (.select().eq().order())
  // and resolves to an error when awaited.
  const builder = {
    select: () => builder,
    insert: () => builder,
    upsert: () => builder,
    update: () => builder,
    delete: () => builder,
    eq: () => builder,
    neq: () => builder,
    gt: () => builder,
    lt: () => builder,
    gte: () => builder,
    lte: () => builder,
    in: () => builder,
    is: () => builder,
    like: () => builder,
    ilike: () => builder,
    contains: () => builder,
    order: () => builder,
    limit: () => builder,
    single: () => builder,
    maybeSingle: () => builder,
    // The presence of 'then' makes this awaitable
    then: (resolve) => resolve({ data: [], error: err }),
  };

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
    from: () => builder,
    rpc: async () => ({ data: null, error: err }),
  };
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Normal configured client
  if (url && anonKey) {
    return createBrowserClient(url, anonKey);
  }

  // Demo / no-keys mode: allow the UI to render without a full backend.
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