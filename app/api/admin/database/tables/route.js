import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdminSession();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  // Use the postgres connection via the SQL interface if possible, 
  // or fall back to Supabase logic if we just need table names.
  // We'll use a direct SQL query to information_schema via the pg-client logic
  // inside the /api/admin/sql pattern, but wrapped here for convenience.
  
  // Since we don't want to duplicate the PG connection logic, we will return 
  // a simple JSON list by querying the SQL endpoint internally or just 
  // implementing a lightweight fetch here. 
  
  // Actually, let's use the existing SQL route logic but specifically for schema
  try {
    const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
    if (!dbUrl) throw new Error("Missing DB Connection String");

    const { Client } = await import("pg");
    const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
    
    await client.connect();
    
    const query = `
      SELECT table_name, 
             (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name) as columns
      FROM information_schema.tables t
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    const res = await client.query(query);
    await client.end();

    return NextResponse.json({ tables: res.rows });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}