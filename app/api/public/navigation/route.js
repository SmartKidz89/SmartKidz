import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const scope = searchParams.get("scope") || "app";
  const sb = await createClient();
  const { data, error } = await sb
    .from("cms_navigation_items")
    .select("label, href, icon, sort, min_role")
    .eq("scope", scope)
    .eq("is_active", true)
    .order("sort", { ascending: true })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  return NextResponse.json({ items: data || [] });
}
