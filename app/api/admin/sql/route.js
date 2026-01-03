import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getDbUrl() {
  return process.env.SUPABASE_DB_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL;
}

function isReadOnly(sql) {
  const s = String(sql || "").trim().toLowerCase();
  return s.startsWith("select") || s.startsWith("with");
}

export async function POST(req) {
  const auth = await requireAdminSession({ minRole: "root" });
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const actor = auth.session?.user?.username;

  const body = await req.json();
  const sql = body?.sql || "";
  const allowMutations = !!body?.allowMutations;

  if (!sql.trim()) return NextResponse.json({ error: "sql is required" }, { status: 400 });
  if (!allowMutations && !isReadOnly(sql)) {
    return NextResponse.json({ error: "Only SELECT/CTE queries are allowed unless allowMutations is enabled." }, { status: 400 });
  }

  const dbUrl = getDbUrl();
  if (!dbUrl) return NextResponse.json({ error: "Missing SUPABASE_DB_URL / DATABASE_URL / POSTGRES_URL" }, { status: 500 });

  const { Client } = await import("pg");
  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    const started = Date.now();
    const result = await client.query(sql);
    const elapsedMs = Date.now() - started;

    await logAudit({
      actor,
      action: "sql",
      entity: "database",
      meta: { allowMutations, elapsedMs, rowCount: result.rowCount, command: result.command },
    });

    return NextResponse.json({
      ok: true,
      command: result.command,
      rowCount: result.rowCount,
      fields: result.fields?.map((f) => ({ name: f.name, dataTypeID: f.dataTypeID })) || [],
      rows: result.rows || [],
      elapsedMs,
    });
  } catch (e) {
    await logAudit({ actor, action: "sql_error", entity: "database", meta: { message: e?.message } });
    return NextResponse.json({ error: e?.message || "SQL failed" }, { status: 500 });
  } finally {
    try { await client.end(); } catch {}
  }
}
