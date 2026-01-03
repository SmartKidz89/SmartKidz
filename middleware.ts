import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public visitors should land on the Coming Soon page.
// We block signup routes until launch, but allow login for admins/existing users.
const BLOCKED_ROUTES = new Set([
  "/signup",
  "/marketing/signup",
  "/app/signup"
]);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow Next internals & static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/icon") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/sitemap.xml") ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|txt|xml|json|css|js|map)$/)
  ) {
    return NextResponse.next();
  }

  // Block signup routes (public)
  if (BLOCKED_ROUTES.has(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Allow the app for signed-in use (and internal testing).
  if (pathname.startsWith("/app")) {
    return NextResponse.next();
  }

  // Allow setup/admin tools explicitly (PUBLIC ACCESS FOR NOW)
  if (pathname.startsWith("/setup")) {
    return NextResponse.next();
  }

  // Allow login routes explicitly
  if (pathname === "/login" || pathname === "/marketing/login") {
    return NextResponse.next();
  }

  // Allow marketing informational pages (features/pricing/etc.)
  if (pathname.startsWith("/marketing")) {
    return NextResponse.next();
  }

  
  // Allow core app and admin console routes
  const ALLOW_PREFIXES = ["/admin", "/app", "/marketing"];
  if (ALLOW_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

// Everything else goes to Coming Soon
  if (pathname !== "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};