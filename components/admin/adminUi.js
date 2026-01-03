/**
 * Shared UI helpers for the Admin Console.
 * Keep this file dependency-free so it can be imported broadly.
 */

export function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

export function isBrowser() {
  return typeof window !== "undefined";
}

export function getFocusableElements(root) {
  if (!root) return [];
  const selector =
    'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';
  const nodes = Array.from(root.querySelectorAll(selector));
  return nodes.filter((el) => {
    const style = window.getComputedStyle(el);
    const hidden =
      style.display === "none" ||
      style.visibility === "hidden" ||
      el.getAttribute("aria-hidden") === "true";
    return !hidden;
  });
}
