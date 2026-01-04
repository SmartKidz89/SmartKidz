import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ROOT = process.cwd();
const ALLOWED_ROOTS = ["app", "components", "lib", "styles", "public", "comfyui"];

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
    console.error(`[Admin Code API] Error accessing ${fullPath}:`, e.message);
    
    // Handle "Not Found" gracefully for UI
    if (e.code === 'ENOENT') {
       return NextResponse.json({ type: "error", error: "Path not found (or not accessible in this environment)", code: "ENOENT" }, { status: 404 });
    }

    return NextResponse.json({ error: e.message || "File system error" }, { status: 500 });
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
    // If we can't write (e.g. Vercel), return a specific error so the UI knows to use Git Sync instead
    if (e.code === 'EROFS') {
       return NextResponse.json({ error: "Read-only file system. Use Git Sync to persist changes.", code: "EROFS" }, { status: 403 });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}