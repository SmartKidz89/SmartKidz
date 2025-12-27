import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

/**
 * updateSession keeps Supabase auth session cookies in sync and returns
 * the current session + the response that must be returned by middleware.
 */
export async function updateSession(req: NextRequest) {
  const demo =
    String(process.env.NEXT_PUBLIC_DEMO_MODE || "").toLowerCase() === "1" ||
    String(process.env.NEXT_PUBLIC_DEMO_MODE || "").toLowerCase() === "true";

  // In demo mode (or when Supabase env vars aren't configured), don't attempt
  // to refresh cookies. This keeps local demos and Playwright journeys stable.
  if (demo || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const res = NextResponse.next();
    return { session: null, supabaseResponse: res } as any;
  }

  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();
  return { session, supabaseResponse: res } as any;
}
