import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client (for Client Components).
 */
const DEMO = String(process.env.NEXT_PUBLIC_DEMO_MODE || "").toLowerCase() === "true";

// Default credentials if env vars are missing
const DEFAULT_URL = "https://yfszdhsevmiemvokfpae.supabase.co";
const DEFAULT_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlmc3pkaHNldm1pZW12b2tmcGFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNTI4NTAsImV4cCI6MjA4MTkyODg1MH0.o8umBbRnaQMo8RCqWsKyYv8_fWKX5tFpRPg_T0SQ9_c";

const DEMO_LESSON_CONTENT = JSON.stringify({
  duration_minutes: 15,
  objective: "Count objects to 10 and match the number to a numeral.",
  explanation: "Counting means saying number words in order while touching each object once. The last number you say tells you how many there are.",
  real_world_application: "Count toys as you pack them away, or count steps as you walk to the door.",
  memory_strategies: ["Touch-and-count: touch each object once.", "Last number tells the total: stop and say it again."],
  worked_example: "There are 6 apples. Touch each apple and count: 1,2,3,4,5,6. The last number is 6, so there are 6 apples.",
  scenarios: [
    {
      context: "At snack time, you have grapes on your plate.",
      questions: [
        { prompt: "Count 7 grapes. What number do you say last?", answer: "7" },
        { prompt: "If you move one grape away, how many are left?", answer: "6" }
      ]
    }
  ],
  quiz: [
    {
      q: "Which number shows 'five'?",
      options: ["3", "5", "8", "10"],
      answer: "5",
      correctIndex: 1,
      hint: "It comes after 4."
    },
    {
      q: "You count: 1,2,3,4. How many blocks are there?",
      options: ["3", "4", "5"],
      answer: "4",
      correctIndex: 1,
      hint: "The last number you said was 4."
    },
    {
      q: "If you have 6 cookies and eat 1, how many are left?",
      options: ["5", "6", "7"],
      answer: "5",
      correctIndex: 0,
      hint: "Count backwards from 6."
    }
  ]
});

function missingSupabaseClient() {
  const err = new Error("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  
  // Mock implementations for offline/demo mode
  return {
    __missing: true,
    error: err,
    auth: {
      getSession: async () => ({ data: { session: { user: { id: "demo-user", email: "demo@smartkidz.app" } } }, error: null }),
      getUser: async () => ({ data: { user: { id: "demo-user" } }, error: null }),
      signUp: async () => ({ data: { user: { id: "demo-user" }, session: {} }, error: null }),
      signInWithPassword: async () => ({ data: { user: { id: "demo-user" }, session: {} }, error: null }),
      signInWithOAuth: async () => ({ data: { url: "/app" }, error: null }),
      signOut: async () => ({ error: null }),
      updateUser: async () => ({ data: { user: { id: "demo-user" } }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
    },
    from: (table) => {
      // Mock data responses based on table name
      if (table === "lessons") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ 
                data: { 
                  id: "demo-lesson-01", 
                  title: "Counting to 10", 
                  topic: "Number Sense", 
                  subject_id: "MATH",
                  year_level: 1,
                  content_json: DEMO_LESSON_CONTENT
                }, 
                error: null 
              }),
              order: () => ({ data: [], error: null })
            }),
            in: () => ({
              order: () => ({ 
                data: [
                   { id: "demo-1", title: "Counting Fun", subject_id: "MATH", year_level: 1, topic: "Numbers" },
                   { id: "demo-2", title: "Shapes & Sides", subject_id: "MATH", year_level: 1, topic: "Geometry" },
                   { id: "demo-3", title: "Big & Small", subject_id: "SCI", year_level: 1, topic: "Measurements" }
                ], 
                error: null 
              })
            }),
            order: () => ({ limit: () => ({ data: [], error: null }) })
          }),
          // Write ops that do nothing but succeed
          insert: async () => ({ data: null, error: null }),
          upsert: async () => ({ data: null, error: null }),
          update: async () => ({ data: null, error: null }),
          delete: async () => ({ data: null, error: null }),
        };
      }
      
      // Default fallback for other tables
      return {
        select: async () => ({ data: [], error: null }),
        insert: async () => ({ data: null, error: null }),
        upsert: async () => ({ data: null, error: null }),
        update: async () => ({ data: null, error: null }),
        delete: async () => ({ data: null, error: null }),
        eq() { return this; },
        in() { return this; },
        order() { return this; },
        limit() { return this; },
        maybeSingle() { return { data: null, error: null }; },
        single() { return { data: null, error: null }; },
      };
    },
    rpc: async () => ({ data: null, error: null }),
  };
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && anonKey && !DEMO) {
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