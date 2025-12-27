import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client (for Client Components).
 */
const DEMO = String(process.env.NEXT_PUBLIC_DEMO_MODE || "").toLowerCase() === "true";

// Default credentials if env vars are missing
const DEFAULT_URL = "https://yfszdhsevmiemvokfpae.supabase.co";
const DEFAULT_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlmc3pkaHNldm1pZW12b2tmcGFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNTI4NTAsImV4cCI6MjA4MTkyODg1MH0.o8umBbRnaQMo8RCqWsKyYv8_fWKX5tFpRPg_T0SQ9_c";

// Helper to generate a larger quiz dynamically
const generateDemoQuiz = (count) => {
  return Array.from({ length: count }).map((_, i) => ({
    q: `Question ${i + 1}: What number comes after ${i + 4}?`,
    options: [`${i + 4}`, `${i + 5}`, `${i + 6}`, `${i + 3}`],
    answer: `${i + 5}`,
    correctIndex: 1,
    hint: "Count up one number from the number in the question."
  }));
};

const DEMO_LESSON_CONTENT = JSON.stringify({
  duration_minutes: 15,
  objective: "Count objects to 20 and match numbers.",
  explanation: "Counting means saying number words in order. Practice counting up to 20!",
  real_world_application: "Count steps, toys, or fruit at home.",
  memory_strategies: ["Touch-and-count: touch each object once.", "Say the numbers out loud."],
  worked_example: "To count to 5: say 1, 2, 3, 4, 5.",
  scenarios: [
    {
      context: "At the park.",
      questions: [
        { prompt: "Count 5 birds. What comes next?", answer: "6" },
        { prompt: "If one bird flies away, count backwards: 5, 4...", answer: "4" }
      ]
    }
  ],
  // Generate 15 questions for the demo
  quiz: generateDemoQuiz(15)
});

function missingSupabaseClient() {
  const err = new Error("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  
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
      // Return rich demo lessons if DB is unreachable
      if (table === "lessons") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ 
                data: { 
                  id: "demo-lesson-01", 
                  title: "Counting to 20", 
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
                   // Year 1 Maths
                   { id: "demo-1", title: "Counting: Beginning Practice 1", subject_id: "MATH", year_level: 1, topic: "Number Sense" },
                   { id: "demo-2", title: "Shapes: Intermediate Practice", subject_id: "MATH", year_level: 1, topic: "Geometry" },
                   { id: "demo-3", title: "Patterns: Advanced Challenge", subject_id: "MATH", year_level: 1, topic: "Patterns" },
                   
                   // Year 2 Maths
                   { id: "demo-4", title: "Addition: Beginning Steps", subject_id: "MATH", year_level: 2, topic: "Addition" },
                   { id: "demo-5", title: "Money: Intermediate Skills", subject_id: "MATH", year_level: 2, topic: "Money" },

                   // Science
                   { id: "demo-6", title: "Living Things: Beginning", subject_id: "SCI", year_level: 1, topic: "Biology" },
                   { id: "demo-7", title: "Materials: Intermediate", subject_id: "SCI", year_level: 2, topic: "Chemistry" }
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
      
      // Default fallback
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
  return missingSupabaseClient();
}

/**
 * Expose the demo catalog for in-app recommendations.
 */
export function getDemoLessonCatalog() {
  if (!DEMO) return [];
  return [
    { id: "demo-m-1", subject_id: "maths", year_level: 1, title: "Counting to 10", topic: "counting" },
    { id: "demo-m-2", subject_id: "maths", year_level: 1, title: "Basic addition", topic: "addition" },
  ];
}

export const supabase = createClient();