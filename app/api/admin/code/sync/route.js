import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { putFile } from "@/lib/admin/github";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  const auth = await requireAdminSession({ minRole: "root" });
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { path: relPath } = await req.json();
  if (!relPath) return NextResponse.json({ error: "Path required" }, { status: 400 });

  const token = process.env.GITHUB_SYNC_TOKEN;
  const fullRepo = process.env.GITHUB_SYNC_REPO;
  const branch = process.env.GITHUB_SYNC_BRANCH || "main";

  if (!token || !fullRepo) {
    return NextResponse.json({ error: "GitHub env vars missing" }, { status: 500 });
  }

  const [owner, repo] = fullRepo.split("/");
  const fullPath = path.join(process.cwd(), relPath);

  try {
    const content = await fs.readFile(fullPath, "utf-8");
    const message = `Update ${relPath} via Admin Code Editor`;

    await putFile({ token, owner, repo, branch, path: relPath, content, message });

    return NextResponse.json({ ok: true, message: `Pushed ${relPath} to ${branch}` });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}