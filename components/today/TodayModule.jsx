"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { getSupabaseClient } from "../../lib/supabaseClient";
import { getTodaySession, progressCount, isComplete } from "../../lib/today/session";

export default function TodayModule() {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [session, setSession] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data: sess } = await supabase.auth.getSession();
        const uid = sess?.session?.user?.id || "anon";
        const s = getTodaySession(uid);
        if (!mounted) return;
        setSession(s);
      } catch {
        if (!mounted) return;
        setSession(getTodaySession("anon"));
      }
    })();
    return () => { mounted = false; };
  }, [supabase]);

  const done = progressCount(session);
  const complete = isComplete(session);

  return (
    <Card className="p-6 bg-white/80 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-sm font-semibold text-slate-600">Today&apos;s Learning</div>
          <div className="text-2xl font-extrabold tracking-tight">3 small missions. Big confidence.</div>
          <div className="mt-2 text-slate-700">
            10–15 minutes. Read, write, then warm up your maths brain. Retry is a strategy—go slow and smooth.
          </div>

          <div className="mt-4 flex items-center gap-3 flex-wrap">
            <div className="text-sm font-semibold text-slate-700">
              Progress: <span className="font-extrabold">{done}/3</span>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
              complete ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-slate-50 border-slate-200 text-slate-700"
            }`}>
              {complete ? "Complete — nice work" : "Ready"}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button href="/app/today">Start Today</Button>
          <Button href="/app" variant="secondary">Browse</Button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <MiniTile title="Reading" body="Voiceover read-along · echo reading · comprehension" />
        <MiniTile title="Writing" body="Tracing or sentence writing · gentle feedback" />
        <MiniTile title="Maths" body="Adaptive practice · multiple scenarios" />
      </div>
    </Card>
  );
}

function MiniTile({ title, body }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="font-extrabold text-slate-900">{title}</div>
      <div className="mt-1 text-sm text-slate-700">{body}</div>
    </div>
  );
}
