import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const COOKIE_NAME = "sk_admin_session";
const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 12; // 12h

function nowIso() {
  return new Date().toISOString();
}

function randomToken() {
  // 32 bytes url-safe
  return Buffer.from(globalThis.crypto.getRandomValues(new Uint8Array(32))).toString("base64url");
}

// Node runtime for Buffer + crypto.getRandomValues
export const runtime = "nodejs";

/**
 * Creates a session token and stores it in `admin_sessions`.
 * Sets an HttpOnly cookie.
 */
export async function createAdminSession({ adminUserId, role, maxAgeSeconds = DEFAULT_MAX_AGE_SECONDS }) {
  const admin = getSupabaseAdmin();
  const token = randomToken();
  const expiresAt = new Date(Date.now() + maxAgeSeconds * 1000).toISOString();

  const { error } = await admin.from("admin_sessions").insert({
    token,
    admin_user_id: adminUserId,
    role,
    expires_at: expiresAt,
    created_at: nowIso(),
    last_seen_at: nowIso(),
  });

  if (error) {
    throw new Error(error.message || "Failed to create session");
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  });

  return { token, expiresAt };
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("admin_sessions")
    .select("token, role, expires_at, admin_user_id, admin_users:admin_user_id (id, username, role, is_active)")
    .eq("token", token)
    .maybeSingle();

  if (error || !data) return null;
  const expiresAt = new Date(data.expires_at);
  if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() < Date.now()) {
    // Expired — best-effort cleanup
    try {
      await admin.from("admin_sessions").delete().eq("token", token);
    } catch {}
    return null;
  }
  if (!data.admin_users?.is_active) return null;

  // Touch last_seen_at (best-effort)
  try {
    await admin.from("admin_sessions").update({ last_seen_at: nowIso() }).eq("token", token);
  } catch {}

  return {
    token: data.token,
    role: data.role || data.admin_users?.role,
    user: {
      id: data.admin_users?.id,
      username: data.admin_users?.username,
      role: data.admin_users?.role,
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
