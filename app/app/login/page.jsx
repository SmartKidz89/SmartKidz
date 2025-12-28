"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import AuthCard from "@/components/auth/AuthCard";

import { Page as PageScaffold } from "@/components/ui/PageScaffold";;
export default function Login() {
  return (
    
    <PageScaffold title="Login">
<main className="min-h-screen">
      <div className="relative overflow-hidden">
        {/* soft animated background */}
        <motion.div
          aria-hidden
          className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-sky-200/40 blur-3xl"
          animate={{ x: [0, 24, 0], y: [0, 16, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl"
          animate={{ x: [0, -22, 0], y: [0, -14, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="container-pad py-10 sm:py-14">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-slate-200 px-3 py-1 text-xs font-extrabold text-slate-700 shadow-soft">
                <span className="text-base" aria-hidden>🚀</span>
                Safe, ad-free learning adventures
              </div>

              <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
                Welcome back to SmartKidz
              </h1>
              <p className="mt-4 text-lg font-semibold text-slate-700">
                Kids explore worlds. Parents get clarity. Everyone wins.
              </p>

              <div className="mt-6 grid sm:grid-cols-2 gap-3">
                {[
                  { t: "Daily wins", d: "Short lessons that build confidence fast." },
                  { t: "Parent insight", d: "Strengths + focus areas, with weekly summaries." },
                  { t: "Unlimited kids", d: "One plan for the whole family." },
                  { t: "Kid-safe", d: "No ads, no external links — ever." },
                ].map((x) => (
                  <div key={x.t} className="rounded-3xl bg-white/70 border border-slate-200 p-4 shadow-soft">
                    <div className="text-sm font-black text-slate-900">{x.t}</div>
                    <div className="mt-1 text-sm font-semibold text-slate-600">{x.d}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-3 flex-wrap">
                <Link href="/marketing" className="text-sm font-extrabold text-slate-700 hover:text-slate-900">
                  ← Back to website
                </Link>
                <span className="text-slate-300">•</span>
                <Link href="/marketing/pricing" className="text-sm font-extrabold text-sky-700 hover:text-sky-800">
                  View pricing
                </Link>
                <span className="text-slate-300">•</span>
                <Link href="/demo" className="text-sm font-extrabold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
                  ⚡ Demo Mode
                </Link>
                <Link href="/setup/generate" className="text-sm font-extrabold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg">
                  📦 Generator
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 rounded-[2.25rem] bg-white/40 blur-2xl" aria-hidden />
              <div className="relative rounded-4xl bg-white/80 border border-slate-200 shadow-elevated overflow-hidden">
                <div className="relative h-48 sm:h-56">
                  <Image
                    src="/illustrations/scenes/home-hero.webp"
                    alt="SmartKidz colourful learning world"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-slate-900/5" />
                </div>

                <div className="p-6">
                  <AuthCard mode="login" />

                  <div className="mt-4 text-xs font-semibold text-slate-500">
                    By signing in, you agree to our{" "}
                    <Link href="/marketing/terms" className="font-extrabold text-slate-700 hover:text-slate-900">
                      Terms
                    </Link>
                    {" "}and{" "}
                    <Link href="/marketing/privacy" className="font-extrabold text-slate-700 hover:text-slate-900">
                      Privacy Policy
                    </Link>.
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <div className="sk-chip">✨ Fun</div>
                <div className="sk-chip">🧠 Smart</div>
                <div className="sk-chip">🛡️ Safe</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  
    </PageScaffold>
  );
}