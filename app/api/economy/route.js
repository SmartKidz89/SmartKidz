import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@supabase/supabase-js";
import { itemById } from "@/lib/economy/items";
import { requireServerEnv } from "../../../lib/env";
import { rateLimit } from "../../../lib/rateLimit";

export const runtime = "nodejs";

function levelForXp(xp) {
  // Simple, predictable leveling curve: 100xp per level.
  return Math.max(1, Math.floor((xp || 0) / 100) + 1);
}

function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createServerClient(url, key, { auth: { persistSession: false } });
}

async function getEconomy(sb, childId) {
  const { data, error } = await sb
    .from("skz_child_economy")
    .select("child_id, coins, xp, level")
    .eq("child_id", childId)
    .maybeSingle();
  if (error) throw error;

  const econ = data || { child_id: childId, coins: 0, xp: 0, level: 1 };

  // Inventory table is optional. If missing, we return empty inventory.
  let inventory = [];
  try {
    const inv = await sb
      .from("skz_child_inventory")
      .select("item_id")
      .eq("child_id", childId);
    if (!inv.error && Array.isArray(inv.data)) {
      inventory = inv.data.map((r) => r.item_id);
    }
  } catch {
    inventory = [];
  }

  return {
    coins: econ.coins || 0,
    xp: econ.xp || 0,
    level: econ.level || levelForXp(econ.xp || 0),
    inventory,
    updatedAt: Date.now(),
  };
}

async function upsertEconomy(sb, childId, patch) {
  const now = new Date().toISOString();
  const { error } = await sb
    .from("skz_child_economy")
    .upsert({ child_id: childId, ...patch, updated_at: now }, { onConflict: "child_id" });
  if (error) throw error;
}

export async function GET(req) {
  const ip = req.headers?.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
const rl = rateLimit(`economy:${ip}`, { windowMs: 60_000, max: 120 });
if (!rl.allowed) {
  return NextResponse.json({ error: "Rate limited", resetInMs: rl.resetInMs }, { status: 429 });
}

try {
  requireServerEnv(["SUPABASE_SERVICE_ROLE_KEY", "NEXT_PUBLIC_SUPABASE_URL"], { hint: "Economy persistence requires Supabase server keys." });
} catch (err) {
  return NextResponse.json({ error: err.message, mode: "local-only" }, { status: 501 });
}

  const { searchParams } = new URL(req.url);
  const childId = searchParams.get("child");
  if (!childId) return NextResponse.json({ error: "Missing child" }, { status: 400 });

  const sb = supabaseAdmin();
  if (!sb) {
    // Safe default for local-only mode.
    return NextResponse.json({ coins: 0, xp: 0, level: 1, inventory: [], updatedAt: Date.now() });
  }

  try {
    // Ensure row exists.
    await upsertEconomy(sb, childId, { coins: 0, xp: 0, level: 1 });
    const economy = await getEconomy(sb, childId);
    return NextResponse.json(economy);
  } catch (e) {
    return NextResponse.json({ error: e?.message || "Economy read failed" }, { status: 500 });
  }
}

export async function POST(req) {
  const ip = req?.headers?.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
const rl = rateLimit(`economy:${ip}`, { windowMs: 60_000, max: 120 });
if (!rl.allowed) {
  return NextResponse.json({ error: "Rate limited", resetInMs: rl.resetInMs }, { status: 429 });
}

try {
  requireServerEnv(["SUPABASE_SERVICE_ROLE_KEY", "NEXT_PUBLIC_SUPABASE_URL"], { hint: "Economy persistence requires Supabase server keys." });
} catch (err) {
  return NextResponse.json({ error: err.message, mode: "local-only" }, { status: 501 });
}

  const sb = supabaseAdmin();
  if (!sb) return NextResponse.json({ error: "Economy persistence is disabled (missing SUPABASE_SERVICE_ROLE_KEY)." }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const childId = body?.childId;
  const op = body?.op;
  if (!childId || !op) return NextResponse.json({ error: "Missing childId/op" }, { status: 400 });

  try {
    const current = await getEconomy(sb, childId);

    if (op === "award") {
      const coins = Number(body?.coins || 0);
      const xp = Number(body?.xp || 0);
      const newCoins = Math.max(0, current.coins + coins);
      const newXp = Math.max(0, current.xp + xp);
      const newLevel = levelForXp(newXp);
      await upsertEconomy(sb, childId, { coins: newCoins, xp: newXp, level: newLevel });
      const next = await getEconomy(sb, childId);
      return NextResponse.json(next);
    }

    if (op === "purchase") {
      const itemId = String(body?.itemId || "");
      const item = itemById(itemId);
      if (!item) return NextResponse.json({ error: "Unknown item" }, { status: 400 });
      if (current.inventory?.includes(itemId)) return NextResponse.json(current);
      if (current.coins < item.cost) return NextResponse.json({ error: "Not enough coins" }, { status: 400 });

      // Deduct coins
      await upsertEconomy(sb, childId, { coins: current.coins - item.cost, xp: current.xp, level: current.level });

      // Best-effort inventory insert (table is optional)
      try {
        await sb.from("skz_child_inventory").insert({ child_id: childId, item_id: itemId, acquired_at: new Date().toISOString() });
      } catch {
        // If inventory table doesn't exist, client will still store inventory locally.
      }

      const next = await getEconomy(sb, childId);
      return NextResponse.json(next);
    }

    return NextResponse.json({ error: "Unknown op" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: e?.message || "Economy update failed" }, { status: 500 });
  }
}
