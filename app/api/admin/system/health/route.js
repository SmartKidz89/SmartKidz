import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdminSession();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const health = {
    database: "unknown",
    supabaseApi: "unknown",
    latency: "0ms"
  };

  const start = Date.now();

  // 1. Check Direct DB via connection string
  try {
    const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
    if (!dbUrl) {
        health.database = "missing_env";
    } else {
        const { Client } = await import("pg");
        // connectionTimeoutMillis: 3000 to fail fast if blocked
        const client = new Client({ 
            connectionString: dbUrl, 
            ssl: { rejectUnauthorized: false },
            connectionTimeoutMillis: 3000 
        });
        await client.connect();
        await client.query("SELECT 1");
        await client.end();
        health.database = "healthy";
    }
  } catch (e) {
    console.error("DB Health Check Failed:", e);
    health.database = "error";
    health.dbError = e.message;
  }

  // 2. Check Supabase API (HTTP)
  try {
     const admin = getSupabaseAdmin();
     const { error } = await admin.from("profiles").select("id").limit(1);
     // error is ok if table missing, but connection shouldn't fail
     if (error && error.code === 'PGRST301') { // JWT expired or similar usually means auth issue, but connection ok
         health.supabaseApi = "healthy"; 
     } else if (error && error.message.includes("fetch")) {
         health.supabaseApi = "unreachable";
     } else {
         health.supabaseApi = "healthy";
     }
  } catch (e) {
     health.supabaseApi = "error";
  }

  health.latency = `${Date.now() - start}ms`;

  return NextResponse.json(health);
}