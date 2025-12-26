"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useSession } from '@/components/auth/useSession';

import { Page as PageScaffold } from "@/components/ui/PageScaffold";;
export default function RedeemAccessCodePage() {
  const { session, loading, supabase } = useSession();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState({ loading: false, ok: null, msg: null });

  async function redeem() {
    const trimmed = code.trim();
    if (!trimmed) {
      setStatus({ loading: false, ok: false, msg: "Please enter a code." });
      return;
    }

    setStatus({ loading: true, ok: null, msg: null });
    try {
      const { data, error } = await supabase.rpc("redeem_access_code", { p_code: trimmed });
      if (error) {
        setStatus({ loading: false, ok: false, msg: error.message || "Redeem failed." });
        return;
      }

      if (data?.ok) {
        setStatus({ loading: false, ok: true, msg: "Success! Your account is unlocked." });
        return;
      }

      setStatus({
        loading: false,
        ok: false,
        msg: data?.error || "Redeem failed. Please check the code and try again.",
      });
    } catch (e) {
      setStatus({ loading: false, ok: false, msg: e?.message || "Redeem failed." });
    }
  }

  if (loading) {
    return <div className="text-slate-700">Loading…</div>;
  }

  if (!session) {
    return (
      
      <PageScaffold title="Redeem">
<main className="bg-gradient-to-br from-slate-50 to-white min-h-[70vh]">
        <div className="container-pad py-10">
          <Card className="p-6 max-w-xl">
            <div className="text-2xl font-extrabold">Redeem access code</div>
            <p className="text-slate-700 mt-2">Please sign in to redeem a code.</p>
            <div className="mt-5">
              <Button href="/login">Sign in</Button>
            </div>
          </Card>
        </div>
      </main>
    
      </PageScaffold>
    );
  }

  return (
    <main className="bg-gradient-to-br from-slate-50 to-white min-h-[70vh]">
      <div className="container-pad py-10">
        <div className="grid gap-6 max-w-xl">
          <Card className="p-6">
            <div className="text-2xl font-extrabold">Redeem access code</div>
            <p className="text-slate-700 mt-2">
              Enter a friends &amp; family code to unlock Smart Kidz without creating a subscription.
            </p>

            <div className="mt-5">
              <label className="text-sm font-semibold text-slate-700">Code</label>
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary/40"
                placeholder="e.g. FAMILY-2025-001"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                autoCapitalize="characters"
              />
            </div>

            {status?.msg && (
              <div
                className={`mt-4 text-sm ${status.ok ? "text-emerald-700" : "text-rose-700"}`}
              >
                {status.msg}
              </div>
            )}

            <div className="mt-6 flex gap-3 flex-wrap">
              <Button onClick={redeem} disabled={status.loading}>
                {status.loading ? "Redeeming…" : "Redeem"}
              </Button>
              <Button href="/app" variant="secondary">Back to app</Button>
              <Button href="/pricing" variant="outline">View plans</Button>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}