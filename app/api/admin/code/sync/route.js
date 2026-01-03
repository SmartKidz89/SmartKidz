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

  const body = await req.json();
  const relPath = body.path;
  let content = body.content;
  const encoding = body.encoding || "utf-8";

  if (!relPath) return NextResponse.json({ error: "Path required" }, { status: 400 });

  const token = process.env.GITHUB_SYNC_TOKEN;
  const fullRepo = process.env.GITHUB_SYNC_REPO;
  const branch = process.env.GITHUB_SYNC_BRANCH || "main";

  if (!token || !fullRepo) {
    return NextResponse.json({ error: "GitHub env vars missing" }, { status: 500 });
  }

  const [owner, repo] = fullRepo.split("/");
  
  // If content not provided in body, try reading from disk (legacy/local mode)
  // Only valid for text/utf-8 calls usually
  if (content === undefined && encoding === "utf-8") {
    try {
      const fullPath = path.join(process.cwd(), relPath);
      content = await fs.readFile(fullPath, "utf-8");
    } catch (e) {
      return NextResponse.json({ error: "Could not read file from disk. Provide content in body." }, { status: 400 });
    }
  }

  try {
    const message = `Update ${relPath} via Admin`;
    await putFile({ token, owner, repo, branch, path: relPath, content, message, encoding });

    return NextResponse.json({ ok: true, message: `Pushed ${relPath} to ${branch}` });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}