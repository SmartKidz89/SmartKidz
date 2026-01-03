import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdminSession } from "@/lib/admin/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const auth = await requireAdminSession();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const admin = getSupabaseAdmin();
  
  // Find assets where public_url is missing in metadata OR metadata is null
  // We prioritize 'image' type assets.
  const { data, error } = await admin
    .from("assets")
    .select("*")
    .eq("asset_type", "image")
    .or("metadata->>public_url.is.null,metadata.is.null")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ 
    assets: data || [], 
    count: data?.length || 0 
  });
}