import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const APP_DIR = path.join(ROOT, "app");
const exts = new Set([".js",".jsx",".ts",".tsx"]);

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else if (entry.isFile() && exts.has(path.extname(entry.name))) out.push(p);
  }
  return out;
}

function normalizeRoute(route) {
  if (!route) return null;
  if (route.startsWith("http")) return null;
  if (route.startsWith("mailto:") || route.startsWith("tel:")) return null;
  if (route.startsWith("#")) return null;
  // strip query/hash
  const clean = route.split("?")[0].split("#")[0];
  // ignore next/image and assets
  if (clean.startsWith("/_next") || clean.startsWith("/favicon") || clean.startsWith("/images")) return null;
  return clean;
}

function collectRoutes() {
  // A route exists if app/<segment>/page.* exists, or app/<segment>/route.* (API), or app/page.*
  const pages = [];
  for (const f of walk(APP_DIR)) {
    const rel = path.relative(APP_DIR, f).replaceAll(path.sep, "/");
    // ignore api (handled separately)
    if (rel.startsWith("api/")) continue;
    const base = rel.replace(/\/(page|layout|loading|error|not-found)\.(js|jsx|ts|tsx)$/, "");
    if (/\/page\.(js|jsx|ts|tsx)$/.test(rel)) {
      const route = "/" + base.replaceAll(/^\./g,"").replaceAll(/\[(.*?)\]/g, ":$1");
      pages.push(route === "/." ? "/" : route.replace(/\/$/, "") || "/");
    }
    if (rel === "page.jsx" || rel === "page.tsx" || rel === "page.js" || rel === "page.ts") pages.push("/");
  }
  // ensure unique, normalize
  return Array.from(new Set(pages.map(r => r === "" ? "/" : r)));
}

function routeMatches(known, candidate) {
  // exact
  if (known.has(candidate)) return true;
  // handle dynamic segments: /app/lesson/:lessonId matches /app/lesson/123
  for (const k of known) {
    if (!k.includes(":")) continue;
    const re = new RegExp("^" + k.replaceAll("/", "\\/").replace(/:\w+/g, "[^/]+") + "$");
    if (re.test(candidate)) return true;
  }
  return false;
}

const known = new Set(collectRoutes());
const files = walk(ROOT).filter(f => !f.includes(`${path.sep}.next${path.sep}`) && !f.includes(`${path.sep}node_modules${path.sep}`));

const found = [];
const hrefRe = /\bhref\s*=\s*["'`](\/[^"'` ]+)["'`]/g;
const pushRe = /\b(?:router\.)?push\(\s*["'`](\/[^"'` ]+)["'`]/g;
const toRe = /\bto\s*=\s*["'`](\/[^"'` ]+)["'`]/g;

for (const file of files) {
  if (!exts.has(path.extname(file))) continue;
  const txt = fs.readFileSync(file, "utf8");
  for (const re of [hrefRe, pushRe, toRe]) {
    let m;
    while ((m = re.exec(txt)) !== null) {
      const route = normalizeRoute(m[1]);
      if (route) found.push({ file: path.relative(ROOT, file), route });
    }
  }
}

const broken = [];
for (const { file, route } of found) {
  if (route.startsWith("/api/")) continue; // skip api links
  if (!routeMatches(known, route)) broken.push({ file, route });
}

if (broken.length) {
  console.error(`\nBroken internal routes found (${broken.length}):`);
  for (const b of broken) console.error(`- ${b.route}  (${b.file})`);
  console.error("\nKnown routes sample:", Array.from(known).slice(0, 30));
  process.exit(1);
} else {
  console.log(`OK: No broken internal routes found. Checked ${found.length} references against ${known.size} routes.`);
}
