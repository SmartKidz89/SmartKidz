import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

// Stateless, signed admin session cookie.
// This avoids relying on the `admin_sessions` table (which can be a source of
// operational issues) while still keeping sessions HttpOnly.

const COOKIE_NAME = "sk_admin_session";
const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 12; // 12h

export const runtime = "nodejs";

function base64url(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(String(input));
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64urlToBuffer(str) {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((str.length + 3) % 4);
  return Buffer.from(b64, "base64");
}

function getSessionSecret() {
  // Prefer an explicit secret, but fall back to existing server-only secrets
  // so the feature works without extra env work.
  const secret =
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_BOOTSTRAP_TOKEN ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error("Missing ADMIN_SESSION_SECRET (or ADMIN_BOOTSTRAP_TOKEN / SUPABASE_SERVICE_ROLE_KEY fallback)");
  return secret;
}

function sign(payloadObj) {
  const header = { alg: "HS256", typ: "JWT" };
  const headerPart = base64url(JSON.stringify(header));
  const payloadPart = base64url(JSON.stringify(payloadObj));
  const data = `${headerPart}.${payloadPart}`;
  const sig = crypto.createHmac("sha256", getSessionSecret()).update(data).digest();
  return `${data}.${base64url(sig)}`;
}

function verify(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [h, p, s] = parts;
  const data = `${h}.${p}`;
  const expected = crypto.createHmac("sha256", getSessionSecret()).update(data).digest();
  const actual = base64urlToBuffer(s);
  if (actual.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(actual, expected)) return null;

  try {
    const payload = JSON.parse(base64urlToBuffer(p).toString("utf8"));
    return payload;
  } catch {
    return null;
  }
}

/**
 * Creates a signed session token and stores it in an HttpOnly cookie.
 * No DB session table required.
 */
export async function createAdminSession({ adminUserId, role, maxAgeSeconds = DEFAULT_MAX_AGE_SECONDS }) {
  const expiresAtMs = Date.now() + maxAgeSeconds * 1000;
  const payload = {
    sub: adminUserId,
    role,
    exp: Math.floor(expiresAtMs / 1000),
    iat: Math.floor(Date.now() / 1000),
  };
  const token = sign(payload);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  });

  return { token, expiresAt: new Date(expiresAtMs).toISOString() };
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verify(token);
  if (!payload?.sub) return null;
  if (payload.exp && Number(payload.exp) * 1000 < Date.now()) return null;

  // Always validate against DB for user existence / active status.
  const admin = getSupabaseAdmin();
  const { data: user, error } = await admin
    .from("admin_users")
    .select("id, username, role, is_active")
    .eq("id", payload.sub)
    .maybeSingle();
  if (error || !user || !user.is_active) return null;

  return {
    token,
    role: payload.role || user.role,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
    },
  };
}

export async function requireAdminSession({ minRole = "admin" } = {}) {
  const session = await getAdminSession();
  if (!session) {
    return { ok: false, status: 401, message: "Not authenticated" };
  }
  const role = session.role || session.user?.role || "admin";
  if (minRole === "root" && role !== "root") {
    return { ok: false, status: 403, message: "Root access required" };
  }
  return { ok: true, session };
}

export function jsonError(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export { COOKIE_NAME as ADMIN_COOKIE_NAME };
