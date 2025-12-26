import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};

function parseCsvEnv(value: string | undefined) {
  return (value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function isAppHost(host: string) {
  const normalized = (host || "").toLowerCase();

  // Configurable host rules (recommended for prod + previews)
  const explicitAppHosts = parseCsvEnv(process.env.APP_HOSTS);
  const appHostSuffix = (process.env.APP_HOST_SUFFIX || "").toLowerCase();

  if (explicitAppHosts.length > 0 && explicitAppHosts.includes(normalized)) return true;
  if (appHostSuffix && normalized !== appHostSuffix && normalized.endsWith(appHostSuffix)) return true;

  // Default behavior (backwards compatible)
  if (normalized === "app.smartkidz.app" || normalized.startsWith("app.")) return true;

  // Vercel previews: default to "app mode" unless explicitly disabled
  const previewAs = (process.env.PREVIEW_AS || "app").toLowerCase(); // "app" | "marketing"
  if (normalized.endsWith(".vercel.app")) return previewAs === "app";

  return false;
}

function copySetCookieHeaders(from: NextResponse, to: NextResponse) {
  // Next.js exposes getSetCookie() in modern versions; fall back to a single header if present.
  // We only propagate Set-Cookie, not all headers (avoid overwriting framework-managed headers).
  const getSetCookie = (from.headers as any).getSetCookie?.bind(from.headers);
  const setCookies: string[] =
    typeof getSetCookie === "function"
      ? getSetCookie()
      : from.headers.get("set-cookie")
        ? [from.headers.get("set-cookie") as string]
        : [];

  for (const c of setCookies) {
    if (c) to.headers.append("set-cookie", c);
  }
}

export async function middleware(request: NextRequest) {
  // 1. Refresh session (handling Supabase auth cookies)
  const { supabaseResponse } = await updateSession(request);

  const url = request.nextUrl.clone();
  const host = request.headers.get("host") || "";

  // 2. Routing Logic

  if (isAppHost(host)) {
    // APP DOMAIN
    if (!url.pathname.startsWith("/app")) {
      url.pathname = `/app${url.pathname === "/" ? "" : url.pathname}`;

      const rewriteResponse = NextResponse.rewrite(url);
      copySetCookieHeaders(supabaseResponse, rewriteResponse);
      return rewriteResponse;
    }
  } else {
    // MARKETING / MAIN DOMAIN (or Localhost default)
    const isLocalhost = host.includes("localhost");

    if (isLocalhost) {
      // On localhost, allow /app routes without rewrite.
      if (url.pathname.startsWith("/app")) {
        return supabaseResponse;
      }
    }

    // Default Marketing Rewrite
    if (!url.pathname.startsWith("/marketing") && !url.pathname.startsWith("/app")) {
      url.pathname = `/marketing${url.pathname === "/" ? "" : url.pathname}`;

      const rewriteResponse = NextResponse.rewrite(url);
      copySetCookieHeaders(supabaseResponse, rewriteResponse);
      return rewriteResponse;
    }
  }

  return supabaseResponse;
}
