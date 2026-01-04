import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdminSession } from "@/lib/admin/auth";

export const runtime = "nodejs";

export async function POST(req) {
  const auth = await requireAdminSession();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await req.json().catch(() => ({}));
  const scope = body.scope || "app";
  const admin = getSupabaseAdmin();

  // Define defaults
  const APP_DEFAULTS = [
    { label: "Worlds", href: "/app/worlds", icon: "Map", sort: 0 },
    { label: "Rewards", href: "/app/rewards", icon: "Trophy", sort: 1 },
    { label: "Home", href: "/app", icon: "Home", sort: 2 },
    { label: "Avatar", href: "/app/avatar", icon: "UserCircle", sort: 3 },
  ];

  const MARKETING_DEFAULTS = [
    { label: "Home", href: "/", sort: 0 },
    { label: "Features", href: "/marketing/features", sort: 1 },
    { label: "Curriculum", href: "/marketing/curriculum", sort: 2 },
    { label: "Pricing", href: "/marketing/pricing", sort: 3 },
  ];

  const items = scope === "marketing" ? MARKETING_DEFAULTS : APP_DEFAULTS;
  
  try {
    // Clear existing items for this scope
    const { error: delErr } = await admin.from("cms_navigation_items").delete().eq("scope", scope);
    if (delErr) {
       console.error("Seed delete error:", delErr);
       // continue if delete fails (e.g. permission or not exists), but report it
       // Actually if table doesn't exist, insert will also fail.
       throw new Error(`Delete failed: ${delErr.message}`);
    }

    const rows = items.map(item => ({
      scope,
      label: item.label,
      href: item.href,
      icon: item.icon || null,
      sort: item.sort,
      is_active: true,
      min_role: "public",
      updated_at: new Date().toISOString()
    }));

    const { error: insErr } = await admin.from("cms_navigation_items").insert(rows);
    if (insErr) {
        console.error("Seed insert error:", insErr);
        throw new Error(`Insert failed: ${insErr.message}`);
    }
  
    return NextResponse.json({ ok: true, count: rows.length });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Seed failed" }, { status: 500 });
  }
}