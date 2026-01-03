import fs from "fs";
import path from "path";

/**
 * Minimal .env loader for local scripts (no dependency on dotenv).
 * Loads (in order): .env.local, .env
 * Does not overwrite existing process.env keys.
 */
export function loadEnv(cwd = process.cwd()) {
  const files = [".env.local", ".env"];
  for (const f of files) {
    const p = path.join(cwd, f);
    if (!fs.existsSync(p)) continue;
    const content = fs.readFileSync(p, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = val;
    }
  }
}
