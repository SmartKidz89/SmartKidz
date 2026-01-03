// lib/supabaseCookieStorage.js
const COOKIE_NAME = "sb-session";

// Minimal cookie helpers (no dependency)
function getCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name, value, maxAgeSeconds) {
  if (typeof document === "undefined") return;

  // Required for cross-subdomain session sharing
  const attrs = [
    `${name}=${encodeURIComponent(value)}`,
    `Path=/`,
    `Domain=.smartkidz.app`,
    `SameSite=None`,
    `Secure`,
  ];

  if (typeof maxAgeSeconds === "number") {
    attrs.push(`Max-Age=${maxAgeSeconds}`);
  }

  document.cookie = attrs.join("; ");
}

function deleteCookie(name) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; Path=/; Domain=.smartkidz.app; Max-Age=0; SameSite=None; Secure`;
}

/**
 * Supabase v2 auth.storage interface:
 * - getItem(key)
 * - setItem(key, value)
 * - removeItem(key)
 */
export const supabaseCookieStorage = {
  getItem: (key) => {
    if (key !== "supabase.auth.token") return null;
    return getCookie(COOKIE_NAME);
  },
  setItem: (key, value) => {
    if (key !== "supabase.auth.token") return;
    // 7 days as a simple default; Supabase refresh will keep it current
    setCookie(COOKIE_NAME, value, 60 * 60 * 24 * 7);
  },
  removeItem: (key) => {
    if (key !== "supabase.auth.token") return;
    deleteCookie(COOKIE_NAME);
  },
};
