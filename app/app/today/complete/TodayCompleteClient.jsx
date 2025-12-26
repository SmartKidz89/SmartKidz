"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import PaywallGate from '@/components/app/PaywallGate';
import { getSupabaseClient } from "../../../../lib/supabaseClient";
import { markMissionComplete } from "../../../../lib/today/session";

export default function TodayCompleteClient() {
  const params = useSearchParams();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [msg, setMsg] = useState("Saving…");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const mission = params.get("mission") || "reading";
        const { data: sess } = await supabase.auth.getSession();
        const uid = sess?.session?.user?.id || "anon";

        markMissionComplete(uid, mission);

        if (uid !== "anon") {
          const r = await supabase.from("attempts").insert({
            user_id: uid,
            activity_id: `today_mission_${mission}`,
            response_json: { feature: "today", mission, completedAt: Date.now() }
          });
          if (r?.error) throw r.error;
        }

        if (!mounted) return;
        setMsg("Mission complete. Nice work.");
      } catch (e) {
        if (!mounted) return;
        setMsg(e?.message || "Save failed.");
      }
    })();
    return () => { mounted = false; };
  }, [params, supabase]);

  return (
    <main className="bg-gradient-to-br from-slate-50 via-white to-indigo-50 min-h-[70vh]">
      <div className="container-pad py-10">
        <PaywallGate>
          <Card className="p-8 max-w-2xl mx-auto">
            <div className="text-sm font-semibold text-slate-600">Today</div>
            <div className="text-3xl font-extrabold tracking-tight mt-1">Marked complete</div>
            <p className="mt-3 text-slate-700">{msg}</p>

            <div className="mt-6 flex gap-2 flex-wrap">
              <Button href="/app/today">Back to Today</Button>
              <Button href="/app" variant="secondary">Back to app</Button>
            </div>
          </Card>
        </PaywallGate>
      </div>
    </main>
  );
}
