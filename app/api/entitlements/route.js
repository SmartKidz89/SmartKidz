import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getEntitlementsForParent } from "../../../lib/entitlements";
import { rateLimit } from "../../../lib/rateLimit";

export const runtime = "nodejs";

export async function GET() {
  const ip = cookies().get("skz_ip")?.value || "unknown";
  const rl = rateLimit(`entitlements:${ip}`, { windowMs: 60_000, max: 120 });
  if (!rl.allowed) {
    return Response.json({ error: "Rate limited", resetInMs: rl.resetInMs }, { status: 429 });
  }

  const cookieStore = cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321";
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "public-anon-key";

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
