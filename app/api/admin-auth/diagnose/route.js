import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Diagnostics endpoint to help confirm the deployed app is pointing at the
 * intended Supabase project.
 *
 * Gate: requires x-bootstrap-token header matching ADMIN_BOOTSTRAP_TOKEN.
 */
export async function GET(req) {
  try {
    const token = req.headers.get("x-bootstrap-token") || "";
    if (!token || token !== (process.env.ADMIN_BOOTSTRAP_TOKEN || "")) {
      return jsonError("Forbidden", 403);
    }

    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const host = (() => {
      try {
        return url ? new URL(url).host : null;
      } catch {
        return null;
      }
    })();

    const admin = getSupabaseAdmin();
    const { count, error } = await admin.from("admin_users").select("id", { count: "exact", head: true });

    return NextResponse.json({
      ok: true,
      supabaseHost: host,
      canQueryAdminUsers: !error,
      adminUsersCount: error ? null : count,
      error: error ? error.message : null,
    });
  } catch (e) {
    return jsonError(e?.message || "Diagnostics failed", 500);
  }
}
