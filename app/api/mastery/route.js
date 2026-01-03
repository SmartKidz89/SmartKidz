import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { env } from "@/lib/env";
import { createAdminClient } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ ok: true, note: "Mastery is primarily client-side; POST to persist when configured." });
}

export async function POST(req) {
  const limited = rateLimit(req, { bucket: "mastery", limit: 60, windowMs: 60_000 });
  if (!limited.ok) return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });

  const body = await req.json().catch(() => ({}));
  const { childId, state } = body || {};
  if (!childId || !state) return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });

  // If no service key, accept but do not persist.
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ ok: true, persisted: false });
  }

  const admin = createAdminClient();
  // Table is optional; if not provisioned, don't hard fail UAT.
  try {
    const { error } = await admin.from("skz_child_mastery").upsert({
      child_id: childId,
      state,
      updated_at: new Date().toISOString(),
    }, { onConflict: "child_id" });

    if (error) return NextResponse.json({ ok: true, persisted: false, warning: error.message });
    return NextResponse.json({ ok: true, persisted: true });
  } catch (e) {
    return NextResponse.json({ ok: true, persisted: false, warning: String(e?.message || e) });
  }
}
