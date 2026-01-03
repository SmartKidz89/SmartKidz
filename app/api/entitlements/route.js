import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getEntitlementsForParent } from "../../../lib/entitlements";
import { rateLimit } from "../../../lib/rateLimit";
import { getSupabasePublicConfig } from "@/lib/env/public";

export const runtime = "nodejs";

export async function GET() {
  const ip = cookies().get("skz_ip")?.value || "unknown";
  const rl = rateLimit(`entitlements:${ip}`, { windowMs: 60_000, max: 120 });
  if (!rl.allowed) {
    return Response.json({ error: "Rate limited", resetInMs: rl.resetInMs }, { status: 429 });
  }

  const cookieStore = cookies();

  let supabaseUrl;
  let supabaseAnon;
  try {
    const cfg = getSupabasePublicConfig();
    supabaseUrl = cfg.url;
    supabaseAnon = cfg.anonKey;
  } catch (err) {
    return Response.json(
      {
        error: "Supabase is not configured",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnon,
    {
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
    }
  );

  const { data: auth } = await supabase.auth.getUser();
  const parentId = auth?.user?.id || null;

  const ent = await getEntitlementsForParent(parentId);
  return Response.json(ent, { status: 200 });
}
