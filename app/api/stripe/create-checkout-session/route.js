import Stripe from "stripe";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { requireServerEnv } from "../../../../lib/env";
import { rateLimit } from "../../../../lib/rateLimit";

export const runtime = "nodejs";

/**
 * Creates a Stripe Checkout Session for subscriptions.
 *
 * Client should POST: { plan: "monthly"|"annual" }
 * (Parent identity is derived from the authenticated Supabase session; never trust client-provided IDs.)
 */
export async function POST(req) {
  try {
    const ip = cookies().get("skz_ip")?.value || "unknown";
    const rl = rateLimit(`stripe:checkout:${ip}`, { windowMs: 60_000, max: 30 });
    if (!rl.allowed) {
      return Response.json({ error: "Rate limited", resetInMs: rl.resetInMs }, { status: 429 });
    }

    requireServerEnv([
      "STRIPE_SECRET_KEY",
      "STRIPE_PRICE_MONTHLY",
      "STRIPE_PRICE_ANNUAL",
      "NEXT_PUBLIC_APP_URL",
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    ], { hint: "Set these in Vercel Project Settings → Environment Variables." });
    const { plan } = await req.json();

    const priceId =
      plan === "annual"
        ? process.env.STRIPE_PRICE_ANNUAL
        : plan === "monthly"
          ? process.env.STRIPE_PRICE_MONTHLY
          : null;

    if (!priceId) {
      return Response.json(
        { error: "Invalid plan or missing STRIPE_PRICE_MONTHLY/ANNUAL" },
        { status: 400 }
      );
    }

    const cookieStore = cookies();

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return Response.json(
        { error: "Server misconfigured: missing Supabase env vars" },
        { status: 500 }
      );
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name, options) {
          cookieStore.set({ name, value: "", ...options, maxAge: 0 });
        },
      },
    });

    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parentId = data.user.id;
    const email = data.user.email || undefined;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      customer_email: email,
      metadata: { parent_id: parentId, plan },
      subscription_data: {
        trial_period_days: 7,
        metadata: { parent_id: parentId, plan },
      },
      success_url: `${appUrl}/app?success=1`,
      cancel_url: `${appUrl}/pricing?canceled=1`,
    });

    return Response.json({ url: session.url });
  } catch (err) {
    return Response.json(
      { error: err?.message || "Stripe error" },
      { status: 500 }
    );
  }
}
