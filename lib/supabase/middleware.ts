import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

/**
 * updateSession keeps Supabase auth session cookies in sync and returns
 * the current session + the response that must be returned by middleware.
 *
 * Demo mode has been removed. If Supabase env vars are missing, this will
 * throw so the misconfiguration is visible immediately.
 */
export async function updateSession(req: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error(
      "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return { session, supabaseResponse: res } as any;
}
