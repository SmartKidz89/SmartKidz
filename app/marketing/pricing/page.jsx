"use client";

import Image from "next/image";
import Link from "next/link";
import SectionReveal from "@/components/marketing/SectionReveal";
import FAQAccordion from "@/components/marketing/FAQAccordion";

import { Page as PageScaffold } from "@/components/ui/PageScaffold";;
function Container({ children, className = "" }) {
  return <div className={"container-pad " + className}>{children}</div>;
}

const plans = [
  {
    name: "Monthly",
    price: "$11.99",
    period: "/month",
    featured: false,
    desc: "Flexible month-to-month access for the whole family.",
    bullets: [
      "Unlimited kids profiles",
      "All subjects & worlds",
      "Rewards, streaks & avatars",
      "Parent dashboard + weekly insights"
    ],
  },
  {
    name: "Annual",
    price: "$99.99",
    period: "/year",
    featured: true,
    badge: "Best value",
    desc: "Best savings for families who want steady progress all year.",
    bullets: [
      "Unlimited kids profiles",
      "All subjects & worlds",
      "Rewards, streaks & avatars",
      "Parent dashboard + weekly insights"
    ],
    subtext: "Save over 30% vs monthly",
  },
];

export default function PricingPage() {
  return (
    
    <PageScaffold title="Pricing">
<div data-scene className="py-10">
      <Container data-scene className="pt-8 pb-10">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
              Simple pricing, huge learning value.
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Choose a plan that fits your family. All plans include access to Maths, Reading, and Science worlds.
            </p>
            <div className="mt-6 flex gap-3 flex-wrap">
              <Link href="https://app.smartkidz.app/app/login" className="sk-btn-primary">Launch App</Link>
              <Link href="/marketing/features" className="sk-btn-muted">See features</Link>
            </div>
          </div>

          <div className="sk-card overflow-hidden">
            <div className="relative h-64 bg-slate-50">
              <Image src="/illustrations/scenes/pricing-hero.webp" alt="Pricing hero" fill className="object-cover" />
            </div>
          </div>
        </div>
      </Container>

      <Container className="pb-16">
        <div className="grid lg:grid-cols-2 gap-6">
          {plans.map((p) => (
            <div
              key={p.name}
              className={
                "sk-card p-7 " +
                (p.featured ? "ring-2 ring-brand-primary/25 shadow-glow" : "")
              }
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">{p.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">{p.desc}</p>
                </div>
                {p.featured && <span className="sk-chip">{p.badge || "Best value"}</span>}
              </div>

              <div className="mt-6 flex items-end gap-2">
                <span className="text-4xl font-extrabold text-slate-900">{p.price}</span>
                <span className="text-slate-600">{p.period}</span>
              </div>
              {p.subtext && (
                <p className="mt-2 text-sm text-slate-600">{p.subtext}</p>
              )}

              <ul className="mt-6 space-y-2 text-slate-700">
                {p.bullets.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-brand-mint" />
                    <span className="text-sm">{b}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-7">
                <Link href="https://app.smartkidz.app/app/login" className={p.featured ? "sk-btn-primary w-full inline-flex justify-center" : "sk-btn-muted w-full inline-flex justify-center"}>
                  Get started
                </Link>
              </div>
            </div>
          ))}
        </div>
      
      <SectionReveal className="py-14">
        <div className="container-pad grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Pricing FAQ</h2>
            <p className="mt-3 text-slate-600">Transparent, family-friendly pricing.</p>
          </div>
          <div className="lg:col-span-7">
            <FAQAccordion items={[
              { id: "p1", q: "Is pricing per child or per family?", a: "It’s one simple family plan with unlimited kids. Every child gets their own profile, progress, and avatar — all included." },
              { id: "p2", q: "Can multiple kids use different devices at the same time?", a: "Yes. Sessions are per device, so siblings can learn on separate devices at the same time without affecting each other’s progress." },
              { id: "p3", q: "Is SmartKidz ad-free and kid-safe?", a: "Yes. SmartKidz is an ad-free, kid-safe environment with no external links in the learning experience." },
              { id: "p4", q: "Can I cancel anytime?", a: "Yes — you can cancel anytime. Your subscription stays active until the end of the current billing period." },
            ]} />
          </div>
        </div>
      </SectionReveal>

</Container>
    </div>
  
    </Page>
  );
}
      <SectionReveal className="py-14">
        <div className="container-pad">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-extrabold text-slate-900">See what you get</h2>
            <p className="mt-3 text-slate-600">
              Parents get clear, confidence-building insights. Kids get worlds, rewards, and adventures they actually want to come back to.
            </p>
          </div>

          <div className="mt-10 grid lg:grid-cols-2 gap-8 items-center">
            <div className="sk-card p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">Parent Dashboard</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Know exactly what they’re mastering, where they’re improving, and what to do next.
                  </p>
                </div>
                <span className="sk-chip">Insights</span>
              </div>

              <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white">
                <Image
                  src="/illustrations/features/feature-parent-dashboard.webp"
                  alt="Parent dashboard preview"
                  width={1200}
                  height={800}
                  className="h-auto w-full"
                  priority
                />
              </div>

              <ul className="mt-5 space-y-2 text-slate-700">
                <li className="flex gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-brand-mint" /> <span className="text-sm">Time spent learning, by week</span></li>
                <li className="flex gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-brand-mint" /> <span className="text-sm">Strengths vs focus areas</span></li>
                <li className="flex gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-brand-mint" /> <span className="text-sm">Weekly progress emails</span></li>
              </ul>
            </div>

            <div className="sk-card p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">Kids Dashboard</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Worlds, quests, rewards, and avatar upgrades — learning that feels like play.
                  </p>
                </div>
                <span className="sk-chip">Fun</span>
              </div>

              <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white">
                <Image
                  src="/illustrations/app/kids-dashboard-header.webp"
                  alt="Kids dashboard preview"
                  width={1200}
                  height={800}
                  className="h-auto w-full"
                />
              </div>

              <ul className="mt-5 space-y-2 text-slate-700">
                <li className="flex gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-brand-spark" /> <span className="text-sm">Choose Maths, Reading, or Science</span></li>
                <li className="flex gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-brand-spark" /> <span className="text-sm">Earn coins, badges, and streaks</span></li>
                <li className="flex gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-brand-spark" /> <span className="text-sm">Customize your avatar as you learn</span></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 sk-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">One simple plan. Unlimited kids. Everything included.</p>
              <p className="mt-1 text-sm text-slate-600">No ads. No external links. Cancel anytime.</p>
            </div>
            <Link
              href="https://app.smartkidz.app/app/login"
              className="sk-btn-primary inline-flex justify-center"
            >
              Start free trial
            </Link>
          </div>
        </div>
      </SectionReveal>

