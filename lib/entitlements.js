import { getSupabaseAdmin } from "./supabaseAdmin";

/**
 * Computes entitlements for a parent.
 * Checks for:
 * 1. 'subscription_bypass' flag in profiles (Admin/Gift access)
 * 2. Active/Trialing status in 'subscriptions' table (Stripe)
 */
export async function getEntitlementsForParent(parentId) {
  if (!parentId) return { isPremium: false, source: "none" };

  try {
    const supabase = getSupabaseAdmin();

    // 1. Check Profile Bypass
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_bypass")
      .eq("id", parentId)
      .single();

    if (profile?.subscription_bypass) {
      return { isPremium: true, plan: "admin_bypass", source: "bypass" };
    }

    // 2. Check Stripe Subscription
    const { data: sub, error } = await supabase
      .from("subscriptions")
      .select("status,current_period_end,plan")
      .eq("parent_id", parentId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;

    const status = sub?.status || null;
    const cpe = sub?.current_period_end ? new Date(sub.current_period_end) : null;
    const now = new Date();

    const active =
      status === "active" ||
      status === "trialing" ||
      (status === "past_due" && cpe && cpe > now); // grace window

    return {
      isPremium: Boolean(active),
      plan: sub?.plan || null,
      status,
      currentPeriodEnd: cpe ? cpe.toISOString() : null,
      source: "supabase",
    };
  } catch (e) {
    console.error("Entitlement check failed:", e);
    return { isPremium: false, source: "error" };
  }
}