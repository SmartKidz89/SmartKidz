import { NextResponse } from "next/server";

/**
 * Simplified single-domain middleware.
 *
 * - Marketing lives under /marketing
 * - App (authenticated) lives under /app
 * - Everything else redirects to /marketing
 *
 * This avoids subdomain-based routing, which commonly breaks on first deploy.
 */
export function middleware(req) {
  const url = req.nextUrl;
  const { pathname } = url;

  // Always allow Next internals and API routes
  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.startsWith("/favicon.ico")) {
    return NextResponse.next();
  }

  // Allow app and marketing sections
  if (pathname === "/app" || pathname.startsWith("/app/")) return NextResponse.next();
  if (pathname === "/marketing" || pathname.startsWith("/marketing/")) return NextResponse.next();

  // Root and everything else -> marketing home
  url.pathname = "/marketing";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|assets|fonts|images|.*\.(?:png|jpg|jpeg|gif|svg|ico|webp)$).*)"],
};
