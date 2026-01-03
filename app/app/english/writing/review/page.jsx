"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import PaywallGate from '@/components/app/PaywallGate';
import { getSupabaseClient } from "../../../../../lib/supabaseClient";
import AttemptReplay from '@/components/writing/AttemptReplay';

import { Page as PageScaffold } from "@/components/ui/PageScaffold";;
export default function WritingReview() {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const { data: sess } = await supabase.auth.getSession();
        const uid = sess?.session?.user?.id;
        if (!uid) return;

        // Try attempts table; fallback to practice_attempts
        let data = null;
        let error = null;

        const r1 = await supabase
          .from("attempts")
          .select("id,activity_id,response_json,created_at")
          .eq("user_id", uid)
          .ilike("activity_id", "trace_%")
          .order("created_at", { ascending: false })
          .limit(25);

        if (r1?.error) {
          const r2 = await supabase
            .from("attempts")
            .select("id,activity_id,response_json,created_at")
            .eq("user_id", uid)
            .ilike("activity_id", "trace_%")
            .order("created_at", { ascending: false })
            .limit(25);

          if (r2?.error) error = r2.error;
          else data = r2.data;
        } else {
          data = r1.data;
        }

        if (error) throw error;
        setRows(data || []);
        setSelected(data?.[0] || null);
      } catch (e) {
        setMsg(e?.message || "Could not load attempts.");
      }
    }
    load();
  }, [supabase]);

  return (
    
    <PageScaffold title="Review">
<main className="bg-gradient-to-br from-slate-50 to-white min-h-[70vh]">
      <div className="container-pad py-10">
        <PaywallGate>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="text-sm font-semibold text-slate-600">English</div>
              <h1 className="text-3xl font-extrabold tracking-tight">Writing Review</h1>
              <p className="mt-2 text-slate-700 max-w-2xl">
                Review recent writing practice attempts. This is an MVP review screen; next we can add child selection and teacher mappings.
              </p>
            </div>
            <div className="flex gap-2">
              <Button href="/app/english/writing" variant="secondary">Back to Writing</Button>
              <Button href="/app/english" variant="outline">English Hub</Button>
            </div>
          </div>

          {msg && (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              {msg}
            </div>
          )}

          <div className="mt-6 grid gap-4 lg:grid-cols-[360px_1fr]">
            <Card className="p-4">
              <div className="font-extrabold">Recent attempts</div>
              <div className="mt-3 grid gap-2">
                {rows.length === 0 && (
                  <div className="text-sm text-slate-600">No saved attempts yet.</div>
                )}
                {rows.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelected(r)}
                    className={`text-left rounded-2xl border p-3 transition ${
                      selected?.id === r.id ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="text-xs font-semibold text-slate-600">{new Date(r.created_at).toLocaleString()}</div>
                    <div className="font-bold">{r.activity_id}</div>
                  </button>
                ))}
              </div>
            </Card>

            <div className="grid gap-4">
              {selected?.response_json ? (
                <AttemptReplay payload={selected.response_json} />
              ) : (
                <Card className="p-6">
                  <div className="font-extrabold">Select an attempt to preview</div>
                </Card>
              )}
            </div>
          </div>
        </PaywallGate>
      </div>
    </main>
  
    </PageScaffold>
  );
}