"use client";

import Section from '@/components/ui/Section';
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, Sparkles } from "lucide-react";
import { useSession } from '@/components/auth/useSession';
import { useSearchParams } from "next/navigation";

const INCLUDED = [
  "Full access to Years 1–6 (Maths, English, Science) + Reading Studio (Prep–Year 3)",
  "Writing & Tracing Studio: guided lines, A–Z and a–z tracing, and path matching feedback",
  "Reading Studio: read-along voiceover, echo reading (record + replay), sight words, comprehension",
  "Lesson Builder (Parents & Teachers): generate interactive lesson plans with quizzes and memory tips",
  "Unlimited adaptive practice loops",
  "Learning styles: Story · Game · Voice · Visual",
  "Accessibility: read-aloud, captions, voice answers",
  "Calm gamification: XP, streaks, badges, avatars",
  "Parent insights dashboard"
];

async function startCheckout(plan, parentId, email) {
  const res = await fetch("/api/stripe/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan, parentId, email })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Checkout failed");
  window.location.href = data.url;
}

export default function PricingClient() {
  const { session, loading } = useSession();
  const sp = useSearchParams();
  const canceled = sp.get("canceled");

  return (
    <main>
      <section className="bg-gradient-to-br from-slate-50 to-white border-b border-slate-200">
        <div className="container-pad py-16">
          <h1 className="text-4xl font-extrabold tracking-tight">Pricing</h1>
          <p className="mt-3 text-slate-700 max-w-2xl">
            Simple plans. Cancel anytime. Start with a free trial and unlock the full Smart Kidz experience.
          </p>
          {canceled && (
            <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900">
              Checkout canceled — you can try again anytime.
            </div>
          )}
        </div>
      </section>

      <Section>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="p-6 lg:col-span-2">
            <div className="font-extrabold text-2xl">What you get</div>
            <div className="mt-4 grid gap-3">
              {INCLUDED.map((x) => (
                <div key={x} className="flex items-start gap-2 text-slate-800">
                  <CheckCircle2 className="h-5 w-5 mt-0.5" />
                  <span>{x}</span>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-xl">Monthly</div>
                  <div className="text-sm text-slate-600">Flexible · cancel anytime</div>
                </div>
                <div className="text-xs font-bold bg-slate-100 px-3 py-1 rounded-full">Trial</div>
              </div>
              <div className="mt-5 text-4xl font-extrabold">$11.99</div>
              <div className="text-slate-600">per month</div>

              <div className="mt-6">
                {!loading && !session ? (
                  <Button href="/signup?plan=monthly" className="w-full">
                    Start Free Trial <Sparkles className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={() => startCheckout("monthly", session?.user?.id, session?.user?.email)} className="w-full">
                    Start Free Trial <Sparkles className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="mt-3 text-xs text-slate-500">Price placeholders — update anytime.</div>
            </Card>

            <Card className="p-6 border-2 border-slate-900">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-xl">Annual</div>
                  <div className="text-sm text-slate-600">Best value</div>
                </div>
                <div className="text-xs font-bold bg-brand-primary text-white px-3 py-1 rounded-full">Most Popular</div>
              </div>
              <div className="mt-5 text-4xl font-extrabold">$99.99</div>
              <div className="text-slate-600">per year</div>

              <div className="mt-6">
                {!loading && !session ? (
                  <Button href="/signup?plan=annual" className="w-full">
                    Start Free Trial <Sparkles className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={() => startCheckout("annual", session?.user?.id, session?.user?.email)} className="w-full">
                    Start Free Trial <Sparkles className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="mt-3 text-xs text-slate-500">Save vs monthly (example).</div>
            </Card>
          </div>
        </div>
      </Section>
    </main>
  );
}
