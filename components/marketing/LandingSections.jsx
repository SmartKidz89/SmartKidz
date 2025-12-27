"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

function Container({ children, className = "" }) {
  return <div className={"container-pad " + className}>{children}</div>;
}

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* soft blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-brand-secondary/25 blur-3xl" />
        <div className="absolute top-20 -right-24 h-80 w-80 rounded-full bg-brand-mint/25 blur-3xl" />
        <div className="absolute -bottom-28 left-1/3 h-96 w-96 rounded-full bg-brand-spark/20 blur-3xl" />
      </div>

      <Container className="relative py-16 sm:py-20">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-6">
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 shadow-soft"
            >
              Built for Aussie families • Prep–Year 6
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900"
            >
              Turn learning into an adventure your kids actually want to do.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="text-lg text-slate-600 max-w-xl"
            >
              SmartKidz blends short, game-like lessons with real curriculum alignment,
              so kids build skills fast — and parents stay in control.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Link
                href="https://app.smartkidz.app/app/login"
                className="sk-btn-primary inline-flex justify-center"
              >
                Launch App
              </Link>
              <Link
                href="/marketing/features"
                className="sk-btn-muted inline-flex justify-center"
              >
                See what’s inside
              </Link>
            </motion.div>

            <div className="flex flex-wrap gap-2 pt-2">
              {["Maths", "Reading", "Humanities", "Energy & rewards"].map((t) => (
                <span key={t} className="sk-chip">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-md">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.05 }}
                className="absolute -inset-6 rounded-[2.25rem] bg-white/60 blur-2xl"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.08 }}
                className="relative rounded-[2.25rem] border border-slate-200 bg-white/70 shadow-elevated p-3"
              >
                <div className="grid gap-4">
                  <div className="relative overflow-hidden rounded-[2rem] bg-slate-50 border border-slate-200/60">
                    <div className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full bg-white/85 backdrop-blur px-3 py-1 text-xs font-extrabold text-slate-800 shadow">
                      <span className="text-base">👨‍👩‍👧‍👦</span> Parent view
                    </div>
                    <div className="relative aspect-[16/9]">
                      <Image
                        src="/illustrations/app/parent-dashboard-header.webp"
                        alt="SmartKidz Parent Dashboard preview"
                        fill
                        sizes="(max-width: 1024px) 90vw, 560px"
                        className="object-cover"
                        priority
                      />
                    </div>
                  </div>

                  <div className="relative overflow-hidden rounded-[2rem] bg-slate-50 border border-slate-200/60">
                    <div className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full bg-white/85 backdrop-blur px-3 py-1 text-xs font-extrabold text-slate-800 shadow">
                      <span className="text-base">🧒</span> Kids view
                    </div>
                    <div className="relative aspect-[16/9]">
                      <Image
                        src="/illustrations/app/kids-dashboard-header.webp"
                        alt="SmartKidz Kids Dashboard preview"
                        fill
                        sizes="(max-width: 1024px) 90vw, 560px"
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export function LogoStrip() {
  return (
    <Container className="py-10">
      <div className="sk-card p-6">
        <p className="text-center text-sm font-semibold text-slate-600">
          Inspired by the best learning platforms — designed for Aussie curriculum.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-8 opacity-80">          <span className="text-sm font-extrabold tracking-tight text-slate-800">SmartKidz</span>
          <span className="text-sm font-extrabold text-slate-800">Australian Curriculum</span>
          <span className="text-sm font-extrabold text-slate-800">Multi‑kid accounts</span>
          <span className="text-sm font-extrabold text-slate-800">Weekly reports</span>
        </div>
      </div>
    </Container>
  );
}

export function FeatureGrid() {
  const items = [
    {
      title: "Kid-led learning (not locked)",
      desc: "Kids can choose what they want to practise — you still set goals and guardrails.",
      icon: "🎯",
    },
    {
      title: "Game-style motivation",
      desc: "Streaks, rewards, confetti, and progress paths that keep them coming back.",
      icon: "⚡",
    },
    {
      title: "Parents stay in control",
      desc: "Profiles, settings, accessibility options, and clear progress analytics.",
      icon: "🛡️",
    },
    {
      title: "Aligned to school outcomes",
      desc: "Prep–Year 6 pathways designed to match real learning expectations.",
      icon: "📚",
    },
  ];

  return (
    <Container className="py-14">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          A platform kids love — with real learning underneath.
        </h2>
        <p className="mt-3 text-slate-600">
          Fun visuals, short lessons, and measurable skill growth — without the “boring worksheet” vibe.
        </p>
      </div>

      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {items.map((it) => (
          <div key={it.title} className="sk-card-tappable p-6">
            <div className="text-3xl">{it.icon}</div>
            <h3 className="mt-3 font-extrabold text-slate-900">{it.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{it.desc}</p>
          </div>
        ))}
      </div>
    </Container>
  );
}

export function SubjectTiles() {
  const tiles = [
    { key: "maths", label: "Maths", img: "/illustrations/subjects/world-maths.webp" },
    { key: "english", label: "English", img: "/illustrations/subjects/world-reading.webp" },
    { key: "hass", label: "HASS", img: "/illustrations/subjects/world-science.webp" },
    { key: "hpe", label: "Health & PE", img: "/illustrations/subjects/world-energy.webp", soon: true },
    { key: "languages", label: "Languages", img: "/illustrations/subjects/world-reading.webp", soon: true },
    { key: "technologies", label: "Technologies", img: "/illustrations/subjects/world-energy.webp", soon: true },
    { key: "arts", label: "The Arts", img: "/illustrations/subjects/world-maths.webp", soon: true },
  ];

  const MotionLink = motion(Link);

  const sparkles = [
    { top: "18%", left: "14%", delay: 0.0 },
    { top: "32%", right: "18%", delay: 0.2 },
    { bottom: "18%", left: "22%", delay: 0.35 },
  ];

  return (
    <Container className="py-14">
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900">Choose your world</h2>
          <p className="mt-2 text-slate-600">Each subject has its own vibe, rewards, and mastery map.</p>
        </div>
        <Link href="/marketing/subjects/maths" className="sk-btn-muted">
          Explore subjects
        </Link>
      </div>

      <div className="mt-8 grid md:grid-cols-2 gap-6">
        {tiles.map((t) => (
          <MotionLink
            key={t.key}
            href={`/marketing/subjects/${t.key}`}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.99 }}
            transition={{ type: "spring", stiffness: 420, damping: 26 }}
            className="group sk-card-tappable overflow-hidden relative"
          >
            <div className="relative h-44 sm:h-52">
              <motion.div
                aria-hidden
                className="absolute inset-0"
                initial={false}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.5 }}
              >
                <Image src={t.img} alt={`${t.label} world`} fill className="object-cover" />
              </motion.div>
              <div className="absolute inset-0 bg-slate-900/5 group-hover:bg-slate-900/0 transition-colors" />

              {/* playful sparkles */}
              {sparkles.map((s, idx) => (
                <motion.span
                  key={idx}
                  aria-hidden
                  className="absolute h-3 w-3 rounded-full bg-white/85 shadow-soft"
                  style={{ top: s.top, left: s.left, right: s.right, bottom: s.bottom }}
                  initial={{ opacity: 0.0, scale: 0.6, y: 6 }}
                  whileInView={{ opacity: 0.9, scale: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  animate={{
                    y: [0, -6, 0],
                    opacity: [0.75, 1, 0.75],
                    scale: [1, 1.15, 1],
                  }}
                  transition={{
                    duration: 2.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: s.delay,
                  }}
                />
              ))}

              {/* mascot peek */}
              <motion.div
                aria-hidden
                className="absolute -bottom-4 -right-4 h-16 w-16 rounded-3xl border border-white/60 bg-white/70 shadow-elevated grid place-items-center"
                initial={{ rotate: -8, scale: 0.98 }}
                whileHover={{ rotate: 6, scale: 1.03 }}
                transition={{ type: "spring", stiffness: 380, damping: 20 }}
              >
                <span className="text-2xl">👋</span>
              </motion.div>
            </div>
            <div className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">World</p>
                <p className="text-xl font-extrabold text-slate-900">{t.label}</p>
              </div>
              <motion.span
                aria-hidden
                className="text-slate-500 group-hover:text-slate-900 transition-colors"
                initial={{ x: 0 }}
                whileHover={{ x: 6 }}
                transition={{ type: "spring", stiffness: 420, damping: 24 }}
              >
                →
              </motion.span>
            </div>
          </MotionLink>
        ))}
      </div>
    </Container>
  );
}

export function CTA() {
  return (
    <Container className="py-14">
      <div className="relative overflow-hidden rounded-4xl border border-slate-200 bg-white/70 shadow-elevated p-8 sm:p-10">
        <div aria-hidden className="absolute inset-0 opacity-70 bg-grid-soft" />
        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Ready to make learning feel effortless?
            </h3>
            <p className="mt-2 text-slate-600">
              Create a parent account, add your kids, and let them explore worlds at their own pace.
            </p>
          </div>
          <Link href="https://app.smartkidz.app/app/login" className="sk-btn-primary">
            Launch App
          </Link>
        </div>
      </div>
    </Container>
  );
}