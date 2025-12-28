import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client (for Client Components).
 */
const DEMO = String(process.env.NEXT_PUBLIC_DEMO_MODE || "").toLowerCase() === "true";

// Default credentials if env vars are missing
const DEFAULT_URL = "https://yfszdhsevmiemvokfpae.supabase.co";
const DEFAULT_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlmc3pkaHNldm1pZW12b2tmcGFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNTI4NTAsImV4cCI6MjA4MTkyODg1MH0.o8umBbRnaQMo8RCqWsKyYv8_fWKX5tFpRPg_T0SQ9_c";

// --- MOCK DATA GENERATORS ---

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
  quiz: generateDemoQuiz(15)
});

const MOCK_CHILDREN = [
  { 
    id: "demo-child-1", 
    parent_id: "demo-user", 
    display_name: "Leo", 
    year_level: 2, 
    country: "AU",
    avatar_config: { color: "indigo", face: "cool", hat: "cap" },
    avatar_key: "lion",
    accessibility_settings: { readAloud: true },
    created_at: new Date().toISOString()
  },
  { 
    id: "demo-child-2", 
    parent_id: "demo-user", 
    display_name: "Mia", 
    year_level: 4, 
    country: "US",
    avatar_config: { color: "rose", face: "star", hat: "bow" },
    avatar_key: "cat",
    accessibility_settings: { readAloud: false },
    created_at: new Date().toISOString()
  }
];

const MOCK_PROGRESS = [
  { lesson_id: "demo-1", status: "completed", mastery_score: 0.9, updated_at: new Date(Date.now() - 86400000).toISOString(), attempts: 1 },
  { lesson_id: "demo-2", status: "completed", mastery_score: 0.85, updated_at: new Date(Date.now() - 172800000).toISOString(), attempts: 2 },
  { lesson_id: "demo-4", status: "in_progress", mastery_score: 0.4, updated_at: new Date().toISOString(), attempts: 3 },
];

const MOCK_BADGES = [
  { badge_id: "first_lesson", awarded_at: new Date().toISOString() },
  { badge_id: "math_star", awarded_at: new Date().toISOString() },
  { badge_id: "week_streak", awarded_at: new Date().toISOString() }
];

function missingSupabaseClient() {
  // console.warn("Using Mock Supabase Client (Demo Mode)");
  
  return {
    __missing: true,
    auth: {
      getSession: async () => ({ data: { session: { user: { id: "demo-user", email: "demo@smartkidz.app" } } }, error: null }),
      getUser: async () => ({ data: { user: { id: "demo-user", email: "demo@smartkidz.app" } }, error: null }),
      signUp: async () => ({ data: { user: { id: "demo-user" }, session: { user: { id: "demo-user" } } }, error: null }),
      signInWithPassword: async () => ({ data: { user: { id: "demo-user" }, session: { user: { id: "demo-user" } } }, error: null }),
      signInWithOAuth: async () => ({ data: { url: "/app" }, error: null }),
      signOut: async () => { 
        if (typeof window !== "undefined") window.location.href = "/"; 
        return { error: null }; 
      },
      updateUser: async () => ({ data: { user: { id: "demo-user" } }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
    },
    from: (table) => {
      const mockChain = {
        select: () => mockChain,
        insert: async () => ({ data: null, error: null }),
        upsert: async () => ({ data: null, error: null }),
        update: async () => ({ data: null, error: null }),
        delete: async () => ({ data: null, error: null }),
        eq: () => mockChain,
        in: () => mockChain,
        order: () => mockChain,
        limit: () => mockChain,
        maybeSingle: async () => {
             if (table === "profiles") return { data: { id: "demo-user", full_name: "Demo Parent", role: "parent" }, error: null };
             if (table === "lessons") return { data: { id: "demo-lesson-01", title: "Counting to 20", topic: "Number Sense", subject_id: "MATH", year_level: 1, content_json: DEMO_LESSON_CONTENT }, error: null };
             return { data: null, error: null }; 
        },
        single: async () => {
             if (table === "profiles") return { data: { id: "demo-user", full_name: "Demo Parent", role: "parent" }, error: null };
             return { data: null, error: null };
        },
        then: (resolve) => {
             // Mock data responses based on table
             if (table === "children") resolve({ data: MOCK_CHILDREN, error: null, count: MOCK_CHILDREN.length });
             else if (table === "lesson_progress") resolve({ data: MOCK_PROGRESS, error: null });
             else if (table === "child_badges") resolve({ data: MOCK_BADGES, error: null });
             else if (table === "lessons") resolve({ 
                data: [
                   { id: "demo-1", title: "Counting: Beginning Practice 1", subject_id: "MATH", year_level: 1, topic: "Number Sense" },
                   { id: "demo-2", title: "Shapes: Intermediate Practice", subject_id: "MATH", year_level: 1, topic: "Geometry" },
                   { id: "demo-3", title: "Patterns: Advanced Challenge", subject_id: "MATH", year_level: 1, topic: "Patterns" },
                   { id: "demo-4", title: "Addition: Beginning Steps", subject_id: "MATH", year_level: 2, topic: "Addition" },
                ], 
                error: null 
             });
             else if (table === "attempts") resolve({ data: [], error: null });
             else if (table === "child_reflections") resolve({ data: [], error: null });
             else resolve({ data: [], error: null });
        }
      };
      return mockChain;
    },
    rpc: async (fnName) => {
        if (fnName === "get_child_dashboard") {
            return {
                data: {
                    child: MOCK_CHILDREN[0],
                    summary: [
                        { subject_id: "MATH", lessons_completed: 12, avg_mastery: 0.85 },
                        { subject_id: "ENG", lessons_completed: 5, avg_mastery: 0.72 },
                        { subject_id: "SCI", lessons_completed: 3, avg_mastery: 0.90 }
                    ],
                    badges: MOCK_BADGES,
                    streak: { current: 3, best: 5 }
                },
                error: null
            };
        }
        return { data: null, error: null };
    },
  };
}

export function createClient() {
  // 1. Check for manual override in LocalStorage (set via /demo page)
  if (typeof window !== "undefined") {
    try {
      const forceDemo = window.localStorage.getItem("skz_force_demo") === "true";
      if (forceDemo) return missingSupabaseClient();
    } catch {}
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 2. Use real client if keys exist (and not in forced DEMO env mode)
  if (url && anonKey && !DEMO) {
    return createBrowserClient(url, anonKey);
  }
  
  // 3. Fallback to mock
  return missingSupabaseClient();
}

/**
 * Expose the demo catalog for in-app recommendations.
 */
export function getDemoLessonCatalog() {
  return [
    { id: "demo-m-1", subject_id: "maths", year_level: 1, title: "Counting to 10", topic: "counting" },
    { id: "demo-m-2", subject_id: "maths", year_level: 1, title: "Basic addition", topic: "addition" },
  ];
}

export const supabase = createClient();