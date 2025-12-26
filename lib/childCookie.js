"use client";

export const ACTIVE_CHILD_COOKIE = "sk_active_child";

function isProdHost() {
  if (typeof window === "undefined") return false;
  return window.location.hostname.endsWith("smartkidz.app");
}

export function getCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

export function setCookie(name, value, days = 30) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();

  // Production: share across subdomains
  if (isProdHost()) {
    document.cookie = `${name}=${encodeURIComponent(value)}; Expires=${expires}; Path=/; Domain=.smartkidz.app; SameSite=None; Secure`;
    return;
  }

  // Dev/Preview: host-only cookie (works on localhost / *.vercel.app)
  document.cookie = `${name}=${encodeURIComponent(value)}; Expires=${expires}; Path=/; SameSite=Lax`;
}

export function clearCookie(name) {
  if (typeof document === "undefined") return;

  if (isProdHost()) {
    document.cookie = `${name}=; Max-Age=0; Path=/; Domain=.smartkidz.app; SameSite=None; Secure`;
    return;
  }

  document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
}
