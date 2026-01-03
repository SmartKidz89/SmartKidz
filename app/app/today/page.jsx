"use client";

import Link from "next/link";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import PaywallGate from '@/components/app/PaywallGate';
import TodayProgress from '@/components/today/TodayProgress';
import DailyQuests from '@/components/today/DailyQuests';
import { getSupabaseClient } from "../../../lib/supabaseClient";
import { getTodaySession, markMissionStarted, progressCount, isComplete } from "../../../lib/today/session";
import { Page as PageScaffold } from "@/components/ui/PageScaffold";;

const missionMeta = {
  reading: {
    title: "Reading Mission",
    desc: "Listen, read along, then echo read one sentence. Tap any word to hear it.",
    href: "/app/english/reading?from=today&mission=reading"
  },
  writing: {
    title: "Writing Mission",
    desc: "Trace or write neatly between lines. Neat comes before fast—retry to improve.",
    href: "/app/english/writing?from=today&mission=writing"
  },
  maths: {
    title: "Maths Mission",
    desc: "Warm up one skill with multiple scenarios. Steady practice builds mastery.",
    href: "/app/subjects?from=today&mission=maths"
  }
};

export default function TodayPlanPage() {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [userId, setUserId] = useState("anon");
  const [session, setSession] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess?.session?.user?.id || "anon";
      if (!mounted) return;
      setUserId(uid);
      setSession(getTodaySession(uid));
    })();
    return () => { mounted = false; };
  }, [supabase]);

  const done = progressCount(session);
  const complete = isComplete(session);

  function start(mission) {
    const s = markMissionStarted(userId, mission);
    setSession({ ...s });
  }

  return (
    <PageScaffold badge="Today" title="Today’s Missions" subtitle="Three short missions. One calm routine. Big progress over time.">
    <main className="min-h-[calc(100vh-220px)]">
      <div className="container-pad py-10">
        <PaywallGate>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="text-sm font-semibold text-slate-600">Daily routine</div>
              <h1 className="text-3xl font-extrabold tracking-tight">Today&apos;s Plan</h1>
              <p className="mt-2 text-slate-700 max-w-3xl">
                Complete three small missions: Reading, Writing, then Maths. Short daily practice beats long sessions. You can practise more after you finish.
              </p>
            </div>
            <div className="flex gap-2">
              <Button href="/app" variant="secondary">Back to app</Button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[360px_1fr]">
            <Card className="p-5">
              <div className="font-extrabold">Progress</div>
              <div className="mt-3">
                <TodayProgress value={done} />
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                <div className="font-semibold">Learning guide</div>
                <ul className="mt-2 list-disc pl-5 grid gap-1">
                  <li>Go slow first. Smooth comes with repeats.</li>
                  <li>Retry is a strategy, not a failure.</li>
                  <li>Finish the three missions, then practise more if you want.</li>
                </ul>
              </div>

              {complete && (
                <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="font-extrabold text-emerald-900">All missions complete</div>
                  <div className="mt-1 text-sm text-emerald-900/80">Nice work. Come back tomorrow for a fresh plan.</div>
                  <div className="mt-3">
                    <Button href="/app" variant="secondary">Browse activities</Button>
                  </div>
                </div>
              )}
            </Card>

            <div className="grid gap-4">
              <MissionCard mission="reading" session={session} onStart={() => start("reading")} />
              <MissionCard mission="writing" session={session} onStart={() => start("writing")} />
              <MissionCard mission="maths" session={session} onStart={() => start("maths")} />
            </div>
          </div>
          <DailyQuests />
        </PaywallGate>
      </div>
    </main>
    </PageScaffold>
  );
}

function MissionCard({ mission, session, onStart }) {
  const meta = missionMeta[mission];
  const done = !!session?.missions?.[mission]?.done;

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-sm font-semibold text-slate-600">{done ? "Complete" : "Mission"}</div>
          <div className="text-2xl font-extrabold">{meta.title}</div>
          <p className="mt-2 text-slate-700">{meta.desc}</p>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${done ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-slate-50 border-slate-200 text-slate-700"}`}>
          {done ? "Done" : "Up next"}
        </span>
      </div>

      <div className="mt-4 flex gap-2 flex-wrap">
        <Button href={meta.href} onClick={onStart}>{done ? "Practice again" : "Start"}</Button>
        <Button href="/app/today" variant="secondary">Preview</Button>
      </div>
    </Card>
  );
}