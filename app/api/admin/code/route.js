import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ROOT = process.cwd();
const ALLOWED_ROOTS = ["app", "components", "lib", "styles", "public"];

function isAllowed(p) {
  const rel = path.relative(ROOT, p);
  return !rel.startsWith("..") && ALLOWED_ROOTS.some(r => rel.startsWith(r) || rel === r);
}

export async function GET(req) {
  const auth = await requireAdminSession({ minRole: "root" });
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { searchParams } = new URL(req.url);
  const relPath = searchParams.get("path") || "";
  const fullPath = path.join(ROOT, relPath);

  // Security check
  if (relPath && !isAllowed(fullPath)) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  try {
    const stat = await fs.stat(fullPath);
    
    if (stat.isDirectory()) {
      const items = await fs.readdir(fullPath, { withFileTypes: true });
      const entries = items.map(i => ({
        name: i.name,
        type: i.isDirectory() ? "dir" : "file",
        path: path.join(relPath, i.name).replaceAll("\\", "/") // Normalize slashes for Windows/Linux consistency
      })).sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === "dir" ? -1 : 1;
      });
      return NextResponse.json({ type: "dir", entries });
    } else {
      const content = await fs.readFile(fullPath, "utf-8");
      return NextResponse.json({ type: "file", content });
    }
  } catch (e) {
    console.error(`[Admin Code API] Error accessing ${fullPath}:`, e);
    return NextResponse.json({ error: e.message || "File system error" }, { status: 404 });
  }
}

export async function POST(req) {
  const auth = await requireAdminSession({ minRole: "root" });
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { path: relPath, content } = await req.json();
  if (!relPath) return NextResponse.json({ error: "Path required" }, { status: 400 });

  const fullPath = path.join(ROOT, relPath);
  if (!isAllowed(fullPath)) return NextResponse.json({ error: "Access denied" }, { status: 403 });

  try {
    await fs.writeFile(fullPath, content, "utf-8");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}