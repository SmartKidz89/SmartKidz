"use client";

import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import PaywallGate from '@/components/app/PaywallGate';

export default function PracticeClient() {
  const sp = useSearchParams();
  const year = sp.get("year") || "4";

  return (
    <main className="bg-gradient-to-br from-indigo-50 via-white to-cyan-50 min-h-[70vh]">
      <div className="container-pad py-10">
        <PaywallGate>
          <Card className="p-6">
            <div className="text-2xl font-extrabold">5‑Minute Smart Practice · Year {year}</div>
            <p className="mt-2 text-slate-700">
              This screen will auto-pick the right skills (review + strengthen + light challenge) and run a short practice set.
            </p>
            <div className="mt-5 flex gap-3">
              <Button href="/app" variant="secondary">Back</Button>
              <Button href="/app/world?subject=MATH&year=4" variant="outline">Go to Worlds</Button>
            </div>
          </Card>
        </PaywallGate>
      </div>
    </main>
  );
}
