import Stripe from "stripe";
import { headers } from "next/headers";
import { getSupabaseAdmin } from "../../../../lib/supabaseAdmin";
import { requireServerEnv } from "../../../../lib/env";
import { rateLimit } from "../../../../lib/rateLimit";

export const runtime = "nodejs";

// NOTE: Next.js App Router reads raw body by default in route handlers.
// We must use req.text() for Stripe signature verification.
export async function POST(req) {
  const ip =
    headers().get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers().get("x-real-ip") ||
    "unknown";

  const rl = rateLimit(`stripe:webhook:${ip}`, { windowMs: 60_000, max: 120 });
  if (!rl.allowed) {
    return new Response("Rate limited", { status: 429 });
  }

  try {
    requireServerEnv(
      ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "SUPABASE_SERVICE_ROLE_KEY", "NEXT_PUBLIC_SUPABASE_URL"],
      { hint: "Set these in Vercel Project Settings → Environment Variables." }
    );
  } catch (err) {
    return new Response(err.message, { status: 501 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = headers().get("stripe-signature");
  const body = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  async function upsertSubscription(sub) {
    const payload = {
      parent_id: sub.metadata?.parent_id || null,
      stripe_customer_id: sub.customer,
      stripe_subscription_id: sub.id,
      status: sub.status,
      current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      plan: (sub.items?.data?.[0]?.price?.recurring?.interval === "year") ? "annual" : "monthly",
      updated_at: new Date().toISOString()
    };

    await supabase.from("subscriptions").upsert(payload, { onConflict: "stripe_subscription_id" });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await upsertSubscription(event.data.object);
        break;
      default:
        break;
    }
  } catch (err) {
    return new Response(`Supabase Error: ${err.message}`, { status: 500 });
  }

  return new Response("ok", { status: 200 });
}
