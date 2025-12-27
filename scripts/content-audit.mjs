import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

function walk(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

function fail(msg) {
  console.error("\nCONTENT AUDIT FAILED\n" + msg + "\n");
  process.exit(1);
}

const candidates = walk(path.join(ROOT, "lib"))
  .filter(p => p.endsWith("client.js") && p.includes(path.join("supabase")));

const file = candidates[0];
if (!file) {
  console.log("content-audit: no demo seed file found; skipping.");
  process.exit(0);
}

const src = fs.readFileSync(file, "utf8");
if (!src.includes("const lessons")) {
  console.log("content-audit: demo lessons not present; skipping.");
  process.exit(0);
}

const required = ["id", "title", "topic", "subject_id", "year_level"];
for (const r of required) {
  if (!src.includes(r + ":")) fail(`Missing required field in demo lesson seed: ${r}`);
}

console.log("content-audit: OK");
