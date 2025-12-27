"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AvatarPicker from "@/components/avatar/AvatarPicker";
import ChildAvatar from "@/components/avatar/ChildAvatar";
import { supabase } from "@/lib/supabase/client";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { useEconomy } from "@/lib/economy/client";
import { useActiveChild } from "@/hooks/useActiveChild";
import { SHOP_ITEMS } from "@/lib/economy/items";
import { useRewards } from "@/components/ui/RewardProvider";

export default function AvatarPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const { activeChild } = useActiveChild();
  const childId = sp.get("child") || activeChild?.id || activeChild?.child_id;
  const [loading, setLoading] = useState(true);
  const [child, setChild] = useState(null);
  const [value, setValue] = useState({ color: "indigo", face: "smile", hat: "none" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const econ = useEconomy(childId);
  const { push } = useRewards();

  useEffect(() => {
    let mounted = true;
    async function run() {
      if (!childId) { setLoading(false); return; }
      const { data, error } = await supabase
        .from("children")
        .select("id, display_name, avatar_config")
        .eq("id", childId)
        .single();
      if (!mounted) return;
      if (error) { setErr(error.message); setLoading(false); return; }
      setChild(data);
      const cfg = data?.avatar_config || {};
      setValue({
        color: cfg.color || "indigo",
        face: cfg.face || "smile",
        hat: cfg.hat || "none",
      });
      setLoading(false);
    }
    run();
    return () => { mounted = false; };
  }, [childId]);

  async function save() {
    if (!childId) return;
    setSaving(true); setErr("");
    const { error } = await supabase
      .from("children")
      .update({ avatar_config: value })
      .eq("id", childId);
    setSaving(false);
    if (error) { setErr(error.message); return; }
    router.back();
  }

  return (
    <PageMotion className="max-w-3xl mx-auto">
      <div className="skz-glass skz-border-animate skz-shine p-6 md:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm text-slate-500">Personalise</div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Avatar</h1>
            <div className="mt-1 text-slate-600 text-sm">
              {child?.display_name ? `For ${child.display_name}` : "Choose a fun look for your journey."}
            </div>
          </div>
        <div className="flex items-center gap-2">
          <div className="skz-chip px-3 py-2 text-xs font-black">🪙 {econ?.coins ?? 0}</div>
          <ChildAvatar config={value} size={72} />
        </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="skz-card p-6 text-slate-600">Loading…</div>
          ) : !childId ? (
            <div className="skz-card p-6 text-slate-600">
              No child selected. Return and open this page from a child profile.
            </div>
          ) : (
            <div className="space-y-6">
              <AvatarPicker value={value} onChange={setValue} />

              <div className="skz-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">Avatar Shop</div>
                    <div className="text-xs text-slate-600 mt-1">Spend coins to unlock special accessories.</div>
                  </div>
                  <div className="skz-chip px-3 py-2 text-xs font-black">🪙 {econ?.coins ?? 0}</div>
                </div>

                <div className="mt-4 grid sm:grid-cols-3 gap-3">
                  {SHOP_ITEMS.map((item) => {
                    const owned = (econ?.inventory || []).includes(item.id);
                    return (
                      <div key={item.id} className="rounded-2xl border border-white/60 bg-white/60 backdrop-blur p-4 shadow-[0_12px_30px_rgba(0,0,0,0.10)]">
                        <div className="text-2xl">{item.preview}</div>
                        <div className="mt-2 font-extrabold text-slate-900 leading-tight">{item.name}</div>
                        <div className="text-xs text-slate-600 mt-1">{item.rarity.toUpperCase()} • {item.cost} coins</div>
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <button
                            className={
                              "skz-btn skz-btn-soft skz-pressable text-xs px-3 py-2 " +
                              (owned ? "opacity-60 cursor-default" : "")
                            }
                            disabled={owned}
                            data-testid={`shop-buy-${item.id}`}
                            onClick={async () => {

                              if (owned) return;
                              const res = await econ.purchase(item.id);
                              if (res?.error) {
                                push({ tone: "warning", title: "Couldn’t buy that", message: res.error === "Not enough coins" ? "Complete quests or lessons to earn more coins." : res.error });
                                return;
                              }
                              push({ tone: "levelup", title: "Unlocked!", message: `${item.name} added to your avatar closet.` });
                            }}
                          >
                            {owned ? "Owned" : "Buy"}
                          </button>
                          <button
                            className={
                              "skz-btn skz-btn-primary skz-pressable text-xs px-3 py-2 " +
                              (!owned ? "opacity-40 cursor-not-allowed" : "")
                            }
                            disabled={!owned}
                            onClick={() => {
                              // Apply cosmetic immediately
                              setValue((v) => ({ ...v, ...item.configPatch }));
                              push({ tone: "success", title: "Applied", message: `Now wearing: ${item.name}` });
                            }}
                          >
                            Wear
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {err ? <div className="mt-4 text-sm text-rose-600">{err}</div> : null}

        <div className="mt-6 flex gap-3 justify-end">
          <button className="skz-chip px-4 py-3 skz-press" onClick={() => router.back()} data-testid="avatar-cancel">
            Cancel
          </button>
          <button
            className="skz-glass px-5 py-3 skz-press"
            onClick={save} data-testid="avatar-save"
            disabled={saving || !childId}
          >
            {saving ? "Saving…" : "Save Avatar"}
          </button>
        </div>
      </div>
    </PageMotion>
  );
}
