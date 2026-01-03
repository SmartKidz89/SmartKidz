import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { buildWeeklyReportEmail } from "@/lib/emailReports";
import { requireServerEnv } from "../../../../lib/env";
import { rateLimit } from "../../../../lib/rateLimit";

export const runtime = "nodejs";

/**
 * Protected endpoint intended for scheduled jobs (e.g., Vercel Cron).
 * Security model:
 *  - Requires Authorization: Bearer <WEEKLY_REPORT_SECRET>
 *  - Uses Supabase Service Role key on the server ONLY
 */
export async function POST(req) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = rateLimit(`reports:weekly:${ip}`, { windowMs: 60_000, max: 30 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limited", resetInMs: rl.resetInMs }, { status: 429 });
  }

  try {
    requireServerEnv(
      ["WEEKLY_REPORT_SECRET", "SUPABASE_SERVICE_ROLE_KEY", "NEXT_PUBLIC_SUPABASE_URL"],
      { hint: "Weekly reports require server keys." }
    );
    // 1) Authenticate caller (cron/job)
    const expected = process.env.WEEKLY_REPORT_SECRET || process.env.CRON_SECRET;
    if (!expected) {
      return NextResponse.json(
        { error: "Server misconfigured: missing WEEKLY_REPORT_SECRET" },
        { status: 500 }
      );
    }

    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token || token !== expected) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2) Validate inputs
    const { parentEmail, childId } = await req.json();

    const emailOk =
      typeof parentEmail === "string" &&
      parentEmail.length <= 320 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail);

    const uuidOk =
      typeof childId === "string" &&
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
        childId
      );

    if (!emailOk || !uuidOk) {
      return NextResponse.json({ error: "Invalid params" }, { status: 400 });
    }

    // 3) Query data with admin privileges (server-only)
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: child, error: childErr } = await supabase
      .from("children")
      .select("id,display_name")
      .eq("id", childId)
      .single();

    if (childErr) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    const { data: attempts, error: attemptsErr } = await supabase
      .from("attempts")
      .select("correct")
      .eq("child_id", childId);

    if (attemptsErr) {
      return NextResponse.json({ error: "Failed to load attempts" }, { status: 500 });
    }

    const { subject, html } = buildWeeklyReportEmail({
      childName: child?.display_name ?? "Student",
      attempts: attempts ?? [],
    });

    // 4) Send email
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.FROM_EMAIL,
        to: [parentEmail],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Email failed" }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
