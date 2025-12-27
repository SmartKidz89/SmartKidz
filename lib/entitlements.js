import { getSupabaseAdmin } from "./supabaseAdmin";

/**
 * Computes entitlements for a parent.
 * - If Supabase admin is not configured, returns a safe default: { isPremium: false }.
 * - If configured, checks the 'subscriptions' table for active/trialing and current_period_end.
 */
export async function getEntitlementsForParent(parentId) {
  if (!parentId) return { isPremium: false, source: "none" };

  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("subscriptions")
      .select("status,current_period_end,plan")
      .eq("parent_id", parentId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    const status = data?.status || null;
    const cpe = data?.current_period_end ? new Date(data.current_period_end) : null;
    const now = new Date();

    const active =
      status === "active" ||
      status === "trialing" ||
      (status === "past_due" && cpe && cpe > now); // grace window if period not ended

    return {
      isPremium: Boolean(active),
      plan: data?.plan || null,
      status,
      currentPeriodEnd: cpe ? cpe.toISOString() : null,
      source: "supabase",
    };
  } catch {
    return { isPremium: false, source: "fallback" };
  }
}
