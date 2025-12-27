import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, "public");

const budgets = [
  { glob: path.join("lottie"), maxBytes: 1_500_000 },
  { glob: path.join("rive"), maxBytes: 2_500_000 },
  { glob: "", maxBytes: 12_000_000 },
];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

const files = walk(PUBLIC);
const sizes = files.map(f => ({ f, bytes: fs.statSync(f).size }));

function sum(filterPath) {
  return sizes
    .filter(x => !filterPath || x.f.includes(path.join(PUBLIC, filterPath)))
    .reduce((a,b)=>a+b.bytes,0);
}

let failed = false;
for (const b of budgets) {
  const total = sum(b.glob);
  if (total > b.maxBytes) {
    console.error(`perf-budget: FAIL public/${b.glob || "(all)"} = ${total} bytes (budget ${b.maxBytes})`);
    failed = true;
  } else {
    console.log(`perf-budget: OK public/${b.glob || "(all)"} = ${total} bytes`);
  }
}
if (failed) process.exit(1);
