import { NextResponse } from "next/server";
import { buildWeeklyReportEmail } from "@/lib/emailReports";

export const runtime = "nodejs";

function json(data, status = 200) {
  return NextResponse.json(data, { status });
}

/**
 * Weekly report sender (optional).
 *
 * Requires one of:
 * - RESEND_API_KEY + FROM_EMAIL
 *
 * Schedule on Vercel Cron (recommended) or call manually.
 * If keys are missing, this endpoint returns a preview payload only.
 */
export async function POST(req) {
  const auth = req.headers.get("authorization") || "";
  const cronToken = process.env.CRON_SECRET;
  if (cronToken && auth !== `Bearer ${cronToken}`) {
    return json({ error: "Unauthorized" }, 401);
  }

  const { childName = "Learner", parentEmail = null, attempts = [] } = await req.json().catch(() => ({}));

  const { subject, html } = buildWeeklyReportEmail({ childName, attempts });

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FROM_EMAIL;

  if (!apiKey || !from || !parentEmail) {
    return json({
      mode: "preview",
      required: ["RESEND_API_KEY", "FROM_EMAIL", "parentEmail"],
      subject,
      html,
    });
  }

  // Send via Resend API
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: parentEmail,
      subject,
      html,
    }),
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    return json({ error: "Email send failed", details: payload }, 502);
  }

  return json({ ok: true, id: payload?.id || null });
}
