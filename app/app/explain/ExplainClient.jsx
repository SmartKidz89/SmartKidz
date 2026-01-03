"use client";

import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import PaywallGate from '@/components/app/PaywallGate';

export default function ExplainClient() {
  const sp = useSearchParams();
  const year = sp.get("year") || "4";

  return (
    <main className="bg-gradient-to-br from-slate-50 to-white min-h-[70vh]">
      <div className="container-pad py-10">
        <PaywallGate>
          <Card className="p-6">
            <div className="text-2xl font-extrabold">Explain It Back · Year {year}</div>
            <p className="mt-2 text-slate-700">
              This is where children explain a concept in their own words (voice or text). The system responds calmly with encouragement and a follow-up prompt.
            </p>
            <div className="mt-5 flex gap-3">
              <Button href="/app" variant="secondary">Back</Button>
              <Button href="/admin" variant="outline">Admin tools</Button>
            </div>
          </Card>
        </PaywallGate>
      </div>
    </main>
  );
}
