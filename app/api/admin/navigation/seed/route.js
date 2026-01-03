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
  
  // Clear existing items for this scope to prevent duplicates
  await admin.from("cms_navigation_items").delete().eq("scope", scope);

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

  const { error } = await admin.from("cms_navigation_items").insert(rows);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  return NextResponse.json({ ok: true, count: rows.length });
}