"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from '@/components/auth/useSession';
import ChildrenRepeater from '@/components/onboarding/ChildrenRepeater';

import { Page } from "@/components/ui/PageScaffold";
// Schema alignment:
// - public.profiles.full_name (single field)
// - public.children.display_name (single field)

function cleanKids(kids) {
  const cleaned = (kids || [])
    .map((k) => ({
      display_name: (k.display_name || "").trim(),
      year_level: Number.isFinite(k.year_level) ? k.year_level : Number(k.year_level ?? 1),
    }))
    .filter((k) => k.display_name.length > 0);

  for (const k of cleaned) {
    // The DB schema enforces year levels 1..6.
    if (k.year_level < 1 || k.year_level > 6) {
      throw new Error("Please select a valid year level for each child.");
    }
  }
  if (!cleaned.length) throw new Error("Please add at least one child.");
  return cleaned;
}

export default function Onboarding() {
  const { session, loading, supabase } = useSession();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const [fullName, setFullName] = useState("");
  const [kids, setKids] = useState([{ display_name: "", year_level: 1 }]);

  useEffect(() => {
    // If not signed in, send to login.
    if (!loading && !session) router.push("/login");
  }, [loading, session, router]);

  async function saveAll() {
    setBusy(true);
    setMsg(null);

    try {
      if (!session?.user?.id) throw new Error("Not signed in.");

      const parent_id = session.user.id;

      // Upsert profile (minimal fields used by this schema)
      const profileRow = {
        id: parent_id,
        full_name: fullName.trim(),
        role: "parent",
      };

      if (!profileRow.full_name) {
        throw new Error("Please enter your name.");
      }

      const { error: pErr } = await supabase.from("profiles").upsert(profileRow);
      if (pErr) throw pErr;

      const cleaned = cleanKids(kids);

      // Replace children rows (simple approach)
      await supabase.from("children").delete().eq("parent_id", parent_id);

      const { error: cErr } = await supabase.from("children").insert(
        cleaned.map((k) => ({
          parent_id,
          display_name: k.display_name,
          year_level: k.year_level,
          avatar_config: {},
          accessibility_settings: { readAloud: true, captions: true },
          learning_style_defaults: { preferred: "story" },
        }))
      );
      if (cErr) throw cErr;

      // Optional: store some metadata in auth for convenience
      await supabase.auth.updateUser({
        data: { full_name: profileRow.full_name },
      });

      router.push("/app");
    } catch (e) {
      setMsg(e?.message || "Could not save onboarding details.");
    } finally {
      setBusy(false);
    }
  }

  return (
    
    <Page title="Onboarding">
<main className="bg-gradient-to-br from-indigo-50 via-white to-cyan-50 min-h-[70vh]">
      <div className="container-pad py-10">
        <Card className="p-6 max-w-3xl mx-auto">
          <div className="text-sm font-semibold text-slate-600">Set up your account</div>
          <div className="text-2xl font-extrabold mt-1">
            {step === 1 ? "Your details" : "Add children"}
          </div>
          <p className="text-slate-700 mt-2">
            This helps us personalise learning and generate accurate invoices.
          </p>

          {msg && (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-amber-900 text-sm">
              {msg}
            </div>
          )}

          <div className="mt-6">
            {step === 1 && (
              <div className="grid gap-4">
                <label className="grid gap-1">
                  <span className="text-sm font-semibold text-slate-700">Full name</span>
                  <input
                    className="h-11 rounded-2xl border border-slate-300 px-4 outline-none focus:ring-2 focus:ring-slate-900/20"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Zac Smith"
                    required
                  />
                </label>
              </div>
            )}

            {step === 2 && <ChildrenRepeater value={kids} onChange={setKids} />}
          </div>

          <div className="mt-8 flex items-center justify-between gap-3 flex-wrap">
            <Button
              variant="secondary"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={busy || step === 1}
            >
              Back
            </Button>

            <div className="flex gap-2">
              {step < 2 ? (
                <Button onClick={() => setStep(2)} disabled={busy}>
                  Next
                </Button>
              ) : (
                <Button onClick={saveAll} disabled={busy}>
                  {busy ? "Saving…" : "Finish"}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </main>
  
    </Page>
  );
}