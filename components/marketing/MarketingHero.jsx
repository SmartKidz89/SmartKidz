"use client";
import Link from "next/link";
import Image from "next/image";
import { FloatIn } from "./Motion";

export default function MarketingHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="container-pad py-16 sm:py-20 grid lg:grid-cols-2 gap-10 items-center">
        <FloatIn>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 glass px-4 py-2 text-xs font-extrabold text-slate-700 shadow-soft">
            <span className="h-2 w-2 rounded-full bg-brand-mint" />
            Australian Curriculum aligned • Ages 6–12
          </div>

          <h1 className="mt-4 text-4xl sm:text-5xl font-black tracking-tight text-slate-900">
            Make learning feel like a game.
            <span className="block text-brand-primary">Results parents can see.</span>
          </h1>

          <p className="mt-4 text-lg font-semibold text-slate-700 max-w-xl">
            SmartKidz turns Maths, Reading and Science into bite-sized missions,
            rewards, and real progress tracking — so kids stay motivated and parents stay in control.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              href="/marketing/signup"
              className="sk-btn-primary !rounded-full !px-6 !py-3 text-base"
            >
              Start free trial
            </Link>
            <Link
              href="/marketing/features"
              className="sk-btn-muted !rounded-full !px-6 !py-3 text-base"
            >
              See how it works
            </Link>
          </div>

          <div className="mt-6 flex items-center gap-4 text-sm font-bold text-slate-600">
            <div className="flex items-center gap-2">
              <span className="text-xl">⭐</span> Streaks + rewards
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📊</span> Parent analytics
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🧠</span> Adaptive practice
            </div>
          </div>
        </FloatIn>

        <FloatIn delay={0.08}>
          <div className="relative rounded-4xl border border-slate-200 bg-white/70 glass shadow-glow p-4">
            <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-brand-primary/10 blur-2xl" />
            <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-brand-mint/10 blur-2xl" />
            <Image
              src="/illustrations/scenes/home-hero.webp"
              alt="SmartKidz dashboard preview"
              width={920}
              height={520}
              className="w-full h-auto"
              priority
            />
          </div>
        </FloatIn>
      </div>
    </section>
  );
}
